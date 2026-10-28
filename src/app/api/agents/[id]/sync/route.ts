// POST /api/agents/:id/sync — push an agent's config to its voice
// runtime (Retell for English, Uplift for Urdu; chosen from the agent's
// language). Auth: session cookie; RLS scopes the agent lookup to the
// caller's workspaces, so a foreign id simply 404s. The provider ids are
// written with the service role because members cannot write them.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  runtimeForLanguage,
  isRuntime,
  isRuntimeConfigured,
  runtimeEnvVar,
  syncToRuntime,
  deleteFromRuntime,
  type CallenAgentRow,
} from "@/lib/voice-runtime";
import { restaurantFactsSection, type RestaurantProfile } from "@/lib/agent-meta";
import { menuSection } from "@/lib/menu";
import { knowledgeSection } from "@/lib/knowledge";

// The UI warns at KNOWLEDGE_CHAR_BUDGET; this keeps a runaway knowledge
// base from producing instructions Uplift might reject.
const KNOWLEDGE_HARD_CAP = 60000;

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("agents")
    .select("id, workspace_id, name, system_prompt, greeting, voice_id, language, provider, provider_agent_id, provider_llm_id, settings")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Agent not found." }, { status: 404 });
  }
  let agent = data as CallenAgentRow;

  const runtime = runtimeForLanguage(agent.language);
  if (!isRuntimeConfigured(runtime)) {
    return NextResponse.json(
      { error: `Voice runtime is not configured (${runtimeEnvVar(runtime)} missing).` },
      { status: 503 }
    );
  }

  const admin = createAdminClient();

  // Language changed runtimes (e.g. English -> Urdu): tear down the old
  // runtime agent first, unless a number still routes to it.
  if (agent.provider_agent_id && agent.provider !== runtime) {
    const { count } = await admin
      .from("phone_numbers")
      .select("id", { count: "exact", head: true })
      .eq("agent_id", agent.id)
      .eq("status", "active");
    if (count) {
      return NextResponse.json(
        { error: "This agent has a phone number on its current voice runtime. Move the number before changing the agent's language." },
        { status: 409 }
      );
    }
    if (isRuntime(agent.provider)) {
      await deleteFromRuntime(agent.provider, {
        providerAgentId: agent.provider_agent_id,
        providerLlmId: agent.provider_llm_id,
      });
    }
    agent = { ...agent, provider_agent_id: null, provider_llm_id: null };
  }

  // Urdu (Uplift) agents get the restaurant details + the Knowledge Base
  // (menu, deals, info, policies, FAQs) appended to their instructions,
  // so editing the Knowledge Base and re-syncing is all it takes to update
  // what the agent knows.
  if (runtime === "uplift") {
    const [menu, docs] = await Promise.all([
      admin
        .from("menu_items")
        .select("kind, category, name, description, price_pkr, available, sort")
        .eq("workspace_id", agent.workspace_id),
      admin
        .from("knowledge_docs")
        .select("kind, title, content, enabled, sort")
        .eq("workspace_id", agent.workspace_id),
    ]);
    const loadError = menu.error ?? docs.error;
    if (loadError) {
      return NextResponse.json({ error: `Could not load the knowledge base: ${loadError.message}` }, { status: 500 });
    }
    const knowledge = [
      "Everything below is this restaurant's own information. Answer only from it.",
      restaurantFactsSection(
        agent.settings?.restaurant as Partial<RestaurantProfile> | undefined,
        agent.settings?.website as string | undefined
      ),
      menuSection(menu.data ?? []),
      knowledgeSection(docs.data ?? []),
    ]
      .filter(Boolean)
      .join("\n\n");
    agent = { ...agent, knowledge: knowledge.slice(0, KNOWLEDGE_HARD_CAP) };
  }

  let result;
  try {
    result = await syncToRuntime(runtime, agent);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown runtime error";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const { error: updateError } = await admin
    .from("agents")
    .update({
      provider: runtime,
      provider_agent_id: result.providerAgentId,
      provider_llm_id: result.providerLlmId,
      status: "active",
    })
    .eq("id", id);

  if (updateError) {
    // Roll back anything we just created so the next sync starts clean.
    await deleteFromRuntime(runtime, {
      providerAgentId: result.createdAgent ? result.providerAgentId : null,
      providerLlmId: result.createdLlm ? result.providerLlmId : null,
    });
    return NextResponse.json(
      { error: `Runtime sync could not be saved: ${updateError.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({
    runtime,
    providerAgentId: result.providerAgentId,
    providerLlmId: result.providerLlmId,
  });
}
