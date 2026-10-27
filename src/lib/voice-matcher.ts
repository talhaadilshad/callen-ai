// Picks the best available SpeechSynthesisVoice for one of our personas.
// Used by useTTS so the agent editor's test panel can speak the agent's
// actual configured first message in a browser voice that matches the
// persona's gender + language, not just a random default voice.
//
// On Windows Edge / Chrome there are real Microsoft neural Urdu voices
// (Asad, male; Uzma, female). On other OSes we fall back gracefully:
// Hindi if Urdu is missing (close enough phonetically for Pakistani
// agents), then English.

import type { Voice } from "./voice-library";

// Substrings to look for in `voice.name` for our preferred Urdu voices.
// Order matters — most specific first.
const URDU_MALE_NAMES = [
  "Microsoft Asad",
  "Asad",
  "ur-PK-AsadNeural",
];
const URDU_FEMALE_NAMES = [
  "Microsoft Uzma",
  "Uzma",
  "ur-PK-UzmaNeural",
];

// Hindi neural voices as the closest fallback for Urdu (mutually
// intelligible phonetics, same accent family).
const HINDI_MALE_HINTS = ["Madhur", "Hindi", "hi-IN"];
const HINDI_FEMALE_HINTS = ["Swara", "Kalpana", "Hindi", "hi-IN"];

// English neural voices, gender-matched where possible.
const ENGLISH_FEMALE_HINTS = ["Aria", "Jenny", "Zira", "Sonia", "Female"];
const ENGLISH_MALE_HINTS = ["Guy", "Davis", "David", "Mark", "Male"];

export interface PickPreferences {
  gender: Voice["gender"];
  language: Voice["language"];
}

/**
 * Walks a preference ladder to find the best browser voice for a persona.
 * Returns null if no usable voice is available (caller should show a
 * "voice playback unsupported on this browser" hint).
 */
export function pickBrowserVoice(
  available: SpeechSynthesisVoice[],
  prefs: PickPreferences
): SpeechSynthesisVoice | null {
  if (available.length === 0) return null;

  const wantsUrdu = String(prefs.language) !== "English";
  const isFemale = prefs.gender === "Female";

  // ----- Tier 1: Exact Urdu Microsoft voice for our gender -----
  if (wantsUrdu) {
    const targets = isFemale ? URDU_FEMALE_NAMES : URDU_MALE_NAMES;
    for (const t of targets) {
      const hit = findByName(available, t);
      if (hit) return hit;
    }

    // ----- Tier 2: Any ur-* voice (Urdu Pakistan, Urdu India) -----
    const anyUrdu = available.find((v) => v.lang.toLowerCase().startsWith("ur"));
    if (anyUrdu) return anyUrdu;

    // ----- Tier 3: Hindi neural voices, gender-matched -----
    const hindiHints = isFemale ? HINDI_FEMALE_HINTS : HINDI_MALE_HINTS;
    for (const hint of hindiHints) {
      const hit = findByName(available, hint);
      if (hit) return hit;
    }

    // ----- Tier 4: Any hi-* voice -----
    const anyHindi = available.find((v) => v.lang.toLowerCase().startsWith("hi"));
    if (anyHindi) return anyHindi;
  }

  // ----- Tier 5: English neural, gender-matched -----
  const enHints = isFemale ? ENGLISH_FEMALE_HINTS : ENGLISH_MALE_HINTS;
  for (const hint of enHints) {
    const hit = findByName(available, hint, "en");
    if (hit) return hit;
  }

  // ----- Tier 6: Any English voice -----
  const anyEnglish = available.find((v) =>
    v.lang.toLowerCase().startsWith("en")
  );
  if (anyEnglish) return anyEnglish;

  // ----- Final fallback: the browser's default voice -----
  return available.find((v) => v.default) ?? available[0];
}

function findByName(
  available: SpeechSynthesisVoice[],
  nameSubstring: string,
  langPrefix?: string
): SpeechSynthesisVoice | undefined {
  const lowered = nameSubstring.toLowerCase();
  return available.find((v) => {
    const nameMatch = v.name.toLowerCase().includes(lowered);
    if (!langPrefix) return nameMatch;
    return nameMatch && v.lang.toLowerCase().startsWith(langPrefix);
  });
}

/**
 * Friendly description of the picked voice for the test-panel status line.
 * Returns "Asad", "Uzma", "Aria" etc. when the underlying browser voice
 * has a Latin-script name. Returns "" when the name is primarily
 * non-Latin script (Devanagari, Arabic, etc.) — we operate in Pakistan,
 * surfacing "हिन्दी" or similar in our UI is brand-inappropriate.
 */
export function describeBrowserVoice(voice: SpeechSynthesisVoice | null): string {
  if (!voice) return "";
  // Strip the Microsoft / Google vendor prefix for compactness in the UI
  const trimmed = voice.name
    .replace(/^Microsoft\s+/i, "")
    .replace(/^Google\s+/i, "")
    .replace(/\s*\(Natural\)\s*/i, "")
    .replace(/\s+-\s+.*$/, "");

  // Hide labels that don't have at least 2 Latin characters — keeps
  // "Asad" / "Uzma" / "Aria" visible but drops Devanagari/Arabic names.
  const latinCount = (trimmed.match(/[a-zA-Z]/g) || []).length;
  if (latinCount < 2) return "";

  return trimmed;
}
