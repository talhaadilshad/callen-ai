// GET /api/voices/:id/preview — an MP3 of a catalog voice reading its
// sample line, synthesised by Uplift AI. Only curated voices and their
// fixed sample text are accepted, and the response is cached at the edge
// for a year, so each voice costs one synthesis per deployment region.

import { NextRequest, NextResponse } from "next/server";
import { UPLIFT_VOICES } from "@/lib/uplift/voices";
import { isUpliftConfigured, upliftAudio } from "@/lib/uplift/client";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const voice = UPLIFT_VOICES.find((v) => v.id === id);
  if (!voice) {
    return NextResponse.json({ error: "Unknown voice." }, { status: 404 });
  }
  if (!isUpliftConfigured()) {
    return NextResponse.json({ error: "Voice previews are not configured." }, { status: 503 });
  }

  try {
    const audio = await upliftAudio("/synthesis/text-to-speech", {
      voiceId: voice.id,
      text: voice.sample,
      outputFormat: "MP3_22050_32",
    });
    return new NextResponse(audio, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400, s-maxage=31536000, immutable",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Preview failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
