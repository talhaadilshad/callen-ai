// Maps a Callen agent's voice + model choice onto Uplift's assistant
// config blocks. Provider and model strings come from
// https://docs.upliftai.org/voice-agents/assistants/providers-and-models
//
// Voice ids stored on agents:
//   "soniox:<Voice>"     -> Soniox voice speaking Urdu (the catalog,
//                           src/lib/soniox-voices.ts; e.g. soniox:Maya)
//   "<uplift voice id>"  -> Uplift's own voice (early Urdu agents)
//   "uplift:<voiceId>"   -> same, older form
// Anything else (an old English catalog slug, null) gets the default
// Soniox voice.

import { DEFAULT_SONIOX_VOICE_ID, SONIOX_TTS_MODEL } from "@/lib/soniox-voices";
import { normalizeUpliftVoiceId } from "@/lib/uplift/voices";

export type UpliftTtsConfig =
  | { provider: "upliftai"; voiceId: string }
  | { provider: "soniox"; model: string; voiceId: string; language: "ur" };

function soniox(voice: string): UpliftTtsConfig {
  return { provider: "soniox", model: SONIOX_TTS_MODEL, voiceId: voice, language: "ur" };
}

export function toUpliftTts(voiceId: string | null | undefined): UpliftTtsConfig {
  if (voiceId?.startsWith("soniox:")) return soniox(voiceId.slice(7));
  if (voiceId?.startsWith("uplift:")) {
    return { provider: "upliftai", voiceId: voiceId.slice(7) };
  }
  const uplift = normalizeUpliftVoiceId(voiceId);
  if (uplift) return { provider: "upliftai", voiceId: uplift };
  return soniox(DEFAULT_SONIOX_VOICE_ID.slice(7));
}

export type UpliftLlmConfig = { provider: "google" | "openai"; model: string };

// Models Uplift hosts. An agent's settings.model is reused when Uplift
// supports it; otherwise we use the fastest model Uplift lists.
const UPLIFT_LLMS: Record<string, UpliftLlmConfig["provider"]> = {
  "gemini-2.5-flash": "google",
  "gemini-3.5-flash": "google",
  "gemini-3.1-flash-lite": "google",
  "gpt-5.4-nano": "openai",
  "gpt-5.4-mini": "openai",
  "gpt-4o-mini": "openai",
};

export const DEFAULT_UPLIFT_LLM: UpliftLlmConfig = { provider: "google", model: "gemini-2.5-flash" };

export function toUpliftLlm(model: unknown): UpliftLlmConfig {
  if (typeof model === "string" && UPLIFT_LLMS[model]) {
    return { provider: UPLIFT_LLMS[model], model };
  }
  return DEFAULT_UPLIFT_LLM;
}
