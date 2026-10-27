// Agent template library powering /agent (Agent Studio).
// Restaurant front-desk templates a tenant can pick as a starting point.
// All follow Callen.ai's voice convention: greet warmly, confirm each
// item back, offer one deal, restate the order before closing. Urdu.

import { buildSystemPrompt } from "./agent-meta";

export type WorkflowNodeKind =
  | "start"
  | "speak"
  | "branch"
  | "tool"
  | "end";

export type WorkflowIcon =
  | "flag"
  | "message"
  | "help"
  | "wrench"
  | "card"
  | "check"
  | "hangup"
  | "calendar"
  | "dollar"
  | "search"
  | "transfer"
  | "graduate"
  | "userCheck"
  | "headphones"
  | "mic"
  | "menu"
  | "shopping"
  | "stethoscope"
  | "ticket"
  | "phone";

export type WorkflowNode = {
  id: string;
  kind: WorkflowNodeKind;
  title: string;
  description?: string;
  icon: WorkflowIcon;
  col: 0 | 1 | 2;
  row: number;
  extras?: number;
};

export type WorkflowEdge = {
  from: string;
  to: string;
  label?: string;
};

export type AgentTemplate = {
  id: string;
  name: string;
  description: string;
  category: "Orders" | "Reservations" | "Customer Care";
  integrations: number;
  avatar: string;
  previewColors: string[];
  voice: string;
  languages: string[];
  systemPrompt: string;
  workflow: {
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
  };
};

// =============================================================
// Templates
// =============================================================

// Each template's instructions come from the same builder as the
// Create Agent wizard, so a template agent and a wizard agent behave the
// same. Restaurant details (hours, delivery areas) are filled in later
// in the editor; the menu comes from Menu & Deals at sync time.
function templatePrompt(industry: string, useCase: string, goal: string): string {
  return buildSystemPrompt({
    name: "",
    industry,
    useCase,
    website: "",
    mainGoal: goal,
    defaultLanguage: "Urdu",
    additionalLanguages: [],
    behaviorTraits: ["warm", "patient", "respectful"],
  });
}

export const agentTemplates: AgentTemplate[] = [
  // 1
  {
    id: "tpl-fast-food-orders",
    name: "Fast Food & Pizza Orders",
    description: "Takes takeaway and delivery orders in Urdu, confirms every item, suggests one deal, checks the address and restates the total.",
    category: "Orders",
    integrations: 1,
    avatar: "radial-gradient(circle at 28% 30%, #fde68a 0%, transparent 40%), radial-gradient(circle at 75% 75%, #f97316 0%, transparent 55%), linear-gradient(135deg, #fb923c, #7c2d12)",
    previewColors: ["#fde68a", "#fb923c", "#f97316", "#7c2d12"],
    voice: "Shopkeeper",
    languages: ["Urdu"],
    systemPrompt: templatePrompt("fast-food", "order-taking", "Take accurate takeaway and delivery orders, and grow the order size with one well-timed deal."),
    workflow: {
      nodes: [
        { id: "start",   kind: "start",  icon: "flag",     title: "Start",                                                                                     col: 1, row: 0 },
        { id: "greet",   kind: "speak",  icon: "message",  title: "Greet caller",       description: "Assalam o alaikum, welcome the caller by restaurant name.",  col: 1, row: 1 },
        { id: "items",   kind: "speak",  icon: "menu",     title: "Take items",         description: "One item at a time. Confirm size, quantity and flavour.",    col: 1, row: 2 },
        { id: "deal",    kind: "speak",  icon: "dollar",   title: "Suggest a deal",     description: "Offer one matching deal from the menu, once.",                col: 1, row: 3 },
        { id: "mode",    kind: "branch", icon: "help",     title: "Takeaway or delivery?",                                                                     col: 1, row: 4 },
        { id: "pickup",  kind: "speak",  icon: "shopping", title: "Pickup time",        description: "Tell the caller when the order will be ready.",              col: 0, row: 5 },
        { id: "address", kind: "tool",   icon: "search",   title: "Check address",      description: "Take the full address. Check it is in a delivery area.",     col: 2, row: 5 },
        { id: "confirm", kind: "speak",  icon: "check",    title: "Restate order",      description: "Items, total in rupees, payment method and ETA.",            col: 1, row: 6 },
        { id: "end",     kind: "end",    icon: "hangup",   title: "End",                                                                                       col: 1, row: 7 },
      ],
      edges: [
        { from: "start",   to: "greet" },
        { from: "greet",   to: "items" },
        { from: "items",   to: "deal" },
        { from: "deal",    to: "mode" },
        { from: "mode",    to: "pickup",  label: "Takeaway" },
        { from: "mode",    to: "address", label: "Delivery" },
        { from: "pickup",  to: "confirm" },
        { from: "address", to: "confirm" },
        { from: "confirm", to: "end" },
      ],
    },
  },

  // 2
  {
    id: "tpl-desi-takeaway",
    name: "Desi & BBQ Takeaway",
    description: "Handles karahi, BBQ and handi orders by weight and portion, naan counts, and pre-booked pickup times for the dinner rush.",
    category: "Orders",
    integrations: 1,
    avatar: "radial-gradient(circle at 28% 30%, #fecaca 0%, transparent 40%), radial-gradient(circle at 75% 75%, #dc2626 0%, transparent 55%), linear-gradient(135deg, #ef4444, #450a0a)",
    previewColors: ["#fecaca", "#ef4444", "#dc2626", "#450a0a"],
    voice: "Biryani Reviewer",
    languages: ["Urdu"],
    systemPrompt: templatePrompt("desi-bbq", "order-taking", "Take desi and BBQ orders accurately, including weight (half or full kg), spice level, naan and roti counts, and a clear pickup or delivery time."),
    workflow: {
      nodes: [
        { id: "start",   kind: "start",  icon: "flag",     title: "Start",                                                                                     col: 1, row: 0 },
        { id: "greet",   kind: "speak",  icon: "message",  title: "Greet caller",       description: "Warm welcome by restaurant name.",                           col: 1, row: 1 },
        { id: "dishes",  kind: "speak",  icon: "menu",     title: "Take dishes",        description: "Karahi or handi by weight, BBQ by portion, spice level.",    col: 1, row: 2 },
        { id: "breads",  kind: "speak",  icon: "shopping", title: "Breads & sides",     description: "Naan, roti, raita and drinks. Suggest one platter deal.",    col: 1, row: 3 },
        { id: "time",    kind: "branch", icon: "calendar", title: "When?",                                                                                     col: 1, row: 4 },
        { id: "now",     kind: "speak",  icon: "check",    title: "As soon as ready",   description: "Share the current preparation time.",                        col: 0, row: 5 },
        { id: "later",   kind: "speak",  icon: "calendar", title: "Pre-book a time",    description: "Note the exact pickup or delivery time.",                    col: 2, row: 5 },
        { id: "confirm", kind: "speak",  icon: "check",    title: "Restate order",      description: "Dishes, total in rupees, payment and time.",                 col: 1, row: 6 },
        { id: "end",     kind: "end",    icon: "hangup",   title: "End",                                                                                       col: 1, row: 7 },
      ],
      edges: [
        { from: "start",   to: "greet" },
        { from: "greet",   to: "dishes" },
        { from: "dishes",  to: "breads" },
        { from: "breads",  to: "time" },
        { from: "time",    to: "now",   label: "Now" },
        { from: "time",    to: "later", label: "Later" },
        { from: "now",     to: "confirm" },
        { from: "later",   to: "confirm" },
        { from: "confirm", to: "end" },
      ],
    },
  },

  // 3
  {
    id: "tpl-reservations",
    name: "Table Reservations",
    description: "Books dine-in tables in Urdu: date, time, number of guests and special occasions, then confirms the booking back to the caller.",
    category: "Reservations",
    integrations: 1,
    avatar: "radial-gradient(circle at 28% 30%, #fbcfe8 0%, transparent 40%), radial-gradient(circle at 75% 75%, #db2777 0%, transparent 55%), linear-gradient(135deg, #ec4899, #500724)",
    previewColors: ["#fbcfe8", "#ec4899", "#db2777", "#500724"],
    voice: "DHA Hostess",
    languages: ["Urdu"],
    systemPrompt: templatePrompt("fine-dining", "reservation", "Book dine-in tables. Take the guest's name, phone number, date, time, number of guests and any occasion (birthday, anniversary), then confirm it back."),
    workflow: {
      nodes: [
        { id: "start",    kind: "start",  icon: "flag",      title: "Start",                                                                                  col: 1, row: 0 },
        { id: "greet",    kind: "speak",  icon: "message",   title: "Greet caller",      description: "Welcome and ask: book a table or place an order?",      col: 1, row: 1 },
        { id: "details",  kind: "speak",  icon: "calendar",  title: "Date, time, guests", description: "One question at a time.",                               col: 1, row: 2 },
        { id: "occasion", kind: "speak",  icon: "ticket",    title: "Occasion",          description: "Birthday, anniversary or business dinner?",             col: 1, row: 3 },
        { id: "contact",  kind: "tool",   icon: "userCheck", title: "Name & phone",      description: "Take the guest's name and mobile number.",              col: 1, row: 4 },
        { id: "confirm",  kind: "speak",  icon: "check",     title: "Confirm booking",   description: "Restate date, time, guests and name.",                  col: 1, row: 5 },
        { id: "end",      kind: "end",    icon: "hangup",    title: "End",                                                                                    col: 1, row: 6 },
      ],
      edges: [
        { from: "start",    to: "greet" },
        { from: "greet",    to: "details" },
        { from: "details",  to: "occasion" },
        { from: "occasion", to: "contact" },
        { from: "contact",  to: "confirm" },
        { from: "confirm",  to: "end" },
      ],
    },
  },

  // 4
  {
    id: "tpl-catering",
    name: "Catering & Bulk Orders",
    description: "Captures event and office orders: headcount, date, menu package and delivery address, then hands the lead to the manager.",
    category: "Orders",
    integrations: 1,
    avatar: "radial-gradient(circle at 28% 30%, #bbf7d0 0%, transparent 40%), radial-gradient(circle at 75% 75%, #16a34a 0%, transparent 55%), linear-gradient(135deg, #22c55e, #052e16)",
    previewColors: ["#bbf7d0", "#22c55e", "#16a34a", "#052e16"],
    voice: "Punjabi Manager",
    languages: ["Urdu"],
    systemPrompt: templatePrompt("desi-bbq", "catering", "Capture catering and bulk order enquiries: event date, headcount, menu package, delivery address, name and phone. Do not confirm final prices for large orders; promise a call back from the manager within the hour."),
    workflow: {
      nodes: [
        { id: "start",    kind: "start",  icon: "flag",      title: "Start",                                                                                 col: 1, row: 0 },
        { id: "greet",    kind: "speak",  icon: "message",   title: "Greet caller",     description: "Welcome and confirm it is a catering enquiry.",          col: 1, row: 1 },
        { id: "event",    kind: "speak",  icon: "calendar",  title: "Event details",    description: "Date, time and number of guests.",                       col: 1, row: 2 },
        { id: "menu",     kind: "speak",  icon: "menu",      title: "Menu package",     description: "Suggest packages from the menu that fit the headcount.", col: 1, row: 3 },
        { id: "contact",  kind: "tool",   icon: "userCheck", title: "Name & phone",     description: "Take name, phone number and venue address.",             col: 1, row: 4 },
        { id: "handoff",  kind: "tool",   icon: "transfer",  title: "Hand to manager",  description: "Promise a call back with the final quote.",              col: 1, row: 5 },
        { id: "end",      kind: "end",    icon: "hangup",    title: "End",                                                                                   col: 1, row: 6 },
      ],
      edges: [
        { from: "start",   to: "greet" },
        { from: "greet",   to: "event" },
        { from: "event",   to: "menu" },
        { from: "menu",    to: "contact" },
        { from: "contact", to: "handoff" },
        { from: "handoff", to: "end" },
      ],
    },
  },

  // 5
  {
    id: "tpl-order-support",
    name: "Order Status & Complaints",
    description: "Calms callers about late or wrong orders, takes the details once, and logs a call back from the manager. No arguments, no promises it can't keep.",
    category: "Customer Care",
    integrations: 1,
    avatar: "radial-gradient(circle at 28% 30%, #bae6fd 0%, transparent 40%), radial-gradient(circle at 75% 75%, #0284c7 0%, transparent 55%), linear-gradient(135deg, #0ea5e9, #082f49)",
    previewColors: ["#bae6fd", "#0ea5e9", "#0284c7", "#082f49"],
    voice: "Helpdesk Agent",
    languages: ["Urdu"],
    systemPrompt: templatePrompt("fast-food", "customer-support", "Help callers whose order is late, missing or wrong. Apologise once, take the order details, name and phone number, and promise a call back from the manager. Never argue and never promise refunds yourself."),
    workflow: {
      nodes: [
        { id: "start",   kind: "start",  icon: "flag",       title: "Start",                                                                                 col: 1, row: 0 },
        { id: "greet",   kind: "speak",  icon: "message",    title: "Greet caller",     description: "Calm, warm opening.",                                    col: 1, row: 1 },
        { id: "issue",   kind: "branch", icon: "help",       title: "What happened?",                                                                       col: 1, row: 2 },
        { id: "late",    kind: "speak",  icon: "search",     title: "Late order",       description: "Apologise. Take order time and phone number.",           col: 0, row: 3 },
        { id: "wrong",   kind: "speak",  icon: "headphones", title: "Wrong or missing", description: "Apologise once. Note exactly what was wrong.",           col: 2, row: 3 },
        { id: "handoff", kind: "tool",   icon: "transfer",   title: "Manager call back", description: "Log the complaint for the manager.",                    col: 1, row: 4 },
        { id: "end",     kind: "end",    icon: "hangup",     title: "End",                                                                                   col: 1, row: 5 },
      ],
      edges: [
        { from: "start",   to: "greet" },
        { from: "greet",   to: "issue" },
        { from: "issue",   to: "late",  label: "Late" },
        { from: "issue",   to: "wrong", label: "Wrong / missing" },
        { from: "late",    to: "handoff" },
        { from: "wrong",   to: "handoff" },
        { from: "handoff", to: "end" },
      ],
    },
  },
];

export const templateCategories = [
  "All",
  "Orders",
  "Reservations",
  "Customer Care",
] as const;
