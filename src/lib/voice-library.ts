// Voice library — curated catalog for /voices and the Agent editor.
//
// Soniox voices speaking Urdu, shown under Urdu names (see
// src/lib/soniox-voices.ts). Calls run on Uplift AI with Soniox as the
// speaking voice, so what you preview is the voice callers hear.
// Preview clips are synthesised by Soniox on first request and cached
// at the edge (GET /api/voices/:voice/preview).

import { SONIOX_VOICES, DEFAULT_SONIOX_VOICE_ID, type SonioxAccent } from "@/lib/soniox-voices";

export type VoiceLanguage = "Urdu";
export type VoiceAccent = SonioxAccent;
export type VoiceGender = "Male" | "Female";
export type VoiceAge = "Young adult" | "Adult" | "Middle aged";
export type VoiceCategory =
  | "Order Taking"
  | "Receptionist"
  | "Customer Service"
  | "Conversational";

export type Voice = {
  id: string;             // agents.voice_id, e.g. "soniox:Maya"
  name: string;           // Urdu display name
  tagline: string;
  edgeVoice: string;      // source provider label (informational only)
  rate?: string;
  pitch?: string;
  language: VoiceLanguage;
  extraLanguages?: VoiceLanguage[];
  accent: VoiceAccent;
  gender: VoiceGender;
  age: VoiceAge;
  category: VoiceCategory;
  useCases: VoiceCategory[];
  sample: string;
  premium?: boolean;
  trending?: boolean;
  audioSrc: string;
};

// Front-desk fit per voice: the first category is the headline one.
const CATEGORIES: Record<string, VoiceCategory[]> = {
  Maya:   ["Customer Service", "Receptionist", "Order Taking"],
  Nina:   ["Order Taking", "Conversational"],
  Grace:  ["Customer Service", "Receptionist"],
  Claire: ["Receptionist", "Order Taking"],
  Emma:   ["Conversational", "Order Taking"],
  Mina:   ["Customer Service", "Conversational"],
  Priya:  ["Receptionist", "Order Taking"],
  Meera:  ["Order Taking", "Customer Service"],
  Daniel: ["Receptionist", "Customer Service"],
  Noah:   ["Order Taking", "Conversational"],
  Jack:   ["Order Taking", "Customer Service"],
  Adrian: ["Receptionist", "Customer Service"],
  Owen:   ["Customer Service", "Conversational"],
  Kenji:  ["Customer Service", "Receptionist"],
  Arjun:  ["Conversational", "Order Taking"],
  Rohan:  ["Order Taking", "Conversational"],
};

const TRENDING = new Set(["Maya", "Nina", "Daniel", "Priya", "Arjun"]);

export const VOICES: Voice[] = SONIOX_VOICES.map((s) => {
  const useCases = CATEGORIES[s.voice] ?? ["Order Taking"];
  return {
    id: s.id,
    name: s.name,
    tagline: s.style,
    edgeVoice: `Soniox · ${s.voice}`,
    language: "Urdu",
    accent: s.accent,
    gender: s.gender,
    age: s.age,
    category: useCases[0],
    useCases,
    sample: s.sample,
    trending: TRENDING.has(s.voice),
    audioSrc: `/api/voices/${s.voice}/preview`,
  };
});

export function getVoice(id: string): Voice | undefined {
  return VOICES.find((v) => v.id === id);
}

export const DEFAULT_VOICE_ID = DEFAULT_SONIOX_VOICE_ID;

// Template voice assignment: stable, front-desk-appropriate defaults.
const TEMPLATE_VOICE_OVERRIDES: Record<string, string> = {
  "tpl-fast-food-orders": "soniox:Noah",
  "tpl-desi-takeaway": "soniox:Arjun",
  "tpl-reservations": "soniox:Claire",
  "tpl-catering": "soniox:Daniel",
  "tpl-order-support": "soniox:Grace",
};

export function voiceForTemplateId(templateId: string): Voice {
  return getVoice(TEMPLATE_VOICE_OVERRIDES[templateId] ?? DEFAULT_VOICE_ID) ?? VOICES[0];
}

export const TRENDING_VOICES = VOICES.filter((v) => v.trending);

const _activeCategories = new Set(VOICES.flatMap((v) => v.useCases));
export const CATEGORY_FILTERS: VoiceCategory[] = (
  ["Order Taking", "Receptionist", "Customer Service", "Conversational"] as VoiceCategory[]
).filter((c) => _activeCategories.has(c));

export const LANGUAGE_FILTERS: VoiceLanguage[] = ["Urdu"];

const _activeAccents = new Set(VOICES.map((v) => v.accent));
export const ACCENT_FILTERS: VoiceAccent[] = (
  ["Neutral", "South Asian"] as VoiceAccent[]
).filter((a) => _activeAccents.has(a));

export type UseCaseCard = {
  id: VoiceCategory;
  title: string;
  blurb: string;
  art: { from: string; via: string; to: string };
};

export const USE_CASE_CARDS: UseCaseCard[] = [
  {
    id: "Order Taking",
    title: "Order Taking",
    blurb: "Upbeat voices that confirm every item and suggest the deal.",
    art: { from: "#fde68a", via: "#f59e0b", to: "#78350f" },
  },
  {
    id: "Receptionist",
    title: "Front Desk",
    blurb: "Warm, polished voices for greetings, bookings and hours.",
    art: { from: "#fbcfe8", via: "#ec4899", to: "#831843" },
  },
  {
    id: "Customer Service",
    title: "Customer Care",
    blurb: "Calm, patient voices for late orders and complaints.",
    art: { from: "#bfdbfe", via: "#60a5fa", to: "#1e3a8a" },
  },
  {
    id: "Conversational",
    title: "Conversational",
    blurb: "Natural, relaxed voices for easy back-and-forth.",
    art: { from: "#c7d2fe", via: "#6366f1", to: "#1e1b4b" },
  },
];
