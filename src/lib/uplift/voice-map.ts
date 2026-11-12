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

import { DEFAULT_SONIOX_VOICE_ID, SONIOX_TTS_MODEL, sonioxVoiceById } from "@/lib/soniox-voices";
import { normalizeUpliftVoiceId, UPLIFT_VOICES } from "@/lib/uplift/voices";

export type VoiceGender = "Female" | "Male";

// Gender of the voice an agent will speak with. Urdu verbs agree with the
// speaker (karti hoon vs karta hoon), so the agent has to be told. Unknown
// ids speak with the default voice, so they take its gender.
export function voiceGender(voiceId: string | null | undefined): VoiceGender {
  const soniox = sonioxVoiceById(voiceId);
  if (soniox) return soniox.gender;
  const upliftId = voiceId?.startsWith("uplift:") ? voiceId.slice(7) : normalizeUpliftVoiceId(voiceId);
  const uplift = UPLIFT_VOICES.find((v) => v.id === upliftId);
  if (uplift) return uplift.gender;
  return sonioxVoiceById(DEFAULT_SONIOX_VOICE_ID)?.gender ?? "Female";
}

// Grammar rule appended to the agent's instructions so first-person Urdu
// matches the voice callers hear.
export function speakingAsSection(gender: VoiceGender): string {
  return gender === "Female"
    ? [
        "# Speaking as a woman",
        "Your voice is a woman's. When you speak about yourself in Urdu, always use feminine forms: کرتی ہوں، سکتی ہوں، رہی ہوں، دیتی ہوں، بتاتی ہوں (karti hoon, sakti hoon, rahi hoon).",
        "Never use masculine forms such as کرتا، سکتا، رہا for yourself. Words about the caller follow the caller, not you.",
      ].join("\n")
    : [
        "# Speaking as a man",
        "Your voice is a man's. When you speak about yourself in Urdu, always use masculine forms: کرتا ہوں، سکتا ہوں، رہا ہوں، دیتا ہوں، بتاتا ہوں (karta hoon, sakta hoon, raha hoon).",
        "Never use feminine forms such as کرتی، سکتی، رہی for yourself. Words about the caller follow the caller, not you.",
      ].join("\n");
}

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

export type UpliftLlmConfig =
  | { provider: "google"; model: string }
  | { provider: "openai"; model: string; reasoningEffort?: "low"; verbosity?: "low" };

// Models Uplift hosts. An agent's settings.model is reused when Uplift
// supports it; otherwise GPT-5.4 Mini, the model Uplift recommends for
// "calls that need more judgment" (order changes, complaints, vague
// requests). Uplift bills a flat rate per minute whatever the model.
const UPLIFT_LLMS: Record<string, UpliftLlmConfig["provider"]> = {
  "gemini-2.5-flash": "google",
  "gemini-3.5-flash": "google",
  "gemini-3.1-flash-lite": "google",
  "gpt-5.4-nano": "openai",
  "gpt-5.4-mini": "openai",
  "gpt-4o-mini": "openai",
};

const DEFAULT_UPLIFT_MODEL = "gpt-5.4-mini";

// Voice tuning per provider:
// - gpt-5.x: a short reasoning pass and short answers, Uplift's own
//   recommended settings for calls (a chatty model is a slow call). The
//   knobs don't exist on gpt-4o-mini.
// - Gemini: nothing sent. Uplift already applies its voice-tuned thinking
//   defaults (thinkingLevel low on 3.x, a 512-token budget on 2.5).
function llmConfig(model: string): UpliftLlmConfig {
  if (UPLIFT_LLMS[model] === "google") return { provider: "google", model };
  return model.startsWith("gpt-5")
    ? { provider: "openai", model, reasoningEffort: "low", verbosity: "low" }
    : { provider: "openai", model };
}

export const DEFAULT_UPLIFT_LLM: UpliftLlmConfig = llmConfig(DEFAULT_UPLIFT_MODEL);

export function toUpliftLlm(model: unknown): UpliftLlmConfig {
  return typeof model === "string" && UPLIFT_LLMS[model] ? llmConfig(model) : DEFAULT_UPLIFT_LLM;
}
