// POST /api/webhooks/retell — ingestion point for call lifecycle events
// (call_started, call_ended, call_analyzed). Signature-verified, stored
// raw for idempotency/debugging, then projected into calls / call_turns /
// usage_events with the service role.
//
// Failure handling: if processing fails we answer 5xx so Retell
// redelivers. A redelivery of an event that is stored but not yet
// processed is processed again; one that already succeeded is a no-op.
// Every write below is safe to repeat.

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyRetellSignature } from "@/lib/retell/webhook-signature";

type RetellTranscriptTurn = {
  role: "agent" | "user" | "transfer_target";
  content: string;
  words?: { start?: number }[];
};

type RetellWebhookCall = {
  call_id: string;
  agent_id?: string;
  direction?: "inbound" | "outbound";
  from_number?: string;
  to_number?: string;
  start_timestamp?: number;
  end_timestamp?: number;
  duration_ms?: number;
  disconnection_reason?: string;
  recording_url?: string;
  transcript_object?: RetellTranscriptTurn[];
  call_cost?: { combined_cost?: number }; // cents
  call_analysis?: {
    call_summary?: string;
    user_sentiment?: "Negative" | "Positive" | "Neutral" | "Unknown";
    call_successful?: boolean;
    in_voicemail?: boolean;
  };
};

type RetellWebhookBody = {
  event: "call_started" | "call_ended" | "call_analyzed";
  call: RetellWebhookCall;
};

type Admin = ReturnType<typeof createAdminClient>;

// supabase-js returns errors instead of throwing; this turns them into
// exceptions so a failed write can never be recorded as processed.
function must<T>(res: { data: T; error: { message: string } | null }, what: string): T {
  if (res.error) throw new Error(`${what}: ${res.error.message}`);
  return res.data;
}

function mapStatus(reason: string | undefined): string {
  if (!reason) return "completed";
  if (reason === "voicemail_reached") return "voicemail";
  if (reason === "call_transfer" || reason === "transfer_bridged") return "transferred";
  if (reason === "dial_no_answer" || reason === "dial_busy") return "no_answer";
  if (reason.startsWith("error_")) return "failed";
  return "completed";
}

const toIso = (ms: number | undefined) => (ms ? new Date(ms).toISOString() : undefined);
const toCents = (c: number | undefined) => (c === undefined ? undefined : Math.round(c));

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-retell-signature");
  const webhookKey = process.env.RETELL_WEBHOOK_API_KEY ?? process.env.RETELL_API_KEY;

  if (!verifyRetellSignature(rawBody, signature, webhookKey)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let body: RetellWebhookBody;
  try {
    body = JSON.parse(rawBody) as RetellWebhookBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }
  if (!body.call?.call_id || !body.event) {
    return NextResponse.json({ error: "Missing event or call_id." }, { status: 400 });
  }

  const admin = createAdminClient();
  const eventKey = `${body.event}:${body.call.call_id}`;

  // Store raw event first; the unique key dedupes redeliveries.
  const { error: insertEventError } = await admin
    .from("webhook_events")
    .insert({
      provider: "retell",
      event_type: body.event,
      provider_event_id: eventKey,
      payload: body,
    });
  if (insertEventError) {
    if (insertEventError.code !== "23505") {
      // Nothing stored: let Retell retry.
      return NextResponse.json({ error: "Could not store event." }, { status: 500 });
    }
    const { data: stored } = await admin
      .from("webhook_events")
      .select("processed")
      .eq("provider_event_id", eventKey)
      .maybeSingle();
    if (stored?.processed) return new NextResponse(null, { status: 204 });
    // Stored but a previous attempt failed: fall through and retry.
  }

  let processingError: string | null = null;
  try {
    await processEvent(admin, body);
  } catch (err) {
    processingError = err instanceof Error ? err.message : "unknown error";
  }

  await admin
    .from("webhook_events")
    .update({ processed: !processingError, error: processingError })
    .eq("provider_event_id", eventKey);

  if (processingError) {
    return NextResponse.json({ error: "Processing failed." }, { status: 500 });
  }
  return new NextResponse(null, { status: 204 });
}

async function processEvent(admin: Admin, body: RetellWebhookBody) {
  const call = body.call;

  // Resolve workspace + agent from the Retell agent id we stored at sync.
  if (!call.agent_id) throw new Error("missing agent_id");
  const agentRow = must(
    await admin
      .from("agents")
      .select("id, workspace_id")
      .eq("provider", "retell")
      .eq("provider_agent_id", call.agent_id)
      .maybeSingle(),
    "resolve agent"
  );
  if (!agentRow) throw new Error(`no agent for provider agent ${call.agent_id}`);
  const workspaceId: string = agentRow.workspace_id;
  const agentId: string = agentRow.id;

  if (body.event === "call_started") {
    // Insert only: a late or retried call_started must never overwrite a
    // row that call_ended has already completed.
    must(
      await admin.from("calls").upsert(
        {
          workspace_id: workspaceId,
          agent_id: agentId,
          phone_number_id: await resolvePhoneNumberId(admin, workspaceId, call),
          provider_call_id: call.call_id,
          direction: call.direction ?? "inbound",
          from_e164: call.from_number ?? null,
          to_e164: call.to_number ?? null,
          status: "in_progress",
          started_at: toIso(call.start_timestamp) ?? new Date().toISOString(),
        },
        { onConflict: "provider_call_id", ignoreDuplicates: true }
      ),
      "insert call"
    );
    return;
  }

  if (body.event === "call_ended") {
    const durationSeconds = call.duration_ms ? Math.round(call.duration_ms / 1000) : null;
    const costCents = toCents(call.call_cost?.combined_cost);
    const startedAt = toIso(call.start_timestamp);

    const callRow = must(
      await admin
        .from("calls")
        .upsert(
          {
            workspace_id: workspaceId,
            agent_id: agentId,
            phone_number_id: await resolvePhoneNumberId(admin, workspaceId, call),
            provider_call_id: call.call_id,
            direction: call.direction ?? "inbound",
            from_e164: call.from_number ?? null,
            to_e164: call.to_number ?? null,
            status: mapStatus(call.disconnection_reason),
            ended_reason: call.disconnection_reason ?? null,
            // Omitted keys are left untouched on conflict, so a missing
            // timestamp never wipes the one call_started recorded.
            ...(startedAt ? { started_at: startedAt } : {}),
            ended_at: toIso(call.end_timestamp) ?? new Date().toISOString(),
            duration_seconds: durationSeconds,
            recording_url: call.recording_url ?? null,
            ...(costCents !== undefined ? { cost_cents: costCents } : {}),
          },
          { onConflict: "provider_call_id" }
        )
        .select("id")
        .single(),
      "upsert call"
    );
    if (!callRow) throw new Error("upsert call returned no row");

    if (call.transcript_object?.length) {
      // Replace turns wholesale: call_ended carries the full transcript.
      // ms_offset is the first word's audio time, forced strictly
      // increasing so turns always sort in spoken order.
      let prev = -1;
      const turns = call.transcript_object.map((turn) => {
        const start = turn.words?.[0]?.start;
        const ms = Math.max(start !== undefined ? Math.round(start * 1000) : 0, prev + 1);
        prev = ms;
        return {
          call_id: callRow.id,
          workspace_id: workspaceId,
          role: turn.role === "agent" ? "assistant" : turn.role === "user" ? "user" : "system",
          content: turn.content,
          ms_offset: ms,
        };
      });
      must(await admin.from("call_turns").delete().eq("call_id", callRow.id), "clear turns");
      must(await admin.from("call_turns").insert(turns), "insert turns");
    }

    if (durationSeconds && durationSeconds > 0) {
      must(
        await admin.from("usage_events").upsert(
          {
            workspace_id: workspaceId,
            agent_id: agentId,
            call_id: callRow.id,
            kind: "call_minutes",
            quantity: Math.round((durationSeconds / 60) * 100) / 100,
            unit: "minutes",
            cost_cents: costCents ?? null,
          },
          { onConflict: "call_id,kind" }
        ),
        "record usage"
      );
    }
    return;
  }

  if (body.event === "call_analyzed") {
    const existing = must(
      await admin
        .from("calls")
        .select("id, status")
        .eq("provider_call_id", call.call_id)
        .maybeSingle(),
      "load call"
    );
    // Arrived before call_ended was stored: fail so Retell redelivers.
    if (!existing) throw new Error(`call ${call.call_id} not recorded yet`);

    const analysis = call.call_analysis ?? {};
    const sentiment =
      analysis.user_sentiment && analysis.user_sentiment !== "Unknown"
        ? analysis.user_sentiment.toLowerCase()
        : null;
    const outcome = analysis.in_voicemail
      ? "voicemail"
      : existing.status === "transferred"
        ? "escalated"
        : analysis.call_successful
          ? "resolved"
          : "other";
    const costCents = toCents(call.call_cost?.combined_cost);

    must(
      await admin
        .from("calls")
        .update({
          summary: analysis.call_summary ?? null,
          sentiment,
          outcome,
          ...(costCents !== undefined ? { cost_cents: costCents } : {}),
        })
        .eq("id", existing.id),
      "update analysis"
    );
  }
}

// The workspace number on our side of the call: the dialed number for
// inbound, the caller id for outbound.
async function resolvePhoneNumberId(
  admin: Admin,
  workspaceId: string,
  call: RetellWebhookCall
): Promise<string | null> {
  const e164 = call.direction === "outbound" ? call.from_number : call.to_number;
  if (!e164) return null;
  const row = must(
    await admin
      .from("phone_numbers")
      .select("id")
      .eq("workspace_id", workspaceId)
      .eq("e164", e164)
      .maybeSingle(),
    "resolve number"
  );
  return row?.id ?? null;
}
