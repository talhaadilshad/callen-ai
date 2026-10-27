// POST /api/agents/:id/voice-session — start a browser "Talk live"
// conversation with a published Urdu (Uplift) agent. Returns the LiveKit
// token + URL the browser joins with. Auth: session cookie; RLS scopes
// the agent lookup. Every session costs runtime minutes, so starts are
// rate-limited per user and per workspace.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isUpliftConfigured, UpliftError } from "@/lib/uplift/client";
import { createUpliftWebSession } from "@/lib/uplift/sessions";

const USER_COOLDOWN_SECONDS = 30;
const WORKSPACE_SESSIONS_PER_DAY = 30;

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

  const { data: agent, error } = await supabase
    .from("agents")
    .select("id, workspace_id, provider, provider_agent_id")
    .eq("id", id)
    .single();
  if (error || !agent) {
    return NextResponse.json({ error: "Agent not found." }, { status: 404 });
  }
  if (agent.provider !== "uplift" || !agent.provider_agent_id) {
    return NextResponse.json(
      { error: "Talk live works for published Urdu agents. Publish the agent first." },
      { status: 409 }
    );
  }
  if (!isUpliftConfigured()) {
    return NextResponse.json(
      { error: "Voice runtime is not configured (UPLIFT_API_KEY missing)." },
      { status: 503 }
    );
  }

  const admin = createAdminClient();
  const now = Date.now();
  const [{ count: recentForUser }, { count: todayForWorkspace }] = await Promise.all([
    admin
      .from("voice_sessions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", new Date(now - USER_COOLDOWN_SECONDS * 1000).toISOString()),
    admin
      .from("voice_sessions")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", agent.workspace_id)
      .gte("created_at", new Date(now - 24 * 60 * 60 * 1000).toISOString()),
  ]);
  if (recentForUser) {
    return NextResponse.json(
      { error: `Please wait ${USER_COOLDOWN_SECONDS} seconds between test calls.` },
      { status: 429 }
    );
  }
  if ((todayForWorkspace ?? 0) >= WORKSPACE_SESSIONS_PER_DAY) {
    return NextResponse.json(
      { error: `This workspace has used its ${WORKSPACE_SESSIONS_PER_DAY} test calls for today.` },
      { status: 429 }
    );
  }

  let session;
  try {
    session = await createUpliftWebSession(agent.provider_agent_id, `callen-${user.id.slice(0, 8)}`);
  } catch (err) {
    const status = err instanceof UpliftError && err.status === 402 ? 402 : 502;
    const message =
      status === 402
        ? "The voice runtime is out of credits."
        : err instanceof Error
          ? err.message
          : "Unknown runtime error";
    return NextResponse.json({ error: message }, { status });
  }

  const { error: logError } = await admin.from("voice_sessions").insert({
    workspace_id: agent.workspace_id,
    agent_id: agent.id,
    user_id: user.id,
    provider: "uplift",
    room_name: session.roomName,
  });
  if (logError) console.error("[voice-session] could not log session:", logError.message);

  return NextResponse.json({ token: session.token, wsUrl: session.wsUrl });
}
