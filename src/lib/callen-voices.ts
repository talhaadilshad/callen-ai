// Callen's Urdu voices: Uplift AI's native Pakistani voices, shown under
// Pakistani first names. `voiceId` is the real Uplift id sent to their
// text-to-speech API; `name` is what people see on the site.
// Catalogue: https://docs.upliftai.org/orator_voices (82 voices; these 24
// are the ones chosen for Callen).
//
// Plain data (no server-only import) so pages and API routes can share it.

export type CallenVoice = {
  voiceId: string;   // Uplift voice id
  name: string;      // Pakistani display name
  gender: "Male" | "Female";
  style: string;     // how it sounds, in a few words
};

export const CALLEN_VOICES: CallenVoice[] = [
  // Women
  { voiceId: "helpdesk-agent", name: "Ayesha", gender: "Female", style: "Warm, patient customer service" },
  { voiceId: "late-night-rj", name: "Hira", gender: "Female", style: "Smooth and friendly, like a radio host" },
  { voiceId: "paediatrician", name: "Sana", gender: "Female", style: "Calm, kind and reassuring" },
  { voiceId: "news-reader", name: "Zainab", gender: "Female", style: "Soft, clear, slightly quick" },
  { voiceId: "female-narrator", name: "Fatima", gender: "Female", style: "Clean and balanced" },
  { voiceId: "family-lawyer", name: "Maryam", gender: "Female", style: "Composed and confident" },
  { voiceId: "cricket-commentator", name: "Amna", gender: "Female", style: "Energetic and lively" },
  { voiceId: "female-debater", name: "Mahnoor", gender: "Female", style: "Sharp and fast" },
  { voiceId: "hadith-narrator", name: "Rabia", gender: "Female", style: "Calm and measured" },
  // Men
  { voiceId: "broadband-support", name: "Ahmed", gender: "Male", style: "Polished, methodical support" },
  { voiceId: "biryani-reviewer", name: "Bilal", gender: "Male", style: "Energetic and food-loving" },
  { voiceId: "podcast-host", name: "Usman", gender: "Male", style: "Thoughtful, easy pace" },
  { voiceId: "field-correspondent", name: "Hamza", gender: "Male", style: "Sharp and quick" },
  { voiceId: "senior-anchor", name: "Faisal", gender: "Male", style: "Clean, balanced, good tempo" },
  { voiceId: "prime-time-anchor", name: "Ali", gender: "Male", style: "Authoritative news voice" },
  { voiceId: "wholesale-trader", name: "Imran", gender: "Male", style: "Steady Karachi trader" },
  { voiceId: "male-debater", name: "Saad", gender: "Male", style: "Incisive and direct" },
  { voiceId: "urdu-professor", name: "Kamran", gender: "Male", style: "Measured and well-spoken" },
  { voiceId: "qissa-khawan", name: "Tariq", gender: "Male", style: "Classic storyteller" },
  { voiceId: "diabetologist", name: "Asad", gender: "Male", style: "Plain-speaking and calm" },
  { voiceId: "defense-advocate", name: "Shahid", gender: "Male", style: "Precise and methodical" },
  { voiceId: "lahori-barber", name: "Zubair", gender: "Male", style: "Fast-talking, old-city charm" },
  { voiceId: "heartbroken", name: "Omar", gender: "Male", style: "Soft and gentle" },
  { voiceId: "udaas-aashiq", name: "Danish", gender: "Male", style: "Quiet and subdued" },
];

export const callenVoiceByName = (name: string) =>
  CALLEN_VOICES.find((v) => v.name.toLowerCase() === name.toLowerCase());
