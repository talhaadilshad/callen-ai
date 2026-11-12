// POST /api/numbers — get a phone number for an agent.
//
// Urdu (Uplift) agents: Uplift has no API to buy numbers. A dedicated
// Pakistani number is assigned on request and routed to the assistant on
// their side, so this stores a 'provisioning' request that a platform
// admin fulfils (POST /api/admin/numbers/:id).
// English (Retell) agents: buys a Retell-managed US number right away.
//
// Auth: session cookie for the agent lookup (RLS-scoped). Numbers cost
// money, so only workspace owners/admins may ask, capped per workspace.
// phone_numbers is written with the service role: users can only read it.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { retell, isRetellConfigured } from "@/lib/retell/client";

const NUMBER_MONTHLY_COST_CENTS = 200; // Retell-managed: $2/mo
const MAX_NUMBERS_PER_WORKSPACE = 5;   // active + requested

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    agentId?: string;
    areaCode?: number;
    preferredCity?: string;
    note?: string;
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
      { error: "Only workspace owners and admins can get numbers." },
      { status: 403 }
    );
  }

  if (!agent.provider_agent_id) {
    return NextResponse.json(
      { error: "Publish the agent first, so the number has something to ring." },
      { status: 409 }
    );
  }

  const admin = createAdminClient();
  const { count } = await admin
    .from("phone_numbers")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", agent.workspace_id)
    .in("status", ["active", "provisioning"]);
  if ((count ?? 0) >= MAX_NUMBERS_PER_WORKSPACE) {
    return NextResponse.json(
      { error: `This workspace already has ${MAX_NUMBERS_PER_WORKSPACE} numbers, the current limit.` },
      { status: 409 }
    );
  }

  // ---- Urdu agents: store a request for a Pakistani number ----
  if (agent.provider === "uplift") {
    const { data: requestRow, error: requestError } = await admin
      .from("phone_numbers")
      .insert({
        workspace_id: agent.workspace_id,
        agent_id: agent.id,
        provider: "uplift",
        status: "provisioning",
        requested_by: user.id,
        preferred_city: body.preferredCity?.trim().slice(0, 80) || null,
        note: body.note?.trim().slice(0, 500) || null,
      })
      .select()
      .single();
    if (requestError) {
      // Unique index: one open request per agent.
      const duplicate = requestError.code === "23505";
      return NextResponse.json(
        { error: duplicate ? "This agent already has a number being set up." : requestError.message },
        { status: duplicate ? 409 : 500 }
      );
    }
    return NextResponse.json({ number: requestRow, requested: true });
  }

  // ---- English agents: buy a Retell number now ----
  if (!isRetellConfigured()) {
    return NextResponse.json(
      { error: "Voice runtime is not configured (RETELL_API_KEY missing)." },
      { status: 503 }
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
      requested_by: user.id,
      activated_at: new Date().toISOString(),
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
