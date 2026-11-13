// The sample calls on the landing page: who speaks, and what they say.
// Plain data shared by the hero panel (which plays them) and the
// /api/demo-audio route (which turns each line into speech), so the audio
// can only ever be these exact lines.
//
// The agent's grammar follows the voice: a female voice says "rahi hoon",
// a male one "raha hoon", exactly as the real agent does. The restaurant
// ("Karachi Bites") is made up so no real brand is implied.

export type DemoPalette = "ember" | "ocean" | "lilac" | "moss" | "rose" | "dusk";

export type DemoVoice = {
  name: string;     // shown on the site
  ur: string;       // the name in Urdu script, said in the greeting
  female: boolean;
  soniox: string;   // the Soniox voice that speaks for this agent
  palette: DemoPalette;
};

export const DEMO_VOICES: DemoVoice[] = [
  { name: "Ayesha", ur: "عائشہ", female: true, soniox: "Maya", palette: "ember" },
  { name: "Ahmed", ur: "احمد", female: false, soniox: "Daniel", palette: "ocean" },
  { name: "Hira", ur: "حرا", female: true, soniox: "Nina", palette: "lilac" },
  { name: "Bilal", ur: "بلال", female: false, soniox: "Jack", palette: "moss" },
  { name: "Sana", ur: "ثنا", female: true, soniox: "Emma", palette: "rose" },
  { name: "Usman", ur: "عثمان", female: false, soniox: "Adrian", palette: "dusk" },
];

// The caller is always the opposite gender to the agent, so the two voices
// are easy to tell apart by ear.
export const callerVoiceFor = (agent: DemoVoice) => (agent.female ? "Noah" : "Priya");

export type DemoTurn = { agent: boolean; roman: string; ur: string };

export type DemoCall = {
  id: string;
  label: string;
  dot: DemoPalette;
  blurb: string;
  outcome: string;
  turns: (v: DemoVoice) => DemoTurn[];
};

export const DEMO_CALLS: DemoCall[] = [
  {
    id: "orders",
    label: "Orders",
    dot: "ember",
    blurb: "Delivery and takeaway orders, read back to the caller before they are confirmed.",
    outcome: "Order taken · PKR 2,300 · DHA Phase 6",
    turns: (v) => [
      {
        agent: true,
        roman: `Assalam-o-Alaikum, Karachi Bites! Main ${v.name} baat kar ${v.female ? "rahi" : "raha"} hoon. Ji, farmaiye?`,
        ur: `السلام علیکم، کراچی بائٹس! میں ${v.ur} بات کر ${v.female ? "رہی" : "رہا"} ہوں۔ جی، فرمائیے؟`,
      },
      {
        agent: false,
        roman: "Ek large chicken tikka pizza aur ek zinger burger. Delivery DHA Phase 6 mein.",
        ur: "ایک لارج چکن تکہ پیزا اور ایک زنگر برگر۔ ڈیلیوری ڈی ایچ اے فیز چھ میں۔",
      },
      {
        agent: true,
        roman: "Ji bilkul. Ek large chicken tikka pizza aur ek zinger burger. Total 2,300 rupay, cash on delivery. Confirm kar doon?",
        ur: "جی بالکل۔ ایک لارج چکن تکہ پیزا اور ایک زنگر برگر۔ ٹوٹل تئیس سو روپے، کیش آن ڈیلیوری۔ کنفرم کر دوں؟",
      },
      { agent: false, roman: "Ji, kar dein.", ur: "جی، کر دیں۔" },
      {
        agent: true,
        roman: "Order confirm ho gaya. 35 se 40 minute mein pohanch jaye ga. Shukriya!",
        ur: "آرڈر کنفرم ہو گیا۔ پینتیس سے چالیس منٹ میں پہنچ جائے گا۔ شکریہ!",
      },
    ],
  },
  {
    id: "deals",
    label: "Deals",
    dot: "ocean",
    blurb: "Every caller hears today's deal, and the add-on that fits the order.",
    outcome: "Deal applied · PKR 1,999",
    turns: () => [
      { agent: false, roman: "Aaj koi deal chal rahi hai?", ur: "آج کوئی ڈیل چل رہی ہے؟" },
      {
        agent: true,
        roman: "Ji bilkul. Aaj Family Deal hai: 2 medium pizza aur 1.5 litre drink, sirf 1,999 rupay mein.",
        ur: "جی بالکل۔ آج فیملی ڈیل ہے: دو میڈیم پیزا اور ڈیڑھ لیٹر ڈرنک، صرف انیس سو ننانوے روپے میں۔",
      },
      { agent: false, roman: "Theek hai, yehi kar dein.", ur: "ٹھیک ہے، یہی کر دیں۔" },
      {
        agent: true,
        roman: "Ji, note kar liya. Saath garlic bread sirf 200 rupay mein shamil kar doon?",
        ur: "جی، نوٹ کر لیا۔ ساتھ گارلک بریڈ صرف دو سو روپے میں شامل کر دوں؟",
      },
    ],
  },
  {
    id: "questions",
    label: "Questions",
    dot: "lilac",
    blurb: "Timings, delivery areas and table bookings, answered from your own restaurant info.",
    outcome: "Answered from your restaurant info",
    turns: (v) => [
      {
        agent: false,
        roman: "Kya aap G-11 mein delivery karte hain? Aur kab tak khule hain?",
        ur: "کیا آپ جی الیون میں ڈیلیوری کرتے ہیں؟ اور کب تک کھلے ہیں؟",
      },
      {
        agent: true,
        roman: "Ji, G-11 mein delivery hoti hai, charges 100 rupay hain. Hum raat 2 baje tak khule hain.",
        ur: "جی، جی الیون میں ڈیلیوری ہوتی ہے، چارجز ایک سو روپے ہیں۔ ہم رات دو بجے تک کھلے ہیں۔",
      },
      {
        agent: false,
        roman: "Hafte ki raat 8 baje 6 logon ki table mil jaye gi?",
        ur: "ہفتے کی رات آٹھ بجے چھ لوگوں کی ٹیبل مل جائے گی؟",
      },
      {
        agent: true,
        roman: `Ji, Hafta, raat 8 baje, 6 afraad. Main abhi book kar ${v.female ? "deti" : "deta"} hoon. Kis naam se?`,
        ur: `جی، ہفتہ، رات آٹھ بجے، چھ افراد۔ میں ابھی بُک کر ${v.female ? "دیتی" : "دیتا"} ہوں۔ کس نام سے؟`,
      },
    ],
  },
];

// Where the hero panel fetches the speech for one line of one call.
export const demoAudioUrl = (call: DemoCall, voice: DemoVoice, turn: number) =>
  `/api/demo-audio/${call.id}/${voice.soniox}/${turn}`;
