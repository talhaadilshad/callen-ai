// DELETE /api/numbers/:id — cancel a number request that hasn't been
// fulfilled yet. Live numbers are not released here: that is arranged
// with the telephony provider. Auth: session cookie; owners/admins only.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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

  // RLS: members only see their own workspace's numbers.
  const { data: row, error } = await supabase
    .from("phone_numbers")
    .select("id, workspace_id, status")
    .eq("id", id)
    .single();
  if (error || !row) {
    return NextResponse.json({ error: "Number not found." }, { status: 404 });
  }

  const { data: membership } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", row.workspace_id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (membership?.role !== "owner" && membership?.role !== "admin") {
    return NextResponse.json(
      { error: "Only workspace owners and admins can cancel a request." },
      { status: 403 }
    );
  }

  if (row.status !== "provisioning") {
    return NextResponse.json(
      { error: "This number is already live. Contact support to release it." },
      { status: 409 }
    );
  }

  const { error: deleteError } = await createAdminClient()
    .from("phone_numbers")
    .delete()
    .eq("id", id)
    .eq("status", "provisioning");
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }
  return new NextResponse(null, { status: 204 });
}
