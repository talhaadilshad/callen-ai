// Soniox voices: the speaking voice of every Callen agent. Soniox's Urdu
// pronunciation and emotion beat Uplift's own voices, so Uplift runs the
// call (STT + LLM + turn-taking) and Soniox speaks (tts provider
// "soniox" in the Uplift assistant config).
//
// Every Soniox voice speaks every supported language, Urdu included.
// Their built-in names are English (Maya, Daniel...), so the dashboard
// shows Urdu names instead: female voices get female names, male voices
// male names. `voice` is the real Soniox name sent to the API.
// https://soniox.com/docs/tts/concepts/voices
//
// Plain data (no server-only import) so the dashboard catalog, the
// preview route and the Uplift sync can all use it.

// The Soniox TTS model Uplift accepts in an assistant's tts config.
export const SONIOX_TTS_MODEL = "tts-rt-v1";

export type SonioxAccent = "Neutral" | "South Asian";

export type SonioxVoice = {
  id: string;        // stored as agents.voice_id: "soniox:<voice>"
  voice: string;     // Soniox voice name
  name: string;      // Urdu display name
  gender: "Male" | "Female";
  accent: SonioxAccent;
  age: "Young adult" | "Adult" | "Middle aged";
  style: string;
  sample: string;    // spoken by the preview route
};

const GREETING = "السلام علیکم! خوش آمدید۔ آج آپ کیا آرڈر کرنا چاہیں گے؟";
const DEAL = "جی بالکل، ایک لارج پیزا اور دو ڈرنکس۔ کیا آپ ہماری فیملی ڈیل بھی دیکھنا چاہیں گے؟";
const ADDRESS = "شکریہ! آپ کا ایڈریس کنفرم کر دیں، آپ کا آرڈر چالیس منٹ میں پہنچ جائے گا۔";
const TABLE = "جی ضرور، آج رات آٹھ بجے چار لوگوں کے لیے ٹیبل بک کر دوں؟";
const SORRY = "معذرت چاہتے ہیں، میں آپ کی شکایت مینیجر تک پہنچا دیتی ہوں۔";
const SORRY_M = "معذرت چاہتے ہیں، میں آپ کی شکایت مینیجر تک پہنچا دیتا ہوں۔";

const v = (voice: string, name: string, gender: SonioxVoice["gender"], accent: SonioxAccent, age: SonioxVoice["age"], style: string, sample: string): SonioxVoice => ({
  id: `soniox:${voice}`,
  voice,
  name,
  gender,
  accent,
  age,
  style,
  sample,
});

export const SONIOX_VOICES: SonioxVoice[] = [
  // Female
  v("Maya",   "Ayesha",  "Female", "Neutral",     "Adult",       "Steady, clear, warm and confident",   GREETING),
  v("Nina",   "Hira",    "Female", "Neutral",     "Young adult", "Bright, expressive and friendly",     DEAL),
  v("Grace",  "Amna",    "Female", "Neutral",     "Adult",       "Gentle, calm and comforting",         SORRY),
  v("Claire", "Mahnoor", "Female", "Neutral",     "Adult",       "Polished, articulate and refined",    TABLE),
  v("Emma",   "Sana",    "Female", "Neutral",     "Young adult", "Smooth, relaxed and easygoing",       ADDRESS),
  v("Mina",   "Zainab",  "Female", "Neutral",     "Adult",       "Soft, thoughtful and warm",           GREETING),
  v("Priya",  "Fatima",  "Female", "South Asian", "Adult",       "Clear and composed, South Asian",     DEAL),
  v("Meera",  "Maryam",  "Female", "South Asian", "Adult",       "Crisp and dependable, South Asian",   ADDRESS),
  // Male
  v("Daniel", "Ahmed",   "Male",   "Neutral",     "Middle aged", "Rich, polished and reassuring",       GREETING),
  v("Noah",   "Hamza",   "Male",   "Neutral",     "Young adult", "Lively, youthful and upbeat",         DEAL),
  v("Jack",   "Bilal",   "Male",   "Neutral",     "Adult",       "Friendly, confident, approachable",   ADDRESS),
  v("Adrian", "Usman",   "Male",   "Neutral",     "Adult",       "Deep, focused and authoritative",     TABLE),
  v("Owen",   "Faisal",  "Male",   "Neutral",     "Adult",       "Grounded and composed",               SORRY_M),
  v("Kenji",  "Ali",     "Male",   "Neutral",     "Adult",       "Calm, precise and trustworthy",       GREETING),
  v("Arjun",  "Imran",   "Male",   "South Asian", "Adult",       "Deep and easygoing, South Asian",     DEAL),
  v("Rohan",  "Saad",    "Male",   "South Asian", "Young adult", "Lively and upbeat, South Asian",      ADDRESS),
];

export const DEFAULT_SONIOX_VOICE_ID = "soniox:Maya";

export function sonioxVoiceById(id: string | null | undefined): SonioxVoice | undefined {
  if (!id) return undefined;
  return SONIOX_VOICES.find((s) => s.id === id);
}

export function sonioxVoiceByName(voice: string): SonioxVoice | undefined {
  const lower = voice.toLowerCase();
  return SONIOX_VOICES.find((s) => s.voice.toLowerCase() === lower);
}
