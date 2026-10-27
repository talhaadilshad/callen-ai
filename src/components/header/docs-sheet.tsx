// Documentation sheet. Opens when the user clicks Docs in the header.
// 8 grouped sections of help articles, searchable + filterable by
// category. Each article expands inline to show full content. Deep
// links open the relevant page in the app.

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  BookOpen,
  Search,
  Rocket,
  Bot,
  BookOpenText,
  Wrench,
  Boxes,
  Smartphone,
  MessageCircle,
  BarChart3,
  Users as UsersIcon,
  CreditCard,
  Sparkles,
  ChevronDown,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";

type Article = {
  id: string;
  title: string;
  body: string;       // 2 to 4 short paragraphs
  href?: string;      // optional deep link "Open in app"
  hrefLabel?: string;
};

type Category = {
  id: string;
  label: string;
  icon: LucideIcon;
  articles: Article[];
};

const DOCS: Category[] = [
  {
    id: "start",
    label: "Getting started",
    icon: Rocket,
    articles: [
      {
        id: "start-1",
        title: "Your first 5 minutes on Callen",
        body: "Open the sidebar and pick Agents to spin up your first voice agent. Most teams start by cloning the template that matches their business (Cheezious Order Agent, Hotel Reservation, Customer Support Pro). The template ships with a workflow, voice, and starter prompts you can tune.\n\nOnce the agent is published, head to Phone Numbers to buy a Pakistani +92 number or port your existing landline. Assign the number to the agent and the line is live.",
        href: "/agent",
        hrefLabel: "Open Agents",
      },
      {
        id: "start-2",
        title: "How the cascaded pipeline works",
        body: "Callen uses a cascaded pipeline: Twilio brings the audio in, Whisper transcribes Urdu and English, an LLM picks an intent and a response, and ElevenLabs voices the reply back over the phone. End-to-end latency is under 800ms in the median case.\n\nThis is different from native speech-to-speech models. Urdu support in those is still weak in 2026, so we keep the pipeline modular for per-language quality.",
      },
      {
        id: "start-3",
        title: "What's mocked vs. live",
        body: "The dashboard is fully functional with persistent local data. The voice pipeline itself is in private beta. To run a live call today, your account manager needs to flip the Twilio webhook on the assigned number. Reach out via the Ask panel if you want early access.",
      },
    ],
  },
  {
    id: "agents",
    label: "Agents",
    icon: Bot,
    articles: [
      {
        id: "agents-1",
        title: "Building an agent from a template",
        body: "Pick a template from the Agents grid, click Use template, then edit the system prompt, voice, and workflow. Every node in the workflow maps to a step in the call: greet, identify intent, capture details, call a tool, end. Edit nodes inline by clicking them in the canvas.",
        href: "/agent",
        hrefLabel: "Open Agents",
      },
      {
        id: "agents-2",
        title: "Customizing the agent's voice",
        body: "Each agent has a voice picked from the ElevenLabs library. To swap voices, open the agent and choose from Amna (Urdu), Zara (English), Sofia (Warm), Alex (Energetic), or Olive (Patient). You can preview each voice before publishing.\n\nMixed-language callers are handled automatically. The agent will start in the configured default language and switch the moment the caller does.",
      },
      {
        id: "agents-3",
        title: "Locked agent voice convention",
        body: "All agents follow the respectful structured Pakistani call-center flow by default: assalam alaikum greeting, confirm each item back, suggest one deal (never push), verify address, restate full order with total and payment before closing. Keep agent turns under 25 words.",
      },
      {
        id: "agents-4",
        title: "Testing the agent before going live",
        body: "Open the Preview tab on any agent. Tap the orb to start a mock conversation. The orb shifts speakers in real time, runs the workflow, and shows you what the agent would say. No phone number, no charges.",
      },
    ],
  },
  {
    id: "kb",
    label: "Knowledge base",
    icon: BookOpenText,
    articles: [
      {
        id: "kb-1",
        title: "Adding your menu and deals",
        body: "Open Menu & Deals in the sidebar. Add items one by one, or use Paste menu to import a whole menu as text. Turn an item off when it runs out, then press Update live agents so callers hear the change.",
        href: "/menu",
        hrefLabel: "Open Menu & Deals",
      },
      {
        id: "kb-2",
        title: "RAG storage limits",
        body: "Pro accounts include 1 MB of indexed RAG storage. The pill at the top of the Knowledge Base page shows live usage. To free up space, remove documents you no longer use or upgrade to Enterprise (10 MB).\n\nIndexing is incremental. Removing a document frees its chunks immediately.",
      },
      {
        id: "kb-3",
        title: "How retrieval works during a call",
        body: "When the agent needs to answer a knowledge question, it searches your indexed chunks by semantic similarity. Top 5 chunks are passed to the LLM as context. The retrieval step adds about 80ms to the call.",
      },
    ],
  },
  {
    id: "tools",
    label: "Tools",
    icon: Wrench,
    articles: [
      {
        id: "tools-1",
        title: "Webhook tools vs client tools vs integration tools",
        body: "Webhook tools call your HTTP endpoint. Client tools run in the call session itself with no network call (good for things like transferToManager). Integration tools call a pre-connected provider with your saved credentials.\n\nDefine the parameter schema once and the agent will fill those parameters from the conversation automatically.",
        href: "/tools",
        hrefLabel: "Open Tools",
      },
      {
        id: "tools-2",
        title: "Authentication options",
        body: "Webhook tools support a static API key in the headers or HMAC signing with a per-tool secret. Integration tools use OAuth where supported. Custom MCP servers can use any auth scheme; Callen passes the credentials through opaquely.",
      },
    ],
  },
  {
    id: "integrations",
    label: "Integrations",
    icon: Boxes,
    articles: [
      {
        id: "int-1",
        title: "Connecting an integration",
        body: "Open Integrations in the sidebar. Pick a provider from the marketplace (Foodpanda, HubSpot, Zendesk, etc.) and click Install. For OAuth-based ones, you'll be redirected to grant access; for API-key ones, paste your key.\n\nOnce connected, the integration's tools become available to all agents in the workspace.",
        href: "/integrations",
        hrefLabel: "Open Integrations",
      },
      {
        id: "int-2",
        title: "Custom MCP servers",
        body: "If your business uses something not in our marketplace, click Add integration and point Callen at your MCP server URL. The server's exposed tools will appear under /tools tagged with the integration name.",
      },
    ],
  },
  {
    id: "phone",
    label: "Phone numbers + WhatsApp",
    icon: Smartphone,
    articles: [
      {
        id: "phone-1",
        title: "Buying a phone number",
        body: "Open Phone Numbers. Click Buy number, filter to Pakistan, and pick from the Karachi, Lahore, Islamabad, or Peshawar listings. Numbers cost about $4.50 a month and include voice and SMS capabilities by default.",
        href: "/phone-numbers",
        hrefLabel: "Open Phone Numbers",
      },
      {
        id: "phone-2",
        title: "Porting your existing landline",
        body: "Port-in takes about 5 business days. We need a Letter of Authorization on your business letterhead and a recent phone bill. Submit both via your account manager and we'll handle the carrier-to-carrier transfer.",
      },
      {
        id: "phone-3",
        title: "Connecting WhatsApp Business",
        body: "Open WhatsApp in the sidebar. Tap Connect to start the Meta Business verification flow. Once verified, the agent can send templates and respond to incoming WhatsApp threads with the same brain that takes your phone calls.",
        href: "/whatsapp",
        hrefLabel: "Open WhatsApp",
      },
    ],
  },
  {
    id: "analytics",
    label: "Analytics + call history",
    icon: BarChart3,
    articles: [
      {
        id: "an-1",
        title: "Reading the dashboard",
        body: "The Home page shows 7 KPI tabs (General, Evaluation, Data Collection, Audio, Tools, LLMs, Knowledge Base) plus a filter pill bar (range, granularity, agent). Each tab has 6 KPIs and a linked area chart. Switch tabs to see different metric categories.",
        href: "/dashboard",
        hrefLabel: "Open Home",
      },
      {
        id: "an-2",
        title: "Inspecting a specific call",
        body: "Open Call History from the Monitor section. Filter by date, language, intent, or outcome. Click any call row to see the full transcript, sentiment timeline, tool execution log, and option to download the audio.",
        href: "/calls",
        hrefLabel: "Open Call History",
      },
      {
        id: "an-3",
        title: "Live monitoring",
        body: "Live Calls shows active conversations in real time: caller info on the left, transcript streaming in the center, detected intents and tool calls on the right. Click any call to focus. Listen-in tap is silent to the caller.",
        href: "/calls/live",
        hrefLabel: "Open Live Calls",
      },
    ],
  },
  {
    id: "team",
    label: "Team + settings",
    icon: UsersIcon,
    articles: [
      {
        id: "team-1",
        title: "Inviting teammates",
        body: "Open Users in the sidebar. Click Add user, enter their work email, pick a role. Admin can manage agents and billing; Manager can manage agents and knowledge; Viewer is read-only. Invites are sent by email and expire after 7 days.",
        href: "/users",
        hrefLabel: "Open Users",
      },
      {
        id: "team-2",
        title: "API keys and webhooks",
        body: "Open Settings, switch to the API keys tab. Click New key to generate a production or test key. Keys are shown in full only at creation. Rotate or revoke any time. Webhook signing secrets are on the Webhooks tab.",
        href: "/settings",
        hrefLabel: "Open Settings",
      },
      {
        id: "team-3",
        title: "Plans, usage, and billing",
        body: "Pro ($199/mo) includes 5,000 voice minutes and 10,000 messages. Enterprise scales linearly with custom rates and dedicated routing regions. Usage resets on the 1st of each month and is metered live on the Billing tab.",
        href: "/settings",
        hrefLabel: "Open Billing",
      },
    ],
  },
];

const ALL_CATEGORIES = ["All", ...DOCS.map((c) => c.label)] as const;

export function DocsButton({
  triggerClassName,
  onAskAi,
}: {
  triggerClassName?: string;
  onAskAi?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<(typeof ALL_CATEGORIES)[number]>("All");
  const [expanded, setExpanded] = useState<string | null>(null);
  const router = useRouter();

  const filtered: Category[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DOCS
      .filter((c) => activeCategory === "All" || c.label === activeCategory)
      .map((c) => ({
        ...c,
        articles: c.articles.filter((a) =>
          q.length === 0
            ? true
            : `${a.title} ${a.body}`.toLowerCase().includes(q)
        ),
      }))
      .filter((c) => c.articles.length > 0);
  }, [query, activeCategory]);

  const totalMatches = filtered.reduce((s, c) => s + c.articles.length, 0);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex items-center gap-1.5 h-8 px-3 rounded-full hover:bg-neutral-100 text-[12px] font-medium text-neutral-700 transition-colors",
          triggerClassName
        )}
      >
        <BookOpen className="size-3.5" />
        Docs
      </button>

      <Sheet open={open} onOpenChange={(o) => !o && setOpen(false)}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-xl p-0 overflow-hidden flex flex-col"
          showCloseButton
        >
          {/* Header */}
          <header className="px-5 pt-5 pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-2 mb-1">
              <span className="size-7 rounded-md bg-neutral-100 flex items-center justify-center">
                <BookOpen className="size-4 text-neutral-700" />
              </span>
              <h2 className="text-base font-semibold tracking-tight">Documentation</h2>
            </div>
            <p className="text-[12px] text-neutral-500 mb-3">
              Search guides, tutorials, and references for everything in Callen.
            </p>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-neutral-400 pointer-events-none" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search docs..."
                className="pl-9 h-10 bg-neutral-50 border-neutral-200 focus-visible:bg-white"
                autoFocus
              />
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {ALL_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "px-2.5 h-7 rounded-full text-[11px] font-medium border transition-colors",
                    activeCategory === cat
                      ? "bg-neutral-950 text-white border-neutral-950"
                      : "bg-white text-neutral-700 border-neutral-200 hover:border-neutral-300"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </header>

          {/* Article list */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
            {filtered.length === 0 ? (
              <div className="py-12 text-center">
                <Sparkles className="size-5 text-neutral-400 mx-auto mb-2" />
                <p className="text-sm font-semibold tracking-tight">No results</p>
                <p className="text-[12px] text-neutral-500 mt-0.5">
                  Try different keywords or ask the assistant directly.
                </p>
                {onAskAi && (
                  <button
                    onClick={() => {
                      setOpen(false);
                      onAskAi();
                    }}
                    className="mt-3 inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-neutral-950 text-white text-[12px] font-medium hover:bg-neutral-800 transition-colors"
                  >
                    <Sparkles className="size-3.5" />
                    Ask Callen Assistant
                  </button>
                )}
              </div>
            ) : (
              filtered.map((cat) => (
                <section key={cat.id}>
                  <div className="flex items-center gap-2 mb-2">
                    <cat.icon className="size-3.5 text-neutral-500" />
                    <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-semibold">
                      {cat.label}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    {cat.articles.map((a) => {
                      const isOpen = expanded === a.id;
                      return (
                        <div
                          key={a.id}
                          className="rounded-xl border border-neutral-200 bg-white overflow-hidden"
                        >
                          <button
                            onClick={() => setExpanded(isOpen ? null : a.id)}
                            className="w-full text-left px-3.5 py-3 flex items-center gap-2 hover:bg-neutral-50/60 transition-colors"
                          >
                            <span className="flex-1 text-[13px] font-semibold tracking-tight">
                              {a.title}
                            </span>
                            <ChevronDown
                              className={cn(
                                "size-3.5 text-neutral-400 transition-transform shrink-0",
                                isOpen && "rotate-180"
                              )}
                            />
                          </button>
                          <AnimatePresence initial={false}>
                            {isOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                className="overflow-hidden border-t border-neutral-100"
                              >
                                <div className="px-3.5 py-3 text-[12.5px] text-neutral-700 leading-relaxed whitespace-pre-line">
                                  {a.body}
                                </div>
                                {a.href && (
                                  <div className="px-3.5 pb-3">
                                    <button
                                      onClick={() => {
                                        setOpen(false);
                                        router.push(a.href!);
                                      }}
                                      className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-neutral-950 text-white text-[11px] font-medium hover:bg-neutral-800 transition-colors"
                                    >
                                      {a.hrefLabel ?? "Open in app"}
                                      <ExternalLink className="size-3" />
                                    </button>
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))
            )}
          </div>

          {/* Footer */}
          <footer className="px-5 py-3 border-t border-neutral-100 bg-neutral-50/40 flex items-center justify-between">
            <p className="text-[11px] text-neutral-500">
              {totalMatches} {totalMatches === 1 ? "article" : "articles"}
            </p>
            {onAskAi && (
              <button
                onClick={() => {
                  setOpen(false);
                  onAskAi();
                }}
                className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-white border border-neutral-200 text-[11px] font-medium text-neutral-700 hover:border-neutral-300 transition-colors"
              >
                <Sparkles className="size-3" />
                Ask the assistant
              </button>
            )}
          </footer>
        </SheetContent>
      </Sheet>
    </>
  );
}
