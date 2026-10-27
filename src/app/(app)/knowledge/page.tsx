// Knowledge Base became Menu & Deals: for a restaurant agent, the menu
// IS the knowledge base. Old links land on the new page.

import { redirect } from "next/navigation";

export default function KnowledgePage() {
  redirect("/menu");
}
