// POST /api/agents/:id/sync — push an agent's config to the voice
// runtime. Auth: session cookie; RLS scopes the agent lookup to the
// caller's workspaces, so a foreign id simply 404s. The provider ids are
// written with the service role because members cannot write them.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isRetellConfigured } from "@/lib/retell/client";
import {
  syncAgentToRetell,
  deleteRetellAgent,
  type CallenAgentRow,
} from "@/lib/retell/agent-sync";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!isRetellConfigured()) {
    return NextResponse.json(
      { error: "Voice runtime is not configured (RETELL_API_KEY missing)." },
      { status: 503 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { data: agent, error } = await supabase
    .from("agents")
    .select("id, workspace_id, name, system_prompt, greeting, voice_id, language, provider_agent_id, provider_llm_id, settings")
    .eq("id", id)
    .single();

  if (error || !agent) {
    return NextResponse.json({ error: "Agent not found." }, { status: 404 });
  }

  let result;
  try {
    result = await syncAgentToRetell(agent as CallenAgentRow);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown runtime error";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const { error: updateError } = await createAdminClient()
    .from("agents")
    .update({
      provider: "retell",
      provider_agent_id: result.providerAgentId,
      provider_llm_id: result.providerLlmId,
      status: "active",
    })
    .eq("id", id);

  if (updateError) {
    // Roll back anything we just created so the next sync starts clean.
    await deleteRetellAgent({
      providerAgentId: result.createdAgent ? result.providerAgentId : null,
      providerLlmId: result.createdLlm ? result.providerLlmId : null,
    });
    return NextResponse.json(
      { error: `Runtime sync could not be saved: ${updateError.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({
    providerAgentId: result.providerAgentId,
    providerLlmId: result.providerLlmId,
  });
}
