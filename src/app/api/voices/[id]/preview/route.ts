// GET /api/voices/:voice/preview — an MP3 of a catalog voice reading its
// Urdu sample line, synthesised by Soniox (the same model the agents use
// on calls). Only catalog voices and their fixed sample text are
// accepted, and the response is cached at the edge for a year, so each
// voice costs one synthesis per deployment region.
// https://soniox.com/docs/tts/rest-api/generate-speech

import { NextRequest, NextResponse } from "next/server";
import { SONIOX_TTS_MODEL, SONIOX_TTS_FALLBACK_MODEL, sonioxVoiceByName } from "@/lib/soniox-voices";

const SONIOX_TTS_URL = "https://tts-rt.soniox.com/tts";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const voice = sonioxVoiceByName(decodeURIComponent(id));
  if (!voice) {
    return NextResponse.json({ error: "Unknown voice." }, { status: 404 });
  }
  const apiKey = process.env.SONIOX_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Voice previews are not configured (SONIOX_API_KEY missing)." }, { status: 503 });
  }

  // Prefer the model calls use; fall back to the older one if the account
  // or endpoint rejects it.
  let res: Response | null = null;
  let detail = "";
  for (const model of [SONIOX_TTS_MODEL, SONIOX_TTS_FALLBACK_MODEL]) {
    res = await fetch(SONIOX_TTS_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        language: "ur",
        voice: voice.voice,
        audio_format: "mp3",
        text: voice.sample,
      }),
      cache: "no-store",
    });
    if (res.ok) break;
    detail = await res.text().catch(() => "");
    // Auth or rate-limit problems won't be fixed by another model.
    if (res.status === 401 || res.status === 403 || res.status === 429) break;
  }
  if (!res?.ok) {
    const status = res?.status;
    const message =
      status === 402
        ? "The Soniox account is out of credit. Add funds in the Soniox console (Billing) to enable previews."
        : status === 401 || status === 403
          ? "Soniox rejected the API key. Check SONIOX_API_KEY in Vercel."
          : `Soniox could not generate the preview (${status}): ${detail}`;
    return NextResponse.json({ error: message }, { status: 502 });
  }

  return new NextResponse(await res.arrayBuffer(), {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "public, max-age=86400, s-maxage=31536000, immutable",
    },
  });
}
