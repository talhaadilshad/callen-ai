// Top header — restructured to match the ElevenLabs reference.
// Left: sidebar toggle icon + page title from pathname.
// Right: What's new pill + functional Docs / Ask / Notifications + user menu.
// Feedback has been removed.

"use client";

import { useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { UserMenu } from "./user-menu";
import { DocsButton } from "./header/docs-sheet";
import { AskButton, type AskHandle } from "./header/ask-sheet";
import { NotificationsButton } from "./header/notifications-button";

// Map pathname prefixes to a clean page title. Order matters — longest match wins.
const PAGE_TITLES: Array<{ match: string; title: string }> = [
  { match: "/calls/live",      title: "Live Calls" },
  { match: "/calls",           title: "Call History" },
  { match: "/phone-numbers",   title: "Phone Numbers" },
  { match: "/whatsapp",        title: "WhatsApp" },
  { match: "/menu",            title: "Knowledge Base" },
  { match: "/knowledge",       title: "Knowledge Base" },
  { match: "/tools",           title: "Tools" },
  { match: "/voices",          title: "Voices" },
  { match: "/integrations",    title: "Integrations" },
  { match: "/agent",           title: "Agents" },
  { match: "/analytics",       title: "Analytics" },
  { match: "/users",           title: "Users" },
  { match: "/settings",        title: "Settings" },
  { match: "/tenants",         title: "Tenants" },
  { match: "/dashboard",       title: "Home" },
];

function titleFor(pathname: string): string {
  for (const { match, title } of PAGE_TITLES) {
    if (pathname === match || pathname.startsWith(match + "/")) return title;
  }
  return "Home";
}

export function Header() {
  const pathname = usePathname();
  const title = titleFor(pathname);
  // Imperative handle so the Docs sheet's "Ask the assistant" CTA can
  // open the Ask sheet from outside.
  const askRef = useRef<AskHandle>(null);

  return (
    <header className="h-14 shrink-0 border-b border-neutral-200 bg-white/95 backdrop-blur-md flex items-center px-4 lg:px-5 gap-2 sticky top-0 z-30">
      {/* Left: sidebar collapse icon + page title */}
      <button
        className="size-7 rounded-md hover:bg-neutral-100 flex items-center justify-center text-neutral-600 transition-colors"
        aria-label="Toggle sidebar"
        onClick={() => toast("Sidebar collapse coming soon")}
      >
        <PanelLeftClose className="size-3.5" />
      </button>
      <h1 className="text-[15px] font-semibold tracking-tight">{title}</h1>

      <div className="flex-1" />

      {/* Right cluster */}
      <div className="hidden sm:flex items-center gap-1">
        <WhatsNewPill />
        <DocsButton onAskAi={() => askRef.current?.open()} />
        <AskButton ref={askRef} />
      </div>

      <NotificationsButton />

      <UserMenu />
    </header>
  );
}

// =============================================================
// "What's new" pill — gradient-ringed toast for the latest changelog
// =============================================================

function WhatsNewPill() {
  // Links straight to the public changelog page, which is the actual
  // source of truth for shipped changes. Replaces the earlier toast
  // that just listed three shipped-weeks-ago items.
  return (
    <Link
      href="/changelog"
      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-white border border-transparent text-[12px] font-medium text-neutral-800 transition-colors hover:text-neutral-950 relative overflow-hidden"
      style={{
        backgroundImage:
          "linear-gradient(white, white), linear-gradient(120deg, #c084fc, #38bdf8, #fb7185)",
        backgroundOrigin: "border-box",
        backgroundClip: "padding-box, border-box",
        border: "1px solid transparent",
      }}
    >
      <Sparkles className="size-3.5" />
      What&apos;s new
    </Link>
  );
}
