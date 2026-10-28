// Ask Callen Assistant — chat sheet wired to a keyword-scored knowledge
// base. The "AI" is intentionally local (no LLM call): faster, free, and
// every demo session behaves identically. The KB covers the most common
// setup and how-to questions across the dashboard.

"use client";

import { useEffect, useImperativeHandle, useRef, useState, forwardRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  MessageCircleMore,
  Sparkles,
  Send,
  ArrowRight,
  RefreshCw,
  Bot,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";

// =============================================================
// Knowledge base
// =============================================================

type Link = { label: string; href: string };

type QA = {
  // Lowercase keywords. Score is the count of these found in the user's
  // query. The highest scoring entry wins; ties break by KB order.
  keywords: string[];
  answer: string;
  links?: Link[];
  followups?: string[];
};

const KB: QA[] = [
  {
    keywords: ["create", "new", "agent", "build", "start agent", "make agent", "add agent"],
    answer:
      "Open Agents from the sidebar and click Create agent. You can clone any of the 15 templates (Cheezious Order Agent, Customer Support Pro, Hotel Reservation, and more) or start blank. Each template ships with a workflow, voice, and starter prompts you can tune. Test it in the Preview tab before publishing.",
    links: [{ label: "Open Agents", href: "/agent" }],
    followups: [
      "How do I change the agent's voice?",
      "How do I test the agent?",
      "Can the agent speak Urdu?",
    ],
  },
  {
    keywords: ["voice", "change voice", "switch voice", "pick voice", "voice options"],
    answer:
      "Open any agent and choose from Amna (Urdu), Zara (English), Sofia (Warm), Alex (Energetic), or Olive (Patient). Each voice is preview-playable before you save. Mixed-language callers are handled automatically: the agent starts in your default language and switches the moment the caller does.",
    links: [{ label: "Open Agents", href: "/agent" }],
    followups: ["What languages are supported?", "Can I clone my own voice?"],
  },
  {
    keywords: ["test", "preview", "try", "demo"],
    answer:
      "Every agent has a Preview tab. Tap the orb to start a mock conversation. The orb shifts speakers in real time, runs the workflow, and shows what the agent would say. No phone number, no charges. When you're ready to go live, assign a phone number from the Phone Numbers page.",
    links: [{ label: "Open Agents", href: "/agent" }],
  },
  {
    keywords: ["phone", "number", "buy", "twilio", "+92", "pakistan number"],
    answer:
      "Open Phone Numbers. Click Buy number, filter to Pakistan, and pick from Karachi, Lahore, Islamabad, or Peshawar listings. Numbers run about $4.50 a month and include voice and SMS. Assign the number to an agent and the line is live.",
    links: [{ label: "Open Phone Numbers", href: "/phone-numbers" }],
    followups: ["Can I port my existing landline?", "How do I assign a number to an agent?"],
  },
  {
    keywords: ["port", "porting", "landline", "existing line", "transfer number"],
    answer:
      "Port-in takes about 5 business days. We need a Letter of Authorization on your business letterhead plus a recent phone bill. Submit both via your account manager and we handle the carrier-to-carrier transfer. Your line stays active throughout the process.",
    links: [{ label: "Open Phone Numbers", href: "/phone-numbers" }],
  },
  {
    keywords: ["whatsapp", "messaging", "templates", "wa", "message"],
    answer:
      "Open WhatsApp in the sidebar and tap Connect to start the Meta Business verification flow. Once verified, the agent can send templates (order confirmations, rider updates) and respond to inbound threads with the same brain that takes your calls.",
    links: [{ label: "Open WhatsApp", href: "/whatsapp" }],
    followups: ["How long does WhatsApp verification take?"],
  },
  {
    keywords: ["knowledge", "kb", "document", "upload", "menu", "faq", "pdf"],
    answer:
      "Open Knowledge Base. Add menu items and deals (or paste a whole menu), plus documents for restaurant info, policies and FAQs; upload a .txt, .md or PDF if you have one. Your agents only answer from here, so press Update live agents after changes.",
    links: [{ label: "Open Knowledge Base", href: "/knowledge" }],
    followups: ["What file types are supported?", "How does retrieval work?"],
  },
  {
    keywords: ["rag", "retrieval", "chunk", "embedding", "vector"],
    answer:
      "Every time an agent is updated it receives your restaurant details plus everything switched on in the Knowledge Base: menu, deals, info, policies and FAQs. Anything turned off is left out, so the agent never mentions it.",
    links: [{ label: "Open Knowledge Base", href: "/knowledge" }],
  },
  {
    keywords: ["tool", "webhook", "mcp", "function", "endpoint"],
    answer:
      "Open Tools. There are three kinds: Webhook tools call your HTTP endpoint, Client tools run in the call with no network call (great for transferToManager), Integration tools call a connected provider with saved credentials. Define the parameter schema once and the agent fills it from the conversation.",
    links: [{ label: "Open Tools", href: "/tools" }],
    followups: ["How do I authenticate a webhook?", "Can I add a custom MCP server?"],
  },
  {
    keywords: ["integration", "connect", "foodpanda", "hubspot", "stripe", "zapier", "marketplace"],
    answer:
      "Open Integrations and pick a provider from the marketplace (Foodpanda, HubSpot, Zendesk, Stripe, Notion, Google Calendar, Slack, Zapier, Airtable). Click Install. For OAuth providers you'll be redirected to grant access; for API-key ones, paste your key.",
    links: [{ label: "Open Integrations", href: "/integrations" }],
    followups: ["What if my tool is not in the marketplace?"],
  },
  {
    keywords: ["custom", "mcp server", "self hosted", "not in marketplace"],
    answer:
      "Click Add integration in the top right of the Integrations page. Point Callen at your MCP server URL and supply credentials. The server's exposed tools will appear under Tools tagged with your integration name.",
    links: [{ label: "Open Integrations", href: "/integrations" }],
  },
  {
    keywords: ["call history", "past calls", "transcript", "recording"],
    answer:
      "Open Call History from the Monitor section. Filter by date, language, intent, or outcome. Click any row to see the full transcript, sentiment timeline, tool execution log, and a download-recording button.",
    links: [{ label: "Open Call History", href: "/calls" }],
  },
  {
    keywords: ["live", "monitor", "current call", "real time"],
    answer:
      "Live Calls shows active conversations in real time. Active calls list is on the left, transcript streams in the center, detected intents and tool calls on the right. Click any call to focus on it. The listen-in tap is silent to the caller.",
    links: [{ label: "Open Live Calls", href: "/calls/live" }],
  },
  {
    keywords: ["analytics", "metrics", "report", "kpi", "dashboard"],
    answer:
      "Home gives you 7 KPI tabs (General, Evaluation, Data Collection, Audio, Tools, LLMs, Knowledge Base) plus filter pills for range, granularity, and agent. Each tab has 6 KPIs and a linked area chart. For deeper drill-downs, the Analytics page has the full layout.",
    links: [
      { label: "Open Home", href: "/dashboard" },
      { label: "Open Analytics", href: "/analytics" },
    ],
  },
  {
    keywords: ["team", "invite", "user", "role", "permission", "add member"],
    answer:
      "Open Users in the sidebar. Click Add user, enter their work email, pick a role. Admin manages everything including billing. Manager manages agents and knowledge. Viewer is read-only. Invites are emailed and expire after 7 days.",
    links: [{ label: "Open Users", href: "/users" }],
    followups: ["How do I change a teammate's role?"],
  },
  {
    keywords: ["api key", "rotate", "revoke", "developer", "secret"],
    answer:
      "Open Settings, switch to the API keys tab. Click New key to generate one. The full key is shown only at creation; copy it then. You can show, copy, rotate, or revoke any time. Webhook signing secrets live on the Webhooks tab.",
    links: [{ label: "Open Settings", href: "/settings" }],
  },
  {
    keywords: ["pricing", "plan", "billing", "subscription", "cost", "upgrade", "price"],
    answer:
      "Pro is $199 a month and includes 5,000 voice minutes plus 10,000 messages. Enterprise scales linearly with custom rates and dedicated routing regions. Usage resets on the 1st of each month and is metered live on the Billing tab.",
    links: [{ label: "Open Billing", href: "/settings" }],
  },
  {
    keywords: ["language", "urdu", "english", "multilingual", "punjabi"],
    answer:
      "All agents handle Urdu and English natively, including code-switching mid-call. The cascaded pipeline (Whisper for STT, LLM for reasoning, ElevenLabs for TTS) gives per-language quality control. Punjabi and Sindhi support is in private beta. Reach out if you want early access.",
  },
  {
    keywords: ["escalation", "escalate", "transfer", "human", "manager"],
    answer:
      "Agents can hand off via the transferToManager client tool. Configure when this fires in the agent's workflow (low sentiment, repeat complaint, explicit request). The escalation goes to a callback queue with the full transcript and intent timeline attached.",
    links: [{ label: "Open Agents", href: "/agent" }],
  },
  {
    keywords: ["workflow", "node", "branch", "flow"],
    answer:
      "Each agent has a visual workflow. Nodes represent call steps (greet, identify intent, capture details, call a tool, end). Edges connect steps and can carry conditions ('caller wants to order', 'caller has a complaint'). Drag the empty canvas to pan, use the corner controls to zoom.",
    links: [{ label: "Open Agents", href: "/agent" }],
  },
];

const SUGGESTED = [
  "How do I create a new agent?",
  "How do I buy a phone number?",
  "How do I add to the knowledge base?",
  "What languages are supported?",
  "How do I invite teammates?",
];

const GREETING =
  "Hi! I'm the Callen Assistant. I can help you set up agents, connect phone numbers, manage knowledge, and figure out the dashboard. Ask me anything, or try one of the suggestions below.";

// =============================================================
// Response matcher
// =============================================================

type MatchResult = { answer: string; links?: Link[]; followups?: string[] };

function tokenize(s: string): string[] {
  return s.toLowerCase().replace(/[^a-z0-9 +]/g, " ").split(/\s+/).filter(Boolean);
}

function scoreEntry(query: string, entry: QA): number {
  const q = query.toLowerCase();
  const tokens = new Set(tokenize(query));
  let score = 0;
  for (const kw of entry.keywords) {
    // Exact phrase bonus
    if (q.includes(kw)) score += kw.includes(" ") ? 4 : 2;
    // Single-token match bonus
    if (!kw.includes(" ") && tokens.has(kw)) score += 1;
  }
  return score;
}

function matchResponse(rawQuery: string): MatchResult {
  const q = rawQuery.trim();
  if (q.length === 0) {
    return { answer: "What would you like help with?" };
  }

  // Greetings
  if (/^(hi|hello|hey|salam|assalam|good (morning|afternoon|evening))\b/i.test(q)) {
    return {
      answer:
        "Hello! What would you like help with today? You can ask about agents, phone numbers, knowledge, integrations, or the dashboard.",
      followups: SUGGESTED.slice(0, 3),
    };
  }

  // Thanks
  if (/^(thanks|thank you|shukria|shukriya)\b/i.test(q)) {
    return {
      answer: "Anytime. Anything else I can help with?",
      followups: SUGGESTED.slice(0, 3),
    };
  }

  // Very short query
  if (q.length < 3) {
    return { answer: "I didn't catch that. Can you rephrase?" };
  }

  // Score every KB entry
  let bestScore = 0;
  let best: QA | null = null;
  for (const entry of KB) {
    const score = scoreEntry(q, entry);
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }

  if (best && bestScore >= 2) {
    return { answer: best.answer, links: best.links, followups: best.followups };
  }

  // Fallback
  return {
    answer:
      "I'm not sure how to answer that one. Try asking about agents, phone numbers, the knowledge base, integrations, tools, analytics, or team and billing. You can also browse the full Docs panel for written guides.",
    followups: SUGGESTED,
  };
}

// =============================================================
// Imperative handle so the header can open this from elsewhere
// (e.g. the Docs sheet has an "Ask the assistant" button).
// =============================================================

export type AskHandle = {
  open: () => void;
};

// =============================================================
// Component
// =============================================================

type Message = {
  id: string;
  role: "user" | "bot";
  text: string;
  links?: Link[];
  followups?: string[];
};

const greetingMessage = (): Message => ({
  id: "greet",
  role: "bot",
  text: GREETING,
  followups: SUGGESTED,
});

export const AskButton = forwardRef<AskHandle, { triggerClassName?: string }>(
  function AskButton({ triggerClassName }, ref) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>(() => [greetingMessage()]);
    const [input, setInput] = useState("");
    const [thinking, setThinking] = useState(false);
    const scrollRef = useRef<HTMLDivElement | null>(null);

    useImperativeHandle(ref, () => ({ open: () => setOpen(true) }), []);

    // Scroll to bottom whenever the message list changes
    useEffect(() => {
      const el = scrollRef.current;
      if (!el) return;
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }, [messages, thinking]);

    const send = (raw: string) => {
      const text = raw.trim();
      if (!text || thinking) return;

      const userMsg: Message = {
        id: `u_${Date.now()}`,
        role: "user",
        text,
      };
      setMessages((m) => [...m, userMsg]);
      setInput("");
      setThinking(true);

      // Simulate model latency: 800 to 1500ms.
      const latency = 800 + Math.floor(Math.random() * 700);
      window.setTimeout(() => {
        const r = matchResponse(text);
        const botMsg: Message = {
          id: `b_${Date.now()}`,
          role: "bot",
          text: r.answer,
          links: r.links,
          followups: r.followups,
        };
        setMessages((m) => [...m, botMsg]);
        setThinking(false);
      }, latency);
    };

    const clear = () => setMessages([greetingMessage()]);

    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className={cn(
            "inline-flex items-center gap-1.5 h-8 px-3 rounded-full hover:bg-neutral-100 text-[12px] font-medium text-neutral-700 transition-colors",
            triggerClassName
          )}
        >
          <MessageCircleMore className="size-3.5" />
          Ask
        </button>

        <Sheet open={open} onOpenChange={(o) => !o && setOpen(false)}>
          <SheetContent
            side="right"
            className="w-full sm:max-w-md p-0 overflow-hidden flex flex-col"
            showCloseButton
          >
            {/* Header */}
            <header className="px-4 py-3 border-b border-neutral-100 flex items-center gap-2.5">
              <span
                className="size-9 rounded-full flex items-center justify-center text-white shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, #a855f7 0%, #6366f1 45%, #0ea5e9 100%)",
                }}
              >
                <Sparkles className="size-4" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold tracking-tight">Callen Assistant</p>
                <p className="text-[11px] text-neutral-500 inline-flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online · answers in under 2s
                </p>
              </div>
              <button
                onClick={clear}
                aria-label="Clear chat"
                className="size-8 rounded-md hover:bg-neutral-100 flex items-center justify-center text-neutral-600 transition-colors"
                title="Clear chat"
              >
                <RefreshCw className="size-3.5" />
              </button>
            </header>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-neutral-50/30"
            >
              <AnimatePresence initial={false}>
                {messages.map((m, i) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={m.role === "user" ? "flex justify-end" : "flex justify-start gap-2"}
                  >
                    {m.role === "bot" && (
                      <span
                        className="size-7 rounded-full flex items-center justify-center text-white shrink-0 mt-0.5"
                        style={{
                          background:
                            "linear-gradient(135deg, #a855f7 0%, #6366f1 45%, #0ea5e9 100%)",
                        }}
                      >
                        <Bot className="size-3.5" />
                      </span>
                    )}
                    <div
                      className={cn(
                        "max-w-[78%] rounded-2xl px-3.5 py-2.5",
                        m.role === "user"
                          ? "bg-neutral-950 text-white rounded-br-md"
                          : "bg-white border border-neutral-200 text-neutral-800 rounded-bl-md"
                      )}
                    >
                      <p className="text-[13px] leading-relaxed whitespace-pre-line">{m.text}</p>
                      {m.links && m.links.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {m.links.map((l, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setOpen(false);
                                router.push(l.href);
                              }}
                              className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-neutral-100 text-neutral-900 text-[11px] font-medium hover:bg-neutral-200 transition-colors"
                            >
                              {l.label}
                              <ExternalLink className="size-3" />
                            </button>
                          ))}
                        </div>
                      )}
                      {m.followups && m.followups.length > 0 && i === messages.length - 1 && (
                        <div className="mt-2.5 space-y-1">
                          <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-semibold">
                            Try also
                          </p>
                          <div className="flex flex-col gap-1">
                            {m.followups.map((q, idx) => (
                              <button
                                key={idx}
                                onClick={() => send(q)}
                                className="inline-flex items-center gap-1.5 text-left text-[12px] text-neutral-700 hover:text-neutral-950 group"
                              >
                                <ArrowRight className="size-3 text-neutral-400 group-hover:text-neutral-900 transition-colors" />
                                {q}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {thinking && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start gap-2"
                >
                  <span
                    className="size-7 rounded-full flex items-center justify-center text-white shrink-0 mt-0.5"
                    style={{
                      background:
                        "linear-gradient(135deg, #a855f7 0%, #6366f1 45%, #0ea5e9 100%)",
                    }}
                  >
                    <Bot className="size-3.5" />
                  </span>
                  <div className="rounded-2xl rounded-bl-md bg-white border border-neutral-200 px-3.5 py-3 flex items-center gap-1">
                    {[0, 1, 2].map((d) => (
                      <motion.span
                        key={d}
                        className="size-1.5 rounded-full bg-neutral-400"
                        animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
                        transition={{
                          duration: 0.9,
                          repeat: Infinity,
                          delay: d * 0.15,
                          ease: "easeInOut",
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input */}
            <footer className="px-3 py-3 border-t border-neutral-100 bg-white">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send(input);
                }}
                className="flex items-center gap-2"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything about Callen..."
                  className="flex-1 h-10 px-3 rounded-full bg-neutral-100 border border-transparent text-[13px] focus:outline-none focus:bg-white focus:border-neutral-300 transition-colors"
                  disabled={thinking}
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!input.trim() || thinking}
                  aria-label="Send"
                  className={cn(
                    "size-10 rounded-full flex items-center justify-center transition-colors",
                    !input.trim() || thinking
                      ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                      : "bg-neutral-950 text-white hover:bg-neutral-800"
                  )}
                >
                  <Send className="size-4" />
                </button>
              </form>
              <p className="text-[10px] text-neutral-400 mt-1.5 text-center">
                The assistant answers from a built-in knowledge base. For escalations, contact your account manager.
              </p>
            </footer>
          </SheetContent>
        </Sheet>
      </>
    );
  }
);
