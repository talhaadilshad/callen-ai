// Minimal Uplift AI client (no official Node SDK for the voice-agent
// API). Everything that talks to Uplift goes through here so the
// runtime stays swappable.
// https://docs.upliftai.org/api-reference/assistants/create-an-assistant

import "server-only";

const BASE_URL = "https://api.upliftai.org/v1";

export class UpliftError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "UpliftError";
  }
}

export function isUpliftConfigured(): boolean {
  return Boolean(process.env.UPLIFT_API_KEY);
}

export async function uplift<T = unknown>(
  method: "GET" | "POST" | "DELETE",
  path: string,
  body?: unknown
): Promise<T> {
  const apiKey = process.env.UPLIFT_API_KEY;
  if (!apiKey) {
    throw new Error("UPLIFT_API_KEY is not set. Add it to .env.local.");
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const json = text ? safeJson(text) : null;
  if (!res.ok) {
    const detail =
      (json && typeof json === "object" && ("message" in json || "error" in json)
        ? String((json as { message?: unknown; error?: unknown }).message ??
            (json as { error?: unknown }).error)
        : text) || res.statusText;
    throw new UpliftError(`Uplift ${method} ${path} failed (${res.status}): ${detail}`, res.status);
  }
  return json as T;
}

// For endpoints that answer with audio bytes (text-to-speech).
export async function upliftAudio(path: string, body: unknown): Promise<ArrayBuffer> {
  const apiKey = process.env.UPLIFT_API_KEY;
  if (!apiKey) {
    throw new Error("UPLIFT_API_KEY is not set. Add it to .env.local.");
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new UpliftError(`Uplift POST ${path} failed (${res.status}): ${text || res.statusText}`, res.status);
  }
  return res.arrayBuffer();
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
