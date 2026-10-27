// Uplift AI's own Urdu voices. No longer offered in the catalog (Soniox
// voices replaced them, see src/lib/soniox-voices.ts), but agents created
// with one keep it: voice-map.ts still recognises these ids.
// Uplift ships 82 Urdu voices (https://docs.upliftai.org/orator_voices);
// these were the friendly, clear ones that suit taking orders.
//
// Plain data (no server-only import) so both the dashboard catalog and
// the server-side sync can use it.

export type UpliftAccent = "Standard" | "Burger" | "Punjabi" | "Sindhi" | "Memon";

export type UpliftVoice = {
  id: string;
  name: string;
  gender: "Male" | "Female";
  accent: UpliftAccent;
  age: "Young adult" | "Adult" | "Middle aged";
  style: string;
  // Spoken by the preview route; kept short so previews are cheap.
  sample: string;
};

const GREETING = "السلام علیکم! خوش آمدید۔ آج آپ کیا آرڈر کرنا چاہیں گے؟";
const DEAL = "جی بالکل، ایک لارج پیزا اور دو ڈرنکس۔ کیا آپ ہماری فیملی ڈیل بھی دیکھنا چاہیں گے؟";
const ADDRESS = "شکریہ! آپ کا ایڈریس کنفرم کر دیں، آپ کا آرڈر چالیس منٹ میں پہنچ جائے گا۔";
const TABLE = "جی ضرور، آج رات آٹھ بجے چار لوگوں کے لیے ٹیبل بک کر دوں؟";

export const UPLIFT_VOICES: UpliftVoice[] = [
  { id: "helpdesk-agent",      name: "Helpdesk Agent",      gender: "Female", accent: "Standard", age: "Adult",       style: "Patient, empathetic support",            sample: GREETING },
  { id: "dha-hostess",         name: "DHA Hostess",         gender: "Female", accent: "Burger",   age: "Adult",       style: "Polished, composed, Urdu with English",  sample: TABLE },
  { id: "college-girl",        name: "College Girl",        gender: "Female", accent: "Standard", age: "Young adult", style: "Bright, conversational",                  sample: DEAL },
  { id: "news-reader",         name: "News Reader",         gender: "Female", accent: "Standard", age: "Adult",       style: "Soft, clear, quick pace",                 sample: ADDRESS },
  { id: "memon-organizer",     name: "Memon Organizer",     gender: "Female", accent: "Memon",    age: "Adult",       style: "Warm, quietly capable",                   sample: GREETING },
  { id: "punjabi-masi",        name: "Punjabi Masi",        gender: "Female", accent: "Punjabi",  age: "Young adult", style: "Warm, earthy, friendly",                  sample: DEAL },
  { id: "sindhi-professional", name: "Sindhi Professional", gender: "Female", accent: "Sindhi",   age: "Adult",       style: "Composed, contemporary",                  sample: ADDRESS },
  { id: "broadband-support",   name: "Broadband Support",   gender: "Male",   accent: "Standard", age: "Adult",       style: "Formal, methodical support",              sample: ADDRESS },
  { id: "shopkeeper",          name: "Shopkeeper",          gender: "Male",   accent: "Standard", age: "Middle aged", style: "Friendly, chatty counter voice",          sample: DEAL },
  { id: "biryani-reviewer",    name: "Biryani Reviewer",    gender: "Male",   accent: "Standard", age: "Young adult", style: "Emphatic, food-loving, energetic",        sample: DEAL },
  { id: "punjabi-manager",     name: "Punjabi Manager",     gender: "Male",   accent: "Punjabi",  age: "Adult",       style: "Steady, professional",                    sample: GREETING },
  { id: "sindhi-networker",    name: "Sindhi Networker",    gender: "Male",   accent: "Sindhi",   age: "Adult",       style: "Easy, friendly",                          sample: TABLE },
  { id: "wholesale-trader",    name: "Wholesale Trader",    gender: "Male",   accent: "Standard", age: "Middle aged", style: "Steady, measured",                        sample: ADDRESS },
];

export const DEFAULT_UPLIFT_VOICE_ID = "helpdesk-agent";

const IDS = new Set(UPLIFT_VOICES.map((v) => v.id));

export function isUpliftVoiceId(id: string | null | undefined): id is string {
  return Boolean(id && IDS.has(id));
}

// Accepts a catalog id or the older "uplift:<id>" form.
export function normalizeUpliftVoiceId(id: string | null | undefined): string | null {
  if (!id) return null;
  const bare = id.startsWith("uplift:") ? id.slice(7) : id;
  return isUpliftVoiceId(bare) ? bare : null;
}
