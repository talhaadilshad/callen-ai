// Menu & Deals moved into the Knowledge Base (its first two tabs).
// Old links land there.

import { redirect } from "next/navigation";

export default function MenuPage() {
  redirect("/knowledge");
}
