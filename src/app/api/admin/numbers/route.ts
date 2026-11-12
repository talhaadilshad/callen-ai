// GET /api/admin/numbers — open number requests across every workspace,
// for the Callen team to fulfil with Uplift. Answers { admin: false } for
// everyone else, so the dashboard can ask without raising an error.

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isPlatformAdmin } from "@/lib/platform-admin";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  if (!isPlatformAdmin(user.email)) {
    return NextResponse.json({ admin: false });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("phone_numbers")
    .select(
      "id, preferred_city, note, created_at, requested_by, workspaces(name), agents(name, provider_agent_id)"
    )
    .eq("status", "provisioning")
    .order("created_at", { ascending: true });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  type Row = {
    id: string;
    preferred_city: string | null;
    note: string | null;
    created_at: string;
    requested_by: string | null;
    workspaces: { name: string } | { name: string }[] | null;
    agents:
      | { name: string; provider_agent_id: string | null }
      | { name: string; provider_agent_id: string | null }[]
      | null;
  };
  const one = <T,>(v: T | T[] | null): T | null => (Array.isArray(v) ? v[0] ?? null : v);

  const requests = await Promise.all(
    ((data ?? []) as Row[]).map(async (r) => {
      const requester = r.requested_by
        ? (await admin.auth.admin.getUserById(r.requested_by)).data.user?.email ?? null
        : null;
      return {
        id: r.id,
        workspace: one(r.workspaces)?.name ?? "Unknown workspace",
        agent: one(r.agents)?.name ?? "Deleted agent",
        upliftAssistantId: one(r.agents)?.provider_agent_id ?? null,
        preferredCity: r.preferred_city,
        note: r.note,
        requestedBy: requester,
        createdAt: r.created_at,
      };
    })
  );

  return NextResponse.json({ admin: true, requests });
}
