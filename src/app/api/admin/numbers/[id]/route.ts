// POST /api/admin/numbers/:id — fulfil a number request: record the
// number Uplift assigned and mark it active. Platform admins only. Uplift
// routes the number to the assistant on their side; this is what makes it
// show up in the restaurant's dashboard.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isPlatformAdmin } from "@/lib/platform-admin";

// E.164: "+" then 8 to 15 digits, e.g. +92511234567.
const E164 = /^\+[1-9]\d{7,14}$/;

export async function POST(
  request: NextRequest,
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
  if (!isPlatformAdmin(user.email)) {
    return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as { e164?: string } | null;
  const e164 = body?.e164?.replace(/[\s-]/g, "") ?? "";
  if (!E164.test(e164)) {
    return NextResponse.json(
      { error: "Enter the number in international format, for example +92511234567." },
      { status: 400 }
    );
  }

  const { data, error } = await createAdminClient()
    .from("phone_numbers")
    .update({
      e164,
      provider_number_id: e164,
      status: "active",
      activated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("status", "provisioning")
    .select("id, e164, status")
    .maybeSingle();

  if (error) {
    const duplicate = error.code === "23505";
    return NextResponse.json(
      { error: duplicate ? "That number is already assigned to another agent." : error.message },
      { status: duplicate ? 409 : 500 }
    );
  }
  if (!data) {
    return NextResponse.json({ error: "Request not found, or already fulfilled." }, { status: 404 });
  }
  return NextResponse.json({ number: data });
}
