// Browser sessions for Uplift assistants. Uplift returns a LiveKit
// token + URL; the browser joins that room and the assistant joins on
// Uplift's side. Minted server-side so the API key never leaves us.
// https://docs.upliftai.org/api-reference/starting-a-conversation/create-a-web-session-token

import "server-only";
import { uplift, UpliftError } from "@/lib/uplift/client";

export type UpliftWebSession = { token: string; wsUrl: string; roomName: string };

const PUBLISH_RETRIES = 3;
const PUBLISH_RETRY_DELAY_MS = 1500;

export async function createUpliftWebSession(
  assistantId: string,
  participantName: string
): Promise<UpliftWebSession> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await uplift<UpliftWebSession>(
        "POST",
        `/realtime-assistants/${encodeURIComponent(assistantId)}/session`,
        { participantName, roomName: "callen" }
      );
    } catch (err) {
      // 503 = a fresh publish hasn't reached the region yet; it settles
      // within seconds, and we publish on every save.
      if (err instanceof UpliftError && err.status === 503 && attempt < PUBLISH_RETRIES) {
        await new Promise((r) => setTimeout(r, PUBLISH_RETRY_DELAY_MS));
        continue;
      }
      throw err;
    }
  }
}
