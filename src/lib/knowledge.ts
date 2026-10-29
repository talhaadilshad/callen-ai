// Knowledge Base documents: restaurant info, policies and FAQs (the menu
// and deals live in src/lib/menu.ts). Shared types, starter templates,
// and the formatter the runtime sync uses to append enabled documents to
// an agent's instructions. Plain functions, safe on server and client.

// "pronunciation" rows are tiny: title = how it's written on the menu,
// content = how callers say it in Urdu script (BBQ -> باربی کیو).
export type DocKind = "info" | "policy" | "faq" | "pronunciation";

export type KnowledgeDoc = {
  id: string;
  workspace_id: string;
  kind: DocKind;
  title: string;
  content: string;
  enabled: boolean;
  sort: number;
};

export const DOC_KINDS: { kind: DocKind; label: string; section: string; blurb: string }[] = [
  { kind: "info",   label: "Restaurant info", section: "Restaurant information", blurb: "About you, your story, branches, specialities, parking, dine-in." },
  { kind: "policy", label: "Policies",        section: "Policies",               blurb: "Ordering, delivery, refunds, payment, cancellations." },
  { kind: "faq",    label: "FAQs",            section: "Frequently asked questions", blurb: "Questions callers ask often, with the answer you want given." },
  { kind: "pronunciation", label: "Pronunciation", section: "Pronunciation for this restaurant (say these exactly like this; this list wins over the general one)", blurb: "How your item and brand names are said in Urdu, so the voice never spells them letter by letter." },
];

export const DOC_CONTENT_MAX = 20000;

// Everything appended to an agent (restaurant details + menu + documents)
// should stay under this so instructions remain fast and focused.
export const KNOWLEDGE_CHAR_BUDGET = 40000;

// Starter documents shown on an empty tab; the owner edits the details.
export const DOC_TEMPLATES: Record<DocKind, { title: string; content: string }[]> = {
  info: [
    {
      title: "About us",
      content:
        "We are a family-run restaurant serving fresh, made-to-order food since 2015.\nSpecialities: ...\nDine-in seating for 60 guests. Free parking in front of the restaurant.",
    },
    {
      title: "Branches and timings",
      content: "F-7 Markaz: 12 pm to 2 am, every day.\nG-11 Markaz: 12 pm to 1 am, closed Friday 1 pm to 2:30 pm for Jummah.",
    },
  ],
  policy: [
    {
      title: "Delivery policy",
      content:
        "We deliver to F-6, F-7, F-8, G-9, G-10 and G-11.\nDelivery takes 35 to 45 minutes; up to 60 minutes on weekends.\nMinimum order Rs 800. Delivery is free above Rs 1,500, otherwise Rs 150.",
    },
    {
      title: "Order policy",
      content:
        "Orders can be changed within 5 minutes of placing them.\nLarge orders (more than 10 items) need 1 hour notice.\nWe confirm every delivery order by phone before sending the rider.",
    },
    {
      title: "Refund and complaints policy",
      content:
        "If an item is missing or wrong, we replace it or refund it on the next order.\nComplaints are passed to the branch manager, who calls back within one hour.\nWe do not refund for late delivery but offer a free drink on the next order.",
    },
    {
      title: "Payment policy",
      content: "Cash on delivery, JazzCash, Easypaisa and card on delivery are accepted. Bank transfer for catering orders only.",
    },
  ],
  faq: [
    {
      title: "Do you have vegetarian options?",
      content: "Yes: vegetable pizza, paneer tikka and the veggie burger. Ask for no-onion or no-garlic and we will prepare it.",
    },
    {
      title: "Is the food halal?",
      content: "Yes, all our meat is 100% halal and sourced from certified suppliers.",
    },
  ],
  pronunciation: [],
};

// The documents block appended to an agent's instructions. Disabled or
// empty documents are left out.
export function knowledgeSection(docs: Pick<KnowledgeDoc, "kind" | "title" | "content" | "enabled" | "sort">[]): string {
  const live = docs.filter((d) => d.enabled && d.content.trim());
  const blocks: string[] = [];
  for (const { kind, section } of DOC_KINDS) {
    const rows = live
      .filter((d) => d.kind === kind)
      .sort((a, b) => a.sort - b.sort || a.title.localeCompare(b.title));
    if (rows.length === 0) continue;
    const body =
      kind === "pronunciation"
        ? rows.map((d) => `${d.title} = ${d.content.trim()}`).join("\n")
        : rows
            .map((d) => (kind === "faq" ? `Q: ${d.title}\nA: ${d.content.trim()}` : `## ${d.title}\n${d.content.trim()}`))
            .join("\n\n");
    blocks.push(`# ${section}\n${body}`);
  }
  return blocks.join("\n\n");
}
