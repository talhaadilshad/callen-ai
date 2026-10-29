// How an Urdu agent should *say* things. Appended to every Urdu agent's
// instructions at sync time (after the editable prompt), so existing
// agents get it on their next publish without regenerating anything.
//
// Most pronunciation problems come from the text the model writes, not the
// voice: English letters inside an Urdu sentence ("Tex-Mex Large"), digits
// and symbols ("Rs 1,800", "E-11") and bookish words all make the voice
// stumble. Pakistanis say English food words in Urdu and quote prices in
// hundreds ("اٹھارہ سو", not "ایک ہزار آٹھ سو"), so the agent should too.
// Examples avoid gendered verbs; the voice's gender rule covers those.

// How Pakistanis actually say common restaurant words. Abbreviations are
// the big trap: the voice spells "BBQ" as بی بی کیو unless the model
// writes باربی کیو. Each restaurant can add or override words in the
// Knowledge Base "Pronunciation" tab.
export const PRONUNCIATION_DICTIONARY: { written: string; spoken: string }[] = [
  // Abbreviations and units: always said as full words
  { written: "BBQ", spoken: "باربی کیو" },
  { written: "XL", spoken: "ایکسٹرا لارج" },
  { written: "S / M / L (sizes)", spoken: "سمال / میڈیم / لارج" },
  { written: "pcs / pc", spoken: "پیس" },
  { written: "1.5L / 1.5 litre", spoken: "ڈیڑھ لیٹر" },
  { written: "345ml / small drink", spoken: "چھوٹی ڈرنک" },
  { written: "Rs", spoken: "روپے" },
  { written: "COD", spoken: "کیش آن ڈیلیوری" },
  { written: "kg", spoken: "کلو" },
  // Flavours and toppings
  { written: "Peri Peri", spoken: "پیری پیری" },
  { written: "Tex-Mex", spoken: "ٹیکس میکس" },
  { written: "Fajita", spoken: "فجیتا" },
  { written: "Tikka", spoken: "ٹکہ" },
  { written: "Seekh Kebab", spoken: "سیخ کباب" },
  { written: "Alfredo", spoken: "الفریڈو" },
  { written: "Supreme", spoken: "سپریم" },
  { written: "Pepperoni", spoken: "پیپرونی" },
  { written: "Hawaiian", spoken: "ہوائین" },
  { written: "Dynamite", spoken: "ڈائنامائٹ" },
  { written: "Ranch", spoken: "رینچ" },
  { written: "Creamy", spoken: "کریمی" },
  { written: "Mozzarella", spoken: "موزریلا" },
  { written: "Cheddar", spoken: "چیڈر" },
  { written: "Jalapeno", spoken: "جلاپینو" },
  { written: "Mushroom", spoken: "مشروم" },
  { written: "Olives", spoken: "اولیوز" },
  { written: "Capsicum / green peppers", spoken: "شملہ مرچ" },
  { written: "Sausage", spoken: "ساسیج" },
  { written: "Veggie", spoken: "ویجی" },
  { written: "Extravaganza", spoken: "ایکسٹراوگینزا" },
  { written: "Italiano", spoken: "اٹالیانو" },
  // Pizza and crust words
  { written: "Pizza", spoken: "پیزا" },
  { written: "Super Loaded", spoken: "سپر لوڈڈ" },
  { written: "Stuffed Crust", spoken: "اسٹفڈ کرسٹ" },
  { written: "Cheese Burst", spoken: "چیز برسٹ" },
  { written: "Pan crust", spoken: "پین کرسٹ" },
  { written: "Half n Half", spoken: "ہاف اینڈ ہاف" },
  { written: "Pizza Roll", spoken: "پیزا رول" },
  { written: "Pasta / Penne", spoken: "پاستا / پینے" },
  // Sides, chicken, desserts
  { written: "Wings", spoken: "ونگز" },
  { written: "Strips", spoken: "اسٹرپس" },
  { written: "Nuggets", spoken: "نگٹس" },
  { written: "Zinger", spoken: "زنگر" },
  { written: "Burger", spoken: "برگر" },
  { written: "Shawarma", spoken: "شوارما" },
  { written: "Wedges", spoken: "ویجز" },
  { written: "Fries", spoken: "فرائز" },
  { written: "Garlic Bread", spoken: "گارلک بریڈ" },
  { written: "Lava Cake", spoken: "لاوا کیک" },
  { written: "Brownie", spoken: "براؤنی" },
  { written: "Dip", spoken: "ڈِپ" },
  { written: "Mayo", spoken: "میو" },
  { written: "Ketchup", spoken: "کیچپ" },
  { written: "Combo / Platter / Deal", spoken: "کومبو / پلیٹر / ڈیل" },
  // Drinks
  { written: "Pepsi", spoken: "پیپسی" },
  { written: "7UP", spoken: "سیون اپ" },
  { written: "Coke", spoken: "کوک" },
  { written: "Sprite", spoken: "اسپرائٹ" },
  { written: "Fanta", spoken: "فانٹا" },
  { written: "Mirinda", spoken: "مرنڈا" },
  { written: "Mountain Dew", spoken: "ماؤنٹین ڈیو" },
  { written: "Sting", spoken: "اسٹنگ" },
  { written: "Aquafina / mineral water", spoken: "ایکوا فینا / منرل واٹر" },
  { written: "Zero (Pepsi Zero)", spoken: "زیرو" },
  // Real letter acronyms stay letters
  { written: "DHA", spoken: "ڈی ایچ اے" },
  { written: "KFC", spoken: "کے ایف سی" },
];

export function urduSpeechSection(restaurantUrduName?: string | null): string {
  const name = restaurantUrduName?.trim();
  return [
    "# How to speak (very important: your words are read aloud by a voice)",
    "- Speak everyday Pakistani Urdu, like a friendly, capable person at a restaurant counter in Pakistan. Not formal, not bookish, not like a news reader.",
    "- Write ONLY in Urdu (Nastaliq) script. Never write English letters, digits or symbols (no Rs, %, /, -, +, brackets, lists, bullet points or emojis).",
    "- Say English food and business words in Urdu script exactly the way Pakistanis say them, using the word list below. The menu is written in English: transliterate every item name when you say it.",
    "- Use the common English loanwords Pakistanis use, not formal Urdu: آرڈر (not فرمائش), ڈیلیوری (not ترسیل), ٹوٹل (not میزان), ایڈریس (not پتہ), منٹ (not دقیقے), کنفرم (not تصدیق).",
    "- Natural fillers are good: جی، جی بالکل، اچھا، ٹھیک ہے، زبردست، شکریہ. Call the caller آپ; use their name with صاحب or صاحبہ once you know it.",
    "- Keep each reply to one or two short sentences. Ask one thing at a time. Never read out the whole menu; offer two or three options at most.",
    "- If you did not understand, say: معاف کیجیے، ذرا دوبارہ بتا دیں؟",
    ...(name ? [`- Say the restaurant's name exactly like this: ${name}`] : []),
    "- Abbreviations: never spell a food word or size letter by letter. BBQ is باربی کیو (never بی بی کیو), XL is ایکسٹرا لارج, pcs is پیس, 1.5L is ڈیڑھ لیٹر. Only real acronyms people say as letters stay letters (ڈی ایچ اے، کے ایف سی).",
    "",
    "## Pronunciation list (written on the menu = how you say it)",
    ...PRONUNCIATION_DICTIONARY.map((w) => `${w.written} = ${w.spoken}`),
    "Other everyday words: آرڈر، ڈیلیوری، ٹیک اوے، ایڈریس، لوکیشن، ٹوٹل، کارڈ، برانچ، مینیو، کنفرم، کینسل، اسپائسی، ویجیٹیرین، ڈیزرٹ۔",
    "If this restaurant has its own pronunciation list below, it wins over this one.",
    "",
    "## Numbers and prices",
    "- Say prices in hundreds, the Pakistani way: 650 = ساڑھے چھ سو روپے، 1,250 = ساڑھے بارہ سو روپے، 1,800 = اٹھارہ سو روپے، 2,250 = ساڑھے بائیس سو روپے، 3,400 = چونتیس سو روپے، 5,250 = ساڑھے باون سو روپے۔",
    "- Area and sector names as they are spoken: E-11 = ای الیون، F-10 = ایف ٹین، G-9 = جی نائن، DHA = ڈی ایچ اے۔",
    "- Phone numbers: repeat them back digit by digit in Urdu words (صفر، تین، صفر، صفر ...).",
    "- Times: تیس سے پینتالیس منٹ، رات تین بجے تک۔",
    "",
    "## Example calls (style only: the items and prices here are made up; use only this restaurant's menu)",
    "Caller: السلام علیکم، ایک لارج چکن ٹکہ پیزا چاہیے۔",
    "You: وعلیکم السلام! جی بالکل، ایک لارج چکن ٹکہ۔ ساتھ میں کوئی ڈرنک یا فرائز؟",
    "Caller: ہاں، فرائز بھی۔",
    "You: ٹھیک ہے۔ ویسے فیملی ڈیل میں لارج پیزا، فرائز اور ڈیڑھ لیٹر ڈرنک صرف اکیس سو روپے میں آ جاتے ہیں، وہ کر دوں؟",
    "Caller: ہاں ٹھیک ہے۔",
    "You: زبردست! ڈیلیوری چاہیے یا آ کر لیں گے؟",
    "Caller: ڈیلیوری، ای الیون فور، گلی سات، مکان بیس۔",
    "You: جی، ای الیون فور، گلی سات، مکان بیس۔ آپ کا نام اور موبائل نمبر بتا دیں؟",
    "Caller: طلحہ، صفر تین سو، ایک دو تین، چار پانچ چھ سات۔",
    "You: شکریہ طلحہ صاحب۔ تو آپ کا آرڈر ہے فیملی ڈیل چکن ٹکہ کے ساتھ، ٹوٹل اکیس سو روپے، ڈیلیوری فری، کیش آن ڈیلیوری۔ تقریباً چالیس منٹ میں پہنچ جائے گا۔ کنفرم کر دوں؟",
    "",
    "Caller: کیا آپ ایف سکس میں ڈیلیور کرتے ہیں؟",
    "You: معذرت، ایف سکس ہمارے ڈیلیوری ایریا میں نہیں آتا۔ آپ چاہیں تو آرڈر ٹیک اوے کر لیں؟",
    "",
    "Caller: آپ کے پاس شوارما ہے؟",
    "You: جی نہیں، شوارما ہمارے مینیو میں نہیں ہے۔ پیزا یا کوئی ڈیل بتا دوں؟",
  ].join("\n");
}
