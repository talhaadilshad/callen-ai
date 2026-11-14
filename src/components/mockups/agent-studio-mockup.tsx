// Agent Studio editor mockup for the landing page. Every tab is clickable.
// Black and white, with the agent's voice orb as the only colour.
//
// The studio always shows one agent of the made-up restaurant "Karachi
// Bites" (the same restaurant as the hero's sample calls). The Workflow tab
// plays a call through that agent's real steps (the same steps as the
// templates in src/lib/agent-templates.ts), one line at a time, with what
// the agent says underneath. It moves on to the next agent after each call
// until the visitor picks one; the header and the Agent tab follow along.

"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence, useInView, useReducedMotion } from "motion/react";
import {
  BadgePercent, BookOpen, CalendarClock, Check, ChevronLeft, ClipboardCheck, Clock, GitBranch, MapPin,
  PhoneForwarded, PhoneIncoming, Play, Search, UtensilsCrossed, Wheat,
  Copy, FileText, Wrench, Code, Settings as SettingsIcon, Plus, MoreHorizontal, Sliders, Mic,
  type LucideIcon,
} from "lucide-react";
import { Orb } from "@/components/brand/orb";
import { DEMO_VOICES, type DemoVoice } from "@/lib/demo-calls";
import { cn } from "@/lib/utils";

type Tab = "Agent" | "Workflow" | "Knowledge" | "Tools" | "Widget" | "Settings";

const TABS: Tab[] = ["Agent", "Workflow", "Knowledge", "Tools", "Widget", "Settings"];

const EASE = [0.2, 0.65, 0.3, 0.9] as [number, number, number, number];

const RESTAURANT = "Karachi Bites";

/* ============== THE AGENTS AND THEIR CALL FLOWS ============== */

type Step = { icon: LucideIcon; title: string; meta: string; says: string };
type Flow = {
  id: string;
  label: string;
  line: string;
  voice: DemoVoice;
  instructions: string;
  // incoming call first, then the steps up to the question
  before: Step[];
  question: { title: string; options: [string, string]; pick: 0 | 1; says: string };
  after: Step[];
  end: { title: string; says: string };
};

const voiceNamed = (name: string) => DEMO_VOICES.find((v) => v.name === name)!;

const FLOWS: Flow[] = [
  {
    id: "delivery",
    label: "Delivery & takeaway",
    line: "Order line",
    voice: voiceNamed("Ayesha"),
    instructions:
      "Take delivery and takeaway orders in polite, everyday Urdu. Confirm each item, offer one deal once, check the address is in a delivery area, then read back the items, total, payment and time.",
    before: [
      { icon: PhoneIncoming, title: "Incoming call", meta: "9:14 pm", says: "Assalam o alaikum, Karachi Bites! Order dein ge ya kuch poochna hai?" },
      { icon: BookOpen, title: "Take the items", meta: "2 items", says: "Ji, ek Zinger Burger aur ek large Tikka Pizza. Aur kuch?" },
      { icon: BadgePercent, title: "Offer a deal", meta: "Family Deal", says: "Aaj Family Deal bhi chal rahi hai, chahein to add kar doon?" },
    ],
    question: { title: "Takeaway or delivery?", options: ["Takeaway", "Delivery"], pick: 1, says: "Delivery chahiye ya aap khud le jayenge?" },
    after: [
      { icon: MapPin, title: "Check the address", meta: "DHA Phase 6", says: "DHA Phase 6, ji. Wahan delivery ho jati hai." },
      { icon: ClipboardCheck, title: "Read the order back", meta: "PKR 2,300", says: "Total 2,300 rupay, cash on delivery, 35 se 40 minute." },
    ],
    end: { title: "Order sent to the kitchen", says: "Shukriya! Aap ka order lag gaya hai." },
  },
  {
    id: "bbq",
    label: "Karahi & BBQ",
    line: "BBQ order line",
    voice: voiceNamed("Bilal"),
    instructions:
      "Take karahi, BBQ and handi orders in polite Urdu. Get the weight and spice level, count the naan and sides, offer one platter deal, and note an exact pickup time.",
    before: [
      { icon: PhoneIncoming, title: "Incoming call", meta: "8:02 pm", says: "Assalam o alaikum, Karachi Bites! Bataiye, aaj kya tayyar karwayen?" },
      { icon: UtensilsCrossed, title: "Take the dishes", meta: "1 kg karahi", says: "Chicken karahi, ek kilo, medium spice. Theek hai?" },
      { icon: Wheat, title: "Breads and sides", meta: "6 naan, raita", says: "Naan kitne chahiye? Raita bhi saath bhej doon?" },
    ],
    question: { title: "When do you need it?", options: ["Now", "Later"], pick: 1, says: "Abhi chahiye ya kisi khaas time pe?" },
    after: [
      { icon: CalendarClock, title: "Pre-book a time", meta: "9:30 pm", says: "Theek hai, saarhe nau baje tayyar hoga." },
      { icon: ClipboardCheck, title: "Read the order back", meta: "PKR 3,310", says: "Total 3,310 rupay, pickup saarhe nau baje." },
    ],
    end: { title: "Order sent to the kitchen", says: "Shukriya! Order kitchen ko bhej diya hai." },
  },
  {
    id: "complaints",
    label: "Complaints",
    line: "Customer care",
    voice: voiceNamed("Hira"),
    instructions:
      "Help callers whose order is late, missing or wrong. Apologise once, find the order, note exactly what happened and promise a call back from the manager. Never argue and never promise refunds.",
    before: [
      { icon: PhoneIncoming, title: "Incoming call", meta: "10:41 pm", says: "Assalam o alaikum, Karachi Bites! Main aap ki kya madad kar sakti hoon?" },
      { icon: Search, title: "Find the order", meta: "By phone number", says: "Order kis number se kiya tha? Main abhi dekhti hoon." },
    ],
    question: { title: "What went wrong?", options: ["Late", "Wrong item"], pick: 0, says: "Order late hai ya kuch ghalat aaya hai?" },
    after: [
      { icon: Clock, title: "Late order", meta: "Status shared", says: "Maazrat chahti hoon. Rider raste mein hai, 10 minute mein pohanch jaye ga." },
      { icon: PhoneForwarded, title: "Manager call back", meta: "Within the hour", says: "Manager aap ko ek ghante ke andar call karenge." },
    ],
    end: { title: "Complaint logged", says: "Shukriya, aap ki baat note ho gayi hai." },
  },
];

const STEP_MS = 1500;
const HOLD_MS = 2800;

export function AgentStudioMockup({ className }: { className?: string }) {
  const [active, setActive] = useState<Tab>("Workflow");
  const [flowIdx, setFlowIdx] = useState(0);
  const flow = FLOWS[flowIdx];

  return (
    <div
      className={cn(
        "relative flex min-h-[560px] flex-col overflow-hidden rounded-3xl border border-hairline bg-shell",
        className
      )}
    >
      {/* Dot grid, fading out towards the edges */}
      <div
        aria-hidden
        className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_50%_60%,black_30%,transparent_80%)]"
        style={{ backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.1) 1px, transparent 1.2px)", backgroundSize: "18px 18px" }}
      />

      {/* Window header */}
      <div className="relative border-b border-hairline bg-white/75 px-5 pt-4 backdrop-blur-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-hairline bg-white">
              <ChevronLeft className="size-3.5 text-ink-soft" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[15px] leading-tight text-black">{flow.line}</p>
              <p className="truncate text-[11.5px] text-ink-soft">{RESTAURANT} · Main branch</p>
            </div>
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={flow.voice.name}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
              className="flex shrink-0 items-center gap-2 rounded-full border border-hairline bg-white py-1 pl-1 pr-3 text-[12px]"
            >
              <Orb palette={flow.voice.palette} className="size-5" />
              {flow.voice.name}
              <span className="flex items-center gap-1 text-ink-soft">
                <span className="size-1.5 rounded-full bg-black" />
                Live
              </span>
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Tabs (clickable) */}
        <div className="scrollbar-none -mb-px flex items-center gap-0.5 overflow-x-auto text-[13px]">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setActive(t)}
              className={cn(
                "relative whitespace-nowrap px-3 py-2.5 transition-colors",
                active === t ? "text-black" : "text-ink-soft hover:text-black"
              )}
            >
              {t}
              {active === t && (
                <motion.span
                  layoutId="studio-tab"
                  className="absolute inset-x-3 bottom-0 h-[1.5px] rounded-full bg-black"
                  transition={{ type: "spring", stiffness: 420, damping: 36 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="relative flex flex-1 flex-col px-5 py-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="flex flex-1 flex-col"
          >
            {active === "Agent" && <AgentTab flow={flow} />}
            {active === "Workflow" && <WorkflowTab flowIdx={flowIdx} onFlow={setFlowIdx} />}
            {active === "Knowledge" && <KnowledgeTab />}
            {active === "Tools" && <ToolsTab />}
            {active === "Widget" && <WidgetTab />}
            {active === "Settings" && <SettingsTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ============== AGENT TAB ============== */

function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-hairline bg-white px-4 py-3.5", className)}>
      <p className="text-[11.5px] text-ink-soft">{label}</p>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function AgentTab({ flow }: { flow: Flow }) {
  const v = flow.voice;
  return (
    <div className="space-y-2.5">
      <Field label="Voice">
        <div className="flex items-center gap-3">
          <Orb palette={v.palette} className="size-10" />
          <div className="min-w-0 flex-1">
            <p className="text-[14px] text-black">{v.name}</p>
            <p className="truncate text-[12px] text-ink-soft">{v.style}</p>
          </div>
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-black text-white">
            <Play className="ml-0.5 size-3.5 fill-current" />
          </span>
        </div>
      </Field>
      <Field label="First message">
        <p className="text-[13px] leading-relaxed text-black">“{flow.before[0].says}”</p>
      </Field>
      <Field label="Instructions">
        <p className="text-[13px] leading-relaxed text-black">{flow.instructions}</p>
      </Field>
      <div className="grid grid-cols-2 gap-2.5">
        <Field label="Speaks">
          <p className="text-[13px] text-black">Urdu, with everyday English words</p>
        </Field>
        <Field label="Answers for">
          <p className="text-[13px] text-black">{RESTAURANT}, Main branch</p>
        </Field>
      </div>
    </div>
  );
}

/* ============== WORKFLOW TAB ============== */

type RowStatus = "done" | "active" | "next";

function WorkflowTab({ flowIdx, onFlow }: { flowIdx: number; onFlow: (i: number) => void }) {
  const flow = FLOWS[flowIdx];
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { amount: 0.35 });
  const still = useReducedMotion();

  // The call runs down the rows: the steps before the question, the
  // question, the steps after it, then the end.
  const q = flow.before.length;
  const last = q + 1 + flow.after.length;
  const [p, setP] = useState(0);
  // Moves on to the next agent after each call until the visitor picks one.
  const [auto, setAuto] = useState(true);
  const shown = still ? last : p;

  useEffect(() => {
    if (still || !inView) return;
    const t = setTimeout(
      () => {
        if (p < last) return setP(p + 1);
        setP(0);
        if (auto) onFlow((flowIdx + 1) % FLOWS.length);
      },
      p < last ? STEP_MS : HOLD_MS
    );
    return () => clearTimeout(t);
  }, [p, last, inView, still, auto, flowIdx, onFlow]);

  const status = (i: number): RowStatus => (shown > i ? "done" : shown === i ? "active" : "next");
  const says =
    shown < q ? flow.before[shown].says : shown === q ? flow.question.says : shown < last ? flow.after[shown - q - 1].says : flow.end.says;

  return (
    <div ref={ref} className="flex flex-1 flex-col items-center">
      {/* Which agent */}
      <div role="tablist" aria-label="Call flow" className="mb-6 flex rounded-full border border-hairline bg-white p-0.5 text-[11px] sm:text-[11.5px]">
        {FLOWS.map((f, i) => (
          <button
            key={f.id}
            role="tab"
            type="button"
            aria-selected={i === flowIdx}
            onClick={() => {
              setAuto(false);
              setP(0);
              onFlow(i);
            }}
            className={cn(
              "relative whitespace-nowrap rounded-full px-2.5 py-1 transition-colors sm:px-3",
              i === flowIdx ? "text-white" : "text-ink-soft hover:text-black"
            )}
          >
            {i === flowIdx && (
              <motion.span
                layoutId="flow-pill"
                className="absolute inset-0 rounded-full bg-black"
                transition={{ type: "spring", stiffness: 420, damping: 36 }}
              />
            )}
            <span className="relative">{f.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.ol
          key={flow.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="w-full max-w-[350px]"
        >
          {flow.before.map((s, i) => (
            <FlowRow key={s.title} status={status(i)} icon={s.icon} title={s.title} meta={s.meta} />
          ))}
          <FlowRow status={status(q)} icon={GitBranch} title={flow.question.title}>
            <span className="ml-auto flex shrink-0 gap-1">
              {flow.question.options.map((o, k) => {
                const decided = shown > q;
                return (
                  <span
                    key={o}
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10.5px] transition-colors duration-300",
                      decided && k === flow.question.pick
                        ? "bg-black text-white"
                        : decided
                          ? "text-black/30"
                          : "bg-shell text-ink-soft"
                    )}
                  >
                    {o}
                  </span>
                );
              })}
            </span>
          </FlowRow>
          {flow.after.map((s, i) => (
            <FlowRow key={s.title} status={status(q + 1 + i)} icon={s.icon} title={s.title} meta={s.meta} />
          ))}
          <FlowRow status={shown >= last ? "done" : "next"} end icon={Check} title={flow.end.title} />
        </motion.ol>
      </AnimatePresence>

      {/* What the agent is saying */}
      <div className="mt-auto w-full max-w-[350px] pt-6">
        <div className="flex items-center gap-3 rounded-2xl border border-hairline bg-white px-3.5 py-3">
          <Orb palette={flow.voice.palette} active={!still && inView} className="size-7 shrink-0" />
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={`${flow.id}-${shown}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
              className="line-clamp-2 min-h-[2.5em] text-[12.5px] leading-[1.25] text-black"
            >
              <span className="text-ink-soft">{flow.voice.name}: </span>
              {says}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// One step of the call: a slim card on a vertical line. The line runs
// through the icons and fills in black as the call moves down.
function FlowRow({
  status,
  icon: Icon,
  title,
  meta,
  end = false,
  children,
}: {
  status: RowStatus;
  icon: LucideIcon;
  title: string;
  meta?: string;
  end?: boolean;
  children?: ReactNode;
}) {
  const lit = status !== "next";
  return (
    <li className="relative">
      {!end && (
        <span aria-hidden className="absolute left-[21.5px] top-full block h-2.5 w-px bg-black/12">
          <motion.span
            className="absolute inset-0 origin-top bg-black"
            initial={false}
            animate={{ scaleY: status === "done" ? 1 : 0 }}
            transition={{ duration: 0.35, ease: EASE }}
          />
        </span>
      )}
      <motion.div
        initial={false}
        animate={{ opacity: lit ? 1 : 0.45 }}
        transition={{ duration: 0.35, ease: EASE }}
        className={cn(
          "mb-2.5 flex h-9 items-center gap-2.5 rounded-xl border px-2.5 transition-[background-color,border-color,box-shadow] duration-300",
          end && lit
            ? "border-black bg-black text-white"
            : status === "active"
              ? "border-black/15 bg-white shadow-[0_10px_24px_-14px_rgba(0,0,0,0.4)]"
              : "border-hairline bg-white"
        )}
      >
        <span
          className={cn(
            "flex size-6 shrink-0 items-center justify-center rounded-lg transition-colors duration-300",
            end && lit ? "bg-white text-black" : lit ? "bg-black text-white" : "bg-shell text-black"
          )}
        >
          <Icon className="size-3.5" strokeWidth={end ? 2.5 : 1.75} />
        </span>
        <span className={cn("min-w-0 truncate text-[12.5px]", end && lit ? "text-white" : "text-black")}>{title}</span>
        {children}
        {meta && <span className="ml-auto shrink-0 text-[11px] tabular-nums text-ink-soft">{meta}</span>}
        {!end && (
          <span className={cn("flex size-3.5 shrink-0 items-center justify-center", !meta && !children && "ml-auto")}>
            {status === "done" && <Check className="size-3 text-black" strokeWidth={2.5} />}
          </span>
        )}
      </motion.div>
    </li>
  );
}

/* ============== KNOWLEDGE TAB ============== */
function KnowledgeTab() {
  const docs = [
    { icon: FileText, name: "Menu_2026.pdf", chunks: 47, status: "Indexed" },
    { icon: FileText, name: "Delivery_Policies.pdf", chunks: 12, status: "Indexed" },
    { icon: FileText, name: "FAQ.txt", chunks: 23, status: "Indexed" },
    { icon: FileText, name: "Promotions_June.pdf", chunks: 8, status: "Pending" },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] text-neutral-500 font-medium">4 sources · 90 chunks · last sync 12m ago</span>
        <button className="text-[11px] inline-flex items-center gap-1 px-2 py-1 rounded-md bg-neutral-900 text-white font-medium">
          <Plus className="size-3" /> Upload
        </button>
      </div>
      {docs.map((d, i) => (
        <motion.div
          key={d.name}
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.04 }}
          className="rounded-xl bg-white border border-neutral-200 px-3 py-2.5 flex items-center gap-2.5"
        >
          <div className="size-7 rounded-md bg-neutral-100 flex items-center justify-center">
            <d.icon className="size-3.5 text-neutral-700" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold truncate">{d.name}</p>
            <p className="text-[10px] text-neutral-500">{d.chunks} chunks</p>
          </div>
          <span
            className={
              d.status === "Indexed"
                ? "text-[10px] px-1.5 py-0.5 rounded bg-neutral-900 text-white font-medium"
                : "text-[10px] px-1.5 py-0.5 rounded bg-neutral-200 text-neutral-700 font-medium"
            }
          >
            {d.status}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

/* ============== TOOLS TAB ============== */
function ToolsTab() {
  const tools = [
    { name: "createOrder", desc: "Place a new food order", calls: "142", icon: Wrench },
    { name: "checkOrderStatus", desc: "Lookup existing order", calls: "87", icon: Wrench },
    { name: "transferToHuman", desc: "Escalate to live agent", calls: "14", icon: Wrench },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] text-neutral-500 font-medium">3 tools registered · MCP enabled</span>
        <button className="text-[11px] inline-flex items-center gap-1 px-2 py-1 rounded-md bg-neutral-900 text-white font-medium">
          <Plus className="size-3" /> Add tool
        </button>
      </div>
      {tools.map((t, i) => (
        <motion.div
          key={t.name}
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.04 }}
          className="rounded-xl bg-white border border-neutral-200 px-3 py-2.5 flex items-center gap-2.5"
        >
          <div className="size-7 rounded-md bg-neutral-100 flex items-center justify-center">
            <Code className="size-3.5 text-neutral-700" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold font-mono">{t.name}</p>
            <p className="text-[10px] text-neutral-500">{t.desc}</p>
          </div>
          <div className="text-right">
            <p className="text-[12px] font-bold tabular-nums">{t.calls}</p>
            <p className="text-[9px] text-neutral-500">30d</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ============== WIDGET TAB ============== */
function WidgetTab() {
  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-neutral-950 text-white p-3.5 font-mono text-[10px] leading-relaxed">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/50 text-[9px] uppercase tracking-widest">Embed code</span>
          <button className="size-5 rounded bg-white/10 flex items-center justify-center">
            <Copy className="size-3" />
          </button>
        </div>
        <pre className="text-white/90">
          {`<script
  src="https://cdn.callen.ai/widget.js"
  data-agent="restaurant-recpt"
  defer
></script>
<callen-widget
  position="bottom-right"
  theme="light"
/>`}
        </pre>
      </div>

      <div className="rounded-xl bg-white border border-neutral-200 p-3.5">
        <p className="text-[11px] uppercase tracking-widest text-neutral-500 font-semibold mb-2">Preview</p>
        <div className="aspect-[3/2] rounded-lg bg-neutral-50 border border-neutral-200 relative flex items-end justify-end p-2">
          <div className="size-8 rounded-full bg-neutral-900" />
          <div className="absolute bottom-12 right-2 text-[9px] px-2 py-1 rounded-md bg-neutral-900 text-white">
            Hi! Ask me anything
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============== SETTINGS TAB ============== */
function SettingsTab() {
  return (
    <div className="space-y-2">
      {[
        { label: "Business hours", value: "Mon–Sun · 9 AM to 11 PM (PKT)", icon: SettingsIcon },
        { label: "Call recording", value: "On · with caller consent", icon: Mic },
        { label: "Escalation rule", value: "If sentiment < -0.5 → +92 311 8000000", icon: Sliders },
        { label: "Data retention", value: "Transcripts kept 365 days", icon: SettingsIcon },
      ].map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.04 }}
          className="rounded-xl bg-white border border-neutral-200 px-3 py-2.5 flex items-center gap-2.5"
        >
          <div className="size-7 rounded-md bg-neutral-100 flex items-center justify-center">
            <s.icon className="size-3.5 text-neutral-700" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] uppercase tracking-widest text-neutral-500 font-semibold">{s.label}</p>
            <p className="text-[12px] text-neutral-900 font-medium">{s.value}</p>
          </div>
          <MoreHorizontal className="size-4 text-neutral-400" />
        </motion.div>
      ))}
    </div>
  );
}
