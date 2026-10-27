// Verifies Retell's x-retell-signature header.
//
// Format: "v=<unix ms>,d=<hex>", where <hex> is HMAC-SHA256 of
// (raw body + timestamp) keyed with the Retell API key that carries the
// "webhook" badge. Requests older than 5 minutes are rejected as replays.
// https://docs.retellai.com/features/secure-webhook

import crypto from "node:crypto";

const MAX_SKEW_MS = 5 * 60 * 1000;

export function verifyRetellSignature(
  rawBody: string,
  header: string | null,
  apiKey: string | undefined,
  now: number = Date.now()
): boolean {
  if (!apiKey || !header) return false;
  const match = /^v=(\d+),d=([0-9a-f]+)$/i.exec(header.trim());
  if (!match) return false;
  const [, timestamp, digest] = match;

  if (Math.abs(now - Number(timestamp)) > MAX_SKEW_MS) return false;

  const expected = crypto
    .createHmac("sha256", apiKey)
    .update(rawBody + timestamp)
    .digest();
  const given = Buffer.from(digest, "hex");
  return given.length === expected.length && crypto.timingSafeEqual(given, expected);
}
