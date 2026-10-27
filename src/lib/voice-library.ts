// Voice library — curated catalog for /voices and the Agent editor.
//
// Urdu voices from Uplift AI, the runtime every Callen agent runs on.
// The catalog id IS the Uplift voiceId (see src/lib/uplift/voices.ts),
// so what you preview is exactly what callers hear. Preview clips are
// synthesised by Uplift on first request and cached at the edge
// (GET /api/voices/:id/preview).

import { UPLIFT_VOICES, DEFAULT_UPLIFT_VOICE_ID, type UpliftAccent } from "@/lib/uplift/voices";

export type VoiceLanguage = "Urdu";
export type VoiceAccent = UpliftAccent;
export type VoiceGender = "Male" | "Female";
export type VoiceAge = "Young adult" | "Adult" | "Middle aged";
export type VoiceCategory =
  | "Order Taking"
  | "Receptionist"
  | "Customer Service"
  | "Conversational";

export type Voice = {
  id: string;             // Uplift voiceId
  name: string;
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
  "helpdesk-agent":      ["Customer Service", "Receptionist", "Order Taking"],
  "dha-hostess":         ["Receptionist", "Order Taking", "Conversational"],
  "college-girl":        ["Order Taking", "Conversational"],
  "news-reader":         ["Receptionist", "Customer Service"],
  "memon-organizer":     ["Order Taking", "Customer Service"],
  "punjabi-masi":        ["Conversational", "Order Taking"],
  "sindhi-professional": ["Receptionist", "Customer Service"],
  "broadband-support":   ["Customer Service", "Receptionist"],
  "shopkeeper":          ["Order Taking", "Conversational"],
  "biryani-reviewer":    ["Order Taking", "Conversational"],
  "punjabi-manager":     ["Customer Service", "Order Taking"],
  "sindhi-networker":    ["Conversational", "Receptionist"],
  "wholesale-trader":    ["Order Taking", "Customer Service"],
};

const TRENDING = new Set(["helpdesk-agent", "dha-hostess", "shopkeeper", "biryani-reviewer"]);

export const VOICES: Voice[] = UPLIFT_VOICES.map((v) => {
  const useCases = CATEGORIES[v.id] ?? ["Order Taking"];
  return {
    id: v.id,
    name: v.name,
    tagline: v.style,
    edgeVoice: "Uplift AI",
    language: "Urdu",
    accent: v.accent,
    gender: v.gender,
    age: v.age,
    category: useCases[0],
    useCases,
    sample: v.sample,
    trending: TRENDING.has(v.id),
    audioSrc: `/api/voices/${v.id}/preview`,
  };
});

// Accepts the bare id or the older "uplift:<id>" form stored on early
// Urdu agents.
export function getVoice(id: string): Voice | undefined {
  const bare = id.startsWith("uplift:") ? id.slice(7) : id;
  return VOICES.find((v) => v.id === bare);
}

export const DEFAULT_VOICE_ID = DEFAULT_UPLIFT_VOICE_ID;

// Template voice assignment: stable, front-desk-appropriate defaults.
const TEMPLATE_VOICE_OVERRIDES: Record<string, string> = {
  "tpl-fast-food-orders": "shopkeeper",
  "tpl-desi-takeaway": "biryani-reviewer",
  "tpl-reservations": "dha-hostess",
  "tpl-catering": "punjabi-manager",
  "tpl-order-support": "helpdesk-agent",
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
  ["Standard", "Burger", "Punjabi", "Sindhi", "Memon"] as VoiceAccent[]
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
    blurb: "Natural, regional voices that sound like the neighbourhood.",
    art: { from: "#c7d2fe", via: "#6366f1", to: "#1e1b4b" },
  },
];
