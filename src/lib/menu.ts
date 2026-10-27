// Menu & Deals: shared types, the "paste your menu" parser, and the
// formatter that turns menu rows into the "Menu" section of an Urdu
// agent's instructions (used by the runtime sync). Plain functions, safe
// on both server and client.

export type MenuKind = "item" | "deal";

export type MenuItem = {
  id: string;
  workspace_id: string;
  kind: MenuKind;
  category: string;
  name: string;
  description: string;
  price_pkr: number | null;
  available: boolean;
  sort: number;
};

export type MenuDraft = Pick<MenuItem, "kind" | "category" | "name" | "description" | "price_pkr">;

export function formatPkr(price: number | null): string {
  return price === null ? "Price on request" : `Rs ${price.toLocaleString("en-US")}`;
}

// "Rs 1,299", "1299/-", "PKR 1299" -> 1299. Anything else -> null.
export function parsePkr(text: string): number | null {
  const m = text.trim().match(/^(?:rs\.?|pkr)?\s*([\d,]+)\s*(?:\/-|rs\.?|pkr)?$/i);
  if (!m) return null;
  const n = Number(m[1].replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}

// Parses a pasted menu, one entry per line:
//   "Pizzas"                          -> a heading: sets the category
//   "Pizzas:"                         -> same
//   "Chicken Tikka (Large) - 1499"    -> item with price
//   "Pizzas: Fajita (Large) - 1,599"  -> item with its own category
//   "Zinger Burger - S 450 / L 650"   -> item, sizes kept as description
//   "Deal: Family Deal - 2 large pizzas + 1.5L drink - 3299"
//                                     -> deal (a leading "Deal:" / "Deals" heading)
// A trailing " - <price>" is the price; a middle " - " part is the description.
export function parseMenuText(text: string): MenuDraft[] {
  const out: MenuDraft[] = [];
  let category = "";
  let kind: MenuKind = "item";

  for (const raw of text.split(/\r?\n/)) {
    let line = raw.trim().replace(/^[-*•]\s*/, "");
    if (!line) continue;

    // Heading line: no " - " separator and no price.
    if (!/\s[-–]\s/.test(line) && parsePkr(line.split(/\s+/).pop() ?? "") === null) {
      const heading = line.replace(/:$/, "").trim();
      kind = /^deals?$/i.test(heading) ? "deal" : "item";
      category = kind === "deal" ? "" : heading;
      continue;
    }

    let rowKind = kind;
    let rowCategory = category;
    const prefix = line.match(/^([^:\-–]{1,40}):\s*(.+)$/);
    if (prefix) {
      if (/^deals?$/i.test(prefix[1].trim())) {
        rowKind = "deal";
        rowCategory = "";
      } else {
        rowKind = "item";
        rowCategory = prefix[1].trim();
      }
      line = prefix[2];
    }

    const parts = line.split(/\s[-–]\s/).map((p) => p.trim()).filter(Boolean);
    if (parts.length === 0) continue;
    const name = parts[0];
    let description = "";
    let price: number | null = null;
    if (parts.length > 1) {
      const last = parts[parts.length - 1];
      price = parsePkr(last);
      const middle = price === null ? parts.slice(1) : parts.slice(1, -1);
      description = middle.join(" - ");
    }
    if (!name) continue;
    out.push({
      kind: rowKind,
      category: rowKind === "deal" ? "" : rowCategory,
      name: name.slice(0, 120),
      description,
      price_pkr: price,
    });
  }
  return out;
}

function line(item: Pick<MenuItem, "name" | "description" | "price_pkr">): string {
  const desc = item.description.trim();
  if (item.price_pkr === null) {
    // No single price: sizes usually live in the description ("S 450 / L 650").
    return `- ${item.name}: ${desc || "price not listed, do not quote one"}`;
  }
  return `- ${item.name}${desc ? ` (${desc})` : ""}: ${formatPkr(item.price_pkr)}`;
}

// The "Menu" + "Deals" sections appended to an agent's instructions.
// Unavailable rows are left out so the agent never offers them.
export function menuSection(items: Pick<MenuItem, "kind" | "category" | "name" | "description" | "price_pkr" | "available" | "sort">[]): string {
  const live = items.filter((i) => i.available);
  if (live.length === 0) {
    return [
      "# Menu",
      "No menu has been added yet. Do not quote any items or prices; offer to take the caller's order details and a phone number so the restaurant can call back.",
    ].join("\n");
  }

  const sorted = [...live].sort((a, b) => a.sort - b.sort || a.name.localeCompare(b.name));
  const sections: string[] = [];

  const byCategory = new Map<string, typeof sorted>();
  for (const item of sorted.filter((i) => i.kind === "item")) {
    const key = item.category.trim() || "Other items";
    byCategory.set(key, [...(byCategory.get(key) ?? []), item]);
  }
  if (byCategory.size > 0) {
    sections.push("# Menu");
    for (const [category, rows] of byCategory) {
      sections.push(`## ${category}\n${rows.map(line).join("\n")}`);
    }
  }

  const deals = sorted.filter((i) => i.kind === "deal");
  if (deals.length > 0) {
    sections.push(`# Deals\n${deals.map(line).join("\n")}`);
  }

  return sections.join("\n\n");
}
