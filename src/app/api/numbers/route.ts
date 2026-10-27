// POST /api/numbers — buy a Retell-managed number and bind it to an
// agent. Auth: session cookie for the agent lookup (RLS-scoped); buying
// costs money, so only workspace owners/admins may do it, capped per
// workspace. The phone_numbers insert uses the service role because
// users are intentionally not allowed to write that table.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { retell, isRetellConfigured } from "@/lib/retell/client";

const NUMBER_MONTHLY_COST_CENTS = 200; // Retell-managed: $2/mo
const MAX_ACTIVE_NUMBERS_PER_WORKSPACE = 5;

export async function POST(request: NextRequest) {
  if (!isRetellConfigured()) {
    return NextResponse.json(
      { error: "Voice runtime is not configured (RETELL_API_KEY missing)." },
      { status: 503 }
    );
  }

  const body = (await request.json().catch(() => null)) as {
    agentId?: string;
    areaCode?: number;
  } | null;
  if (!body?.agentId) {
    return NextResponse.json({ error: "agentId is required." }, { status: 400 });
  }
  const areaCode = body.areaCode;
  if (areaCode !== undefined && !(Number.isInteger(areaCode) && areaCode >= 200 && areaCode <= 999)) {
    return NextResponse.json({ error: "areaCode must be a 3-digit US area code." }, { status: 400 });
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
    .select("id, workspace_id, name, provider, provider_agent_id")
    .eq("id", body.agentId)
    .single();

  if (error || !agent) {
    return NextResponse.json({ error: "Agent not found." }, { status: 404 });
  }

  const { data: membership } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", agent.workspace_id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (membership?.role !== "owner" && membership?.role !== "admin") {
    return NextResponse.json(
      { error: "Only workspace owners and admins can buy numbers." },
      { status: 403 }
    );
  }

  if (agent.provider === "uplift") {
    return NextResponse.json(
      { error: "Urdu agents get their Pakistani number from Uplift AI on request. It can't be bought here yet." },
      { status: 409 }
    );
  }
  if (!agent.provider_agent_id) {
    return NextResponse.json(
      { error: "Agent has not been synced to the voice runtime yet. Save the agent first." },
      { status: 409 }
    );
  }

  const admin = createAdminClient();
  const { count } = await admin
    .from("phone_numbers")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", agent.workspace_id)
    .eq("status", "active");
  if ((count ?? 0) >= MAX_ACTIVE_NUMBERS_PER_WORKSPACE) {
    return NextResponse.json(
      { error: `This workspace already has ${MAX_ACTIVE_NUMBERS_PER_WORKSPACE} numbers, the current limit.` },
      { status: 409 }
    );
  }

  let purchased;
  try {
    purchased = await retell().phoneNumber.create({
      area_code: areaCode,
      nickname: `${agent.name} (Callen)`,
      inbound_agents: [{ agent_id: agent.provider_agent_id, weight: 1 }],
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown runtime error";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const { data: numberRow, error: insertError } = await admin
    .from("phone_numbers")
    .insert({
      workspace_id: agent.workspace_id,
      agent_id: agent.id,
      e164: purchased.phone_number,
      provider: "retell",
      provider_number_id: purchased.phone_number,
      status: "active",
      monthly_cost_cents: NUMBER_MONTHLY_COST_CENTS,
    })
    .select()
    .single();

  if (insertError) {
    // Release it so we don't keep paying for a number nobody can see.
    const released = await retell()
      .phoneNumber.delete(purchased.phone_number)
      .then(() => true, () => false);
    return NextResponse.json(
      {
        error: released
          ? `Could not save the number, so it was released: ${insertError.message}`
          : `Number ${purchased.phone_number} was bought but could not be saved or released. Release it in the Retell dashboard: ${insertError.message}`,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ number: numberRow });
}
