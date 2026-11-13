// GET /api/demo-audio/:call/:voice/:turn — an MP3 of one line from one of
// the landing page's sample calls, spoken by Soniox (the same voices the
// real agents use on calls).
//
// It is not an open text-to-speech endpoint: the text comes from
// src/lib/demo-calls.ts, never from the request, so only that fixed set of
// lines (3 calls x 6 voices x 4 or 5 lines) can ever be generated. Each
// one is cached at the edge for a year, so it is synthesised about once.
// https://soniox.com/docs/tts/rest-api/generate-speech

import { NextRequest, NextResponse } from "next/server";
import { callerVoiceFor, DEMO_CALLS, DEMO_VOICES } from "@/lib/demo-calls";
import { SONIOX_TTS_FALLBACK_MODEL, SONIOX_TTS_MODEL } from "@/lib/soniox-voices";

const SONIOX_TTS_URL = "https://tts-rt.soniox.com/tts";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ call: string; voice: string; turn: string }> }
) {
  const p = await params;
  const call = DEMO_CALLS.find((c) => c.id === p.call);
  const voice = DEMO_VOICES.find((v) => v.soniox === p.voice);
  const index = /^\d$/.test(p.turn) ? Number(p.turn) : -1;
  const turn = call && voice ? call.turns(voice)[index] : undefined;
  if (!call || !voice || !turn) {
    return NextResponse.json({ error: "Unknown sample." }, { status: 404 });
  }

  const apiKey = process.env.SONIOX_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Voice samples are not configured (SONIOX_API_KEY missing)." }, { status: 503 });
  }

  // The agent speaks in its own voice; the caller in a contrasting one.
  const speaker = turn.agent ? voice.soniox : callerVoiceFor(voice);

  // Prefer the model calls use; fall back to the older one if the account
  // or endpoint rejects it.
  let res: Response | null = null;
  for (const model of [SONIOX_TTS_MODEL, SONIOX_TTS_FALLBACK_MODEL]) {
    res = await fetch(SONIOX_TTS_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, language: "ur", voice: speaker, audio_format: "mp3", text: turn.ur }),
      cache: "no-store",
    });
    if (res.ok) break;
    // Auth, credit or rate-limit problems won't be fixed by another model.
    if ([401, 402, 403, 429].includes(res.status)) break;
  }
  if (!res?.ok) {
    const status = res?.status;
    const message =
      status === 402
        ? "The Soniox account is out of credit."
        : status === 401 || status === 403
          ? "Soniox rejected the API key."
          : `Soniox could not generate the sample (${status}).`;
    // Not cached: it should start working as soon as the account does.
    return NextResponse.json({ error: message }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }

  return new NextResponse(await res.arrayBuffer(), {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "public, max-age=86400, s-maxage=31536000, immutable",
    },
  });
}
