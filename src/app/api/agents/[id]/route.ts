// DELETE /api/agents/:id — delete an agent and tear down what it owns on
// the voice runtime. Bound numbers are kept (the workspace paid for
// them) but unbound on Retell, so they stop answering as a dead agent.
// Auth: session cookie; the row delete runs under RLS.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { retell, isRetellConfigured } from "@/lib/retell/client";
import { deleteRetellAgent } from "@/lib/retell/agent-sync";

export async function DELETE(
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
    .select("id, provider_agent_id, provider_llm_id")
    .eq("id", id)
    .single();
  if (error || !agent) {
    return NextResponse.json({ error: "Agent not found." }, { status: 404 });
  }

  // Read bindings before the delete: the FK nulls phone_numbers.agent_id.
  const admin = createAdminClient();
  const { data: numbers } = await admin
    .from("phone_numbers")
    .select("provider_number_id")
    .eq("agent_id", id)
    .eq("status", "active");

  const { data: deleted, error: deleteError } = await supabase
    .from("agents")
    .delete()
    .eq("id", id)
    .select("id");
  if (deleteError || !deleted?.length) {
    return NextResponse.json(
      { error: deleteError?.message ?? "Agent could not be deleted." },
      { status: deleteError ? 500 : 404 }
    );
  }

  if (isRetellConfigured()) {
    for (const n of numbers ?? []) {
      if (!n.provider_number_id) continue;
      await retell()
        .phoneNumber.update(n.provider_number_id, { inbound_agents: null })
        .catch(() => {});
    }
    await deleteRetellAgent({
      providerAgentId: agent.provider_agent_id,
      providerLlmId: agent.provider_llm_id,
    });
  }

  return new NextResponse(null, { status: 204 });
}
