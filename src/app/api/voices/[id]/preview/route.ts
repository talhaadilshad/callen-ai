// GET /api/voices/:voice/preview — an MP3 of a catalog voice reading its
// Urdu sample line, synthesised by Soniox (the same model the agents use
// on calls). Only catalog voices and their fixed sample text are
// accepted, and the response is cached at the edge for a year, so each
// voice costs one synthesis per deployment region.
// https://soniox.com/docs/tts/rest-api/generate-speech

import { NextRequest, NextResponse } from "next/server";
import { SONIOX_TTS_MODEL, sonioxVoiceByName } from "@/lib/soniox-voices";

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

  const res = await fetch(SONIOX_TTS_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: SONIOX_TTS_MODEL,
      language: "ur",
      voice: voice.voice,
      audio_format: "mp3",
      text: voice.sample,
    }),
    cache: "no-store",
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    return NextResponse.json({ error: `Preview failed (${res.status}): ${detail}` }, { status: 502 });
  }

  return new NextResponse(await res.arrayBuffer(), {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "public, max-age=86400, s-maxage=31536000, immutable",
    },
  });
}
