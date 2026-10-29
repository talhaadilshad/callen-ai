// Shared metadata + smart generators for the Create-Agent wizard
// and the agent editor. Centralised so the wizard, editor, and store
// all draw from one source of truth.

import {
  Pizza,
  Flame,
  Soup,
  Coffee,
  ChefHat,
  Store,
  CakeSlice,
  UtensilsCrossed,
  Utensils,
  ShoppingCart,
  CalendarCheck,
  Star,
  Headphones,
  Hourglass,
  Scissors,
  Sun,
  Crown,
  Smile,
  Shield,
  Rocket,
  AlertCircle,
  Target,
  Search,
  Heart,
  HandHeart,
  type LucideIcon,
} from "lucide-react";

// =============================================================
// Restaurant types (the "industry" field, restaurant-only now)
// =============================================================

export type IndustryOption = { id: string; label: string; icon: LucideIcon };

export const INDUSTRIES: IndustryOption[] = [
  { id: "fast-food",     label: "Fast food & pizza", icon: Pizza },
  { id: "desi-bbq",      label: "Desi & BBQ",        icon: Flame },
  { id: "chinese",       label: "Chinese & Asian",   icon: Soup },
  { id: "cafe-bakery",   label: "Cafe & bakery",     icon: Coffee },
  { id: "fine-dining",   label: "Fine dining",       icon: ChefHat },
  { id: "cloud-kitchen", label: "Cloud kitchen",     icon: Store },
  { id: "dessert",       label: "Desserts & shakes", icon: CakeSlice },
  { id: "other",         label: "Other restaurant",  icon: UtensilsCrossed },
];

export function industryLabel(id: string | null | undefined): string {
  if (!id) return "";
  return INDUSTRIES.find((i) => i.id === id)?.label ?? "";
}

// =============================================================
// Use cases
// =============================================================

export type UseCaseOption = { id: string; label: string; icon: LucideIcon };

export const USE_CASES: UseCaseOption[] = [
  { id: "order-taking",     label: "Takeaway & delivery orders", icon: ShoppingCart },
  { id: "reservation",      label: "Table reservations",         icon: CalendarCheck },
  { id: "menu-rec",         label: "Menu & deals questions",     icon: Star },
  { id: "catering",         label: "Catering & bulk orders",     icon: Utensils },
  { id: "customer-support", label: "Order status & complaints",  icon: Headphones },
];

export function useCaseLabel(id: string | null | undefined): string {
  if (!id) return "";
  return USE_CASES.find((u) => u.id === id)?.label ?? "";
}

// =============================================================
// LLM models (3 per provider)
// =============================================================

export type LlmProvider = "Google" | "OpenAI";

export type LlmModel = {
  id: string;
  provider: LlmProvider;
  label: string;
  description: string;
};

// Every id below is a model Uplift AI hosts for voice agents (see
// src/lib/uplift/voice-map.ts). What the user picks here is exactly
// what runs on the call.
export const LLM_MODELS: LlmModel[] = [
  { id: "gemini-3.5-flash",      provider: "Google", label: "Gemini 3.5 Flash",      description: "Smarter Urdu · the default for phone calls" },
  { id: "gemini-2.5-flash",      provider: "Google", label: "Gemini 2.5 Flash",      description: "Fastest replies · simpler Urdu" },
  { id: "gemini-3.1-flash-lite", provider: "Google", label: "Gemini 3.1 Flash Lite", description: "Lowest cost · simple order taking" },
  { id: "gpt-5.4-mini",          provider: "OpenAI", label: "GPT-5.4 Mini",          description: "Strong reasoning · handles tricky orders" },
  { id: "gpt-5.4-nano",          provider: "OpenAI", label: "GPT-5.4 Nano",          description: "Fast + cheap" },
  { id: "gpt-4o-mini",           provider: "OpenAI", label: "GPT-4o Mini",           description: "Proven with Urdu speech" },
];

export const LLM_PROVIDERS: LlmProvider[] = ["Google", "OpenAI"];

export const DEFAULT_LLM_ID = "gemini-3.5-flash";

export function llmById(id: string | null | undefined): LlmModel | undefined {
  if (!id) return undefined;
  return LLM_MODELS.find((m) => m.id === id);
}

export function llmLabel(id: string | null | undefined): string {
  return llmById(id)?.label ?? "Gemini 2.5 Flash";
}

// =============================================================
// Behaviour traits — chips the user can toggle to colour the agent's
// reply style. Selected trait prompt lines are appended to the
// generated systemPrompt's Style section.
// =============================================================

export type BehaviorTrait = {
  id: string;
  label: string;
  icon: LucideIcon;
  description: string;
  prompt: string;            // line spliced into the generated Style section
};

export const BEHAVIOR_TRAITS: BehaviorTrait[] = [
  {
    id: "respectful",
    label: "Respectful",
    icon: HandHeart,
    description: "Polite forms and titles throughout.",
    prompt: "Use polite forms and titles. Default to 'sir' or 'ma'am' when a name is not known.",
  },
  {
    id: "empathetic",
    label: "Empathetic",
    icon: Heart,
    description: "Acknowledge feelings before solutions.",
    prompt: "Acknowledge how the caller feels before moving to a solution. Mirror their emotional tone.",
  },
  {
    id: "patient",
    label: "Patient",
    icon: Hourglass,
    description: "Never rush, rephrase calmly when asked.",
    prompt: "Never rush. If a caller asks for something to be repeated or rephrased, do so calmly without sounding frustrated.",
  },
  {
    id: "concise",
    label: "Concise",
    icon: Scissors,
    description: "Short turns, no filler.",
    prompt: "Keep each turn under 20 words. Drop filler phrases and small talk.",
  },
  {
    id: "warm",
    label: "Warm",
    icon: Sun,
    description: "Use the caller's name, sound happy to help.",
    prompt: "Use the caller's name when known. Sound genuinely happy to help.",
  },
  {
    id: "formal",
    label: "Formal",
    icon: Crown,
    description: "Formal register, no slang or contractions.",
    prompt: "Use a formal register. Avoid contractions and slang. Address the caller respectfully.",
  },
  {
    id: "playful",
    label: "Playful",
    icon: Smile,
    description: "Light humour when appropriate.",
    prompt: "Light humour where it fits. Keep the tone upbeat without joking about the caller's problem.",
  },
  {
    id: "authoritative",
    label: "Authoritative",
    icon: Shield,
    description: "Confident, decisive, quotes policy clearly.",
    prompt: "Be confident and decisive. Quote policy plainly when needed.",
  },
  {
    id: "encouraging",
    label: "Encouraging",
    icon: Rocket,
    description: "Celebrate small wins, praise specific actions.",
    prompt: "Celebrate small wins. Praise specific actions the caller took.",
  },
  {
    id: "apologetic",
    label: "Apologetic",
    icon: AlertCircle,
    description: "Acknowledge problems openly, own mistakes first.",
    prompt: "Acknowledge problems openly. Own mistakes before fixing them.",
  },
  {
    id: "solution-focused",
    label: "Solution-focused",
    icon: Target,
    description: "Move to action, always end with next step.",
    prompt: "Move to action quickly. Always end a turn with a clear next step.",
  },
  {
    id: "detail-oriented",
    label: "Detail-oriented",
    icon: Search,
    description: "Confirm dates, amounts, addresses by repeating.",
    prompt: "Confirm specifics: dates, amounts, addresses. Repeat them back to verify.",
  },
];

export function traitsToPromptLines(traitIds: string[]): string[] {
  return traitIds
    .map((id) => BEHAVIOR_TRAITS.find((t) => t.id === id)?.prompt)
    .filter((p): p is string => Boolean(p));
}

// =============================================================
// Languages
// =============================================================

export type LanguageOption = {
  id: string;
  label: string;
  flag: string;       // emoji flag for UI only (identity surface)
};

// Urdu only: Callen is a Pakistani restaurant front desk. The agents
// still understand English words mixed into Urdu and reply naturally.
export const LANGUAGES: LanguageOption[] = [
  { id: "Urdu", label: "Urdu", flag: "🇵🇰" },
];

export function languageFor(id: string | undefined | null): LanguageOption | undefined {
  if (!id) return undefined;
  return LANGUAGES.find((l) => l.id === id);
}

// =============================================================
// Smart system-prompt + first-message generators
// =============================================================

// What the agent needs to know about the restaurant. Saved on the agent
// (settings.restaurant). The menu and deals come from the Menu & Deals
// page and are appended at sync time, so they are not part of this.
export type RestaurantProfile = {
  urduName: string;       // how callers say the name, e.g. "ڈومینوز پیزا"
  city: string;
  branches: string;       // e.g. "F-7 Markaz, G-11 Markaz"
  hours: string;          // e.g. "12 pm to 2 am, every day"
  deliveryAreas: string;  // e.g. "F-6, F-7, F-8, G-9, G-10, G-11"
  deliveryTime: string;   // e.g. "35 to 45 minutes"
  minOrder: string;       // e.g. "Rs 800"
  deliveryFee: string;    // e.g. "Free above Rs 1,500, otherwise Rs 150"
  payment: string;        // e.g. "Cash on delivery, JazzCash, card on delivery"
  reservations: boolean;
};

export const EMPTY_RESTAURANT: RestaurantProfile = {
  urduName: "",
  city: "",
  branches: "",
  hours: "",
  deliveryAreas: "",
  deliveryTime: "",
  minOrder: "",
  deliveryFee: "",
  payment: "Cash on delivery",
  reservations: false,
};

export interface PromptInput {
  name: string;
  industry: string | null;
  useCase: string | null;
  website: string;
  mainGoal: string;
  defaultLanguage: string;
  additionalLanguages: string[];
  behaviorTraits: string[];
  restaurant?: RestaurantProfile;
}

// System prompt for an Urdu restaurant front-desk agent. Instructions are
// in English (models follow them best), replies are in Urdu script. The
// call flow is Callen's voice convention: greet, confirm each item, offer
// one deal, verify address, restate the order with total + payment + ETA.
// Restaurant details and the menu are NOT baked in here: the runtime sync
// appends them (restaurantFactsSection + the Menu & Deals page), so
// editing hours or prices never overwrites hand edits to this prompt.
export function buildSystemPrompt(input: PromptInput): string {
  const restaurant = input.name.trim() || "the restaurant";
  const kind = industryLabel(input.industry);
  const r = { ...EMPTY_RESTAURANT, ...(input.restaurant ?? {}) };
  const goal = input.mainGoal.trim();
  const traitLines = traitsToPromptLines(input.behaviorTraits);

  const sections: string[] = [];

  sections.push(
    [
      "# Role",
      `You are the phone receptionist for ${restaurant}${kind ? `, a ${kind.toLowerCase()} restaurant` : ""}${
        r.city ? ` in ${r.city}` : " in Pakistan"
      }. Customers call to place takeaway or delivery orders, ask about the menu and deals, check their order, or book a table.`,
      "Always reply in Urdu, written in Urdu (Nastaliq) script. Callers mix English words into Urdu (pizza, deal, order, delivery); understand them and use the same words naturally. If a caller speaks only English, reply in simple English.",
    ].join("\n")
  );

  if (goal) sections.push(["# Goal", goal].join("\n"));

  sections.push(
    [
      "# Taking an order",
      "1. Greet warmly (assalam o alaikum, khush amdeed) and ask what they would like.",
      "2. Take items one by one. Confirm each item back with size, quantity and flavour.",
      "3. Suggest one relevant deal from the menu, once. Never push.",
      "4. Ask takeaway or delivery. For delivery, take the full address and check it is in a delivery area.",
      "5. Take the caller's name and phone number.",
      "6. Restate the full order, the total in rupees, the payment method and when it will be ready or delivered. Ask them to confirm.",
      "7. Thank them warmly and close.",
    ].join("\n")
  );

  const style = [
    "Keep every reply short: one or two sentences, under 25 words.",
    "Ask one question at a time.",
    "Say prices and numbers as Urdu words.",
    "Sound like a friendly, capable person at the counter, never like a phone menu.",
    ...traitLines,
  ];
  sections.push(["# Style", ...style.map((l) => `- ${l}`)].join("\n"));

  sections.push(
    [
      "# Rules",
      "- Use the Restaurant details and Menu sections below as your only source of facts.",
      "- Only offer items, deals and prices from the menu. Never invent an item, a price or a deal.",
      "- If something is not on the menu or you do not know, say so politely and offer to take a message for the manager.",
      "- Do not take delivery orders outside the delivery areas; offer takeaway instead.",
      "- For complaints, apologise once, take the order details and phone number, and promise a call back from the manager.",
      "- If the caller asks whether you are an AI, answer honestly and keep helping.",
    ].join("\n")
  );

  return sections.join("\n\n");
}

// The facts block the runtime sync appends after the system prompt.
export function restaurantFactsSection(
  profile: Partial<RestaurantProfile> | null | undefined,
  website?: string | null
): string {
  const r = { ...EMPTY_RESTAURANT, ...(profile ?? {}) };
  const facts: string[] = [];
  if (r.urduName) facts.push(`Restaurant name in Urdu (always say it like this): ${r.urduName}`);
  if (r.city) facts.push(`City: ${r.city}`);
  if (r.branches) facts.push(`Branches: ${r.branches}`);
  if (r.hours) facts.push(`Opening hours: ${r.hours}`);
  if (r.deliveryAreas) facts.push(`Delivery areas: ${r.deliveryAreas}`);
  if (r.deliveryTime) facts.push(`Delivery time: ${r.deliveryTime}`);
  if (r.minOrder) facts.push(`Minimum order for delivery: ${r.minOrder}`);
  if (r.deliveryFee) facts.push(`Delivery fee: ${r.deliveryFee}`);
  if (r.payment) facts.push(`Payment methods: ${r.payment}`);
  facts.push(
    r.reservations
      ? "Table reservations: yes. Take name, phone number, date, time and number of guests."
      : "Table reservations: not taken by phone."
  );
  if (website?.trim()) facts.push(`Website: ${website.trim()}`);
  return ["# Restaurant details", ...facts.map((f) => `- ${f}`)].join("\n");
}

// The greeting is spoken word for word, so it uses the Urdu spelling of the
// name when there is one: English letters inside an Urdu sentence make the
// voice stumble.
export function buildFirstMessage(input: {
  name: string;
  useCase: string | null;
  defaultLanguage?: string;
  urduName?: string;
}): string {
  const name = input.urduName?.trim() || input.name.trim();
  const welcome = name ? `${name} میں خوش آمدید` : "خوش آمدید";
  if (input.useCase === "reservation") {
    return `السلام علیکم! ${welcome}۔ ٹیبل بک کرنی ہے یا آرڈر دینا ہے؟`;
  }
  return `السلام علیکم! ${welcome}۔ آج آپ کیا آرڈر کرنا چاہیں گے؟`;
}

// Note exported here so the wizard and editor render the icons by id.
export type { LucideIcon };
