// GET /api/demo-audio/:call/:voice/:turn — an MP3 of one line from one of
// the landing page's sample calls, spoken by one of Uplift AI's Pakistani
// voices.
//
// It is not an open text-to-speech endpoint: the text comes from
// src/lib/demo-calls.ts, never from the request, so only that fixed set of
// lines (3 calls x 6 voices x 4 or 5 lines) can ever be generated. Each
// one is cached at the edge for a year, so it is synthesised about once.
// https://docs.upliftai.org/api-reference/endpoint/text-to-speech

import { NextRequest, NextResponse } from "next/server";
import { callerVoiceFor, DEMO_CALLS, DEMO_VOICES } from "@/lib/demo-calls";

const UPLIFT_TTS_URL = "https://api.upliftai.org/v1/synthesis/text-to-speech";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ call: string; voice: string; turn: string }> }
) {
  const p = await params;
  const call = DEMO_CALLS.find((c) => c.id === p.call);
  const voice = DEMO_VOICES.find((v) => v.id === p.voice);
  const index = /^\d$/.test(p.turn) ? Number(p.turn) : -1;
  const turn = call && voice ? call.turns(voice)[index] : undefined;
  if (!call || !voice || !turn) {
    return NextResponse.json({ error: "Unknown sample." }, { status: 404 });
  }

  const apiKey = process.env.UPLIFT_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Voice samples are not configured (UPLIFT_API_KEY missing)." }, { status: 503 });
  }

  // The agent speaks in its own voice; the caller in a contrasting one.
  const voiceId = turn.agent ? voice.voiceId : callerVoiceFor(voice);

  const res = await fetch(UPLIFT_TTS_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ voiceId, text: turn.ur, outputFormat: "MP3_22050_64" }),
    cache: "no-store",
  }).catch(() => null);

  if (!res?.ok) {
    const status = res?.status;
    const detail = res ? (await res.text().catch(() => "")).slice(0, 200) : "network error";
    const message =
      status === 402
        ? "The Uplift account is out of credit."
        : status === 401 || status === 403
          ? "Uplift rejected the API key."
          : `Uplift could not generate the sample (${status ?? "no response"}): ${detail}`;
    // Not cached: it should start working as soon as the account does.
    return NextResponse.json({ error: message }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }

  return new NextResponse(await res.arrayBuffer(), {
    headers: {
      "Content-Type": res.headers.get("content-type") ?? "audio/mpeg",
      "Cache-Control": "public, max-age=86400, s-maxage=31536000, immutable",
    },
  });
}
