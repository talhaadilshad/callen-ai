// Maps a Callen agent's voice + model choice onto Uplift's assistant
// config blocks. Provider and model strings come from
// https://docs.upliftai.org/voice-agents/assistants/providers-and-models
//
// Voice ids stored on Urdu agents:
//   "uplift:<voiceId>"  -> Uplift voice (e.g. uplift:helpdesk-agent)
//   "soniox:<Voice>"    -> Soniox voice speaking Urdu (e.g. soniox:Maya)
// Anything else (an English catalog slug, null) falls back to the
// default Uplift voice. Swap DEFAULT_UPLIFT_VOICE after the portal test.

export const DEFAULT_UPLIFT_VOICE = "helpdesk-agent";

export type UpliftTtsConfig =
  | { provider: "upliftai"; voiceId: string }
  | { provider: "soniox"; model: string; voiceId: string; language: "ur" };

export function toUpliftTts(voiceId: string | null | undefined): UpliftTtsConfig {
  if (voiceId?.startsWith("soniox:")) {
    return { provider: "soniox", model: "tts-rt-v1", voiceId: voiceId.slice(7), language: "ur" };
  }
  if (voiceId?.startsWith("uplift:")) {
    return { provider: "upliftai", voiceId: voiceId.slice(7) };
  }
  return { provider: "upliftai", voiceId: DEFAULT_UPLIFT_VOICE };
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
