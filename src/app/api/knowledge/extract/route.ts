// POST /api/knowledge/extract — pull the text out of an uploaded PDF so it
// can become a Knowledge Base document. The file is read in memory and
// never stored. Auth: session cookie. Text files (.txt, .md) are read in
// the browser and don't come here.

import { NextRequest, NextResponse } from "next/server";
import { extractText, getDocumentProxy } from "unpdf";
import { createClient } from "@/lib/supabase/server";
import { DOC_CONTENT_MAX } from "@/lib/knowledge";

const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Attach a PDF file." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "The file is larger than 5 MB." }, { status: 413 });
  }
  if (!(file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf"))) {
    return NextResponse.json({ error: "Only PDF files are read here." }, { status: 415 });
  }

  try {
    const pdf = await getDocumentProxy(new Uint8Array(await file.arrayBuffer()));
    const { text } = await extractText(pdf, { mergePages: true });
    const clean = text.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
    if (!clean) {
      return NextResponse.json(
        { error: "No text found. Scanned or image-only PDFs can't be read yet; paste the text instead." },
        { status: 422 }
      );
    }
    return NextResponse.json({
      text: clean.slice(0, DOC_CONTENT_MAX),
      truncated: clean.length > DOC_CONTENT_MAX,
    });
  } catch {
    return NextResponse.json({ error: "Could not read that PDF." }, { status: 422 });
  }
}
