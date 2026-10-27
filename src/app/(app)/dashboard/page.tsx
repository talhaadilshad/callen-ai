// Dashboard home — ElevenLabs-style.
// Functional filters (range, granularity, agent), all 8 tabs render real
// KPI strips with relevant Callen.ai metrics. Advanced tab is the settings panel.

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  Plus, ChevronDown, Calendar, BarChart3, Bot,
  Settings2, Webhook, ShieldAlert, KeyRound,
  Phone, Mic, BookOpen, Radio, ArrowUpRight, ArrowDownRight,
  ShoppingBag, ArrowRightLeft, CheckCircle2, Users as UsersIcon,
  CreditCard, Boxes, BookOpenText, ChevronRight, Activity,
  Sparkles, type LucideIcon,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAppStore, useHasHydrated } from "@/lib/store";
import { Skeleton } from "@/components/ui/skeleton";
import { CountUp } from "@/components/count-up";
import { KpiChartCard } from "@/components/dashboard/home/kpi-chart-card";
import { SecondaryCard } from "@/components/dashboard/home/secondary-card";
import {
  activeCallsRange,
  agentOptions,
  defaultGranularity,
  granularitiesFor,
  granularityOptions,
  homeTabs,
  rangeOptions,
  secondaryKpis,
  type AgentId,
  type Granularity,
  type Range,
  type TabKey,
} from "@/lib/dashboard-home-data";

function getGreeting(date: Date = new Date()): string {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 22) return "Good evening";
  return "Good night";
}

function firstName(fullName?: string): string {
  if (!fullName) return "there";
  const parts = fullName.trim().split(/\s+/);
  if (parts.length >= 3 && parts[0].toLowerCase() === "muhammad") return parts[1];
  return parts[0];
}

export default function DashboardPage() {
  const hydrated = useHasHydrated();
  const tenant = useAppStore((s) => s.currentTenant);
  const user = useAppStore((s) => s.user);

  const [activeTab, setActiveTab] = useState<TabKey>("General");
  const [range, setRange] = useState<Range>("7d");
  const [granularity, setGranularity] = useState<Granularity>("day");
  const [agent, setAgent] = useState<AgentId>("all");
  const [activeCalls, setActiveCalls] = useState(3);

  // When range changes, force granularity to the sensible default for that range
  useEffect(() => {
    const allowed = granularitiesFor(range);
    if (!allowed.includes(granularity)) setGranularity(defaultGranularity(range));
  }, [range, granularity]);

  // Live active-calls counter — drifts up and down once every few seconds
  useEffect(() => {
    const [lo, hi] = activeCallsRange;
    const id = setInterval(() => {
      setActiveCalls((prev) => {
        const drift = Math.random() < 0.5 ? -1 : 1;
        const next = prev + drift;
        if (next < lo) return lo;
        if (next > hi) return hi;
        return next;
      });
    }, 4200);
    return () => clearInterval(id);
  }, []);

  const allowedGranularities = useMemo(() => granularitiesFor(range), [range]);
  const rangeLabel = rangeOptions.find((r) => r.value === range)?.label ?? "Last 7 days";
  const granLabel = granularityOptions.find((g) => g.value === granularity)?.label ?? "Day";
  const agentLabel = agentOptions.find((a) => a.value === agent)?.label ?? "All agents";

  if (!hydrated) {
    return (
      <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-[460px] w-full rounded-3xl" />
      </div>
    );
  }

  const greeting = getGreeting();
  const name = firstName(user?.name);

  const handleSaveView = () => {
    toast.success(`View saved: ${rangeLabel} · ${granLabel} · ${agentLabel}`);
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      {/* Top row */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <Link
          href="/calls/live"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50 transition-colors group"
        >
          <span className="relative flex size-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neutral-900 opacity-40" />
            <span className="relative inline-flex rounded-full size-2 bg-neutral-900" />
          </span>
          <span className="text-sm text-neutral-700">
            Active calls: <span className="font-semibold text-neutral-950 tabular-nums">{activeCalls}</span>
          </span>
          <span className="text-xs text-neutral-400 group-hover:text-neutral-900 transition-colors hidden sm:inline">
            view live
            <span aria-hidden> →</span>
          </span>
        </Link>
        <Link
          href="/analytics"
          className="text-sm font-medium text-neutral-500 hover:text-neutral-950 transition-colors inline-flex items-center gap-1.5"
        >
          Deep analytics
          <span aria-hidden>→</span>
        </Link>
      </div>

      {/* Greeting */}
      <div className="mb-6">
        <p className="text-sm text-neutral-500 mb-1.5">{tenant.name} workspace</p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-[-0.03em] leading-[1.05]">
          {greeting}, {name}
        </h1>
      </div>

      {/* Hero stat strip — at-a-glance workspace pulse */}
      <HeroStatStrip activeCalls={activeCalls} />

      {/* Tab nav */}
      <div className="border-b border-neutral-200 mb-6 -mx-2">
        <nav className="flex gap-1 overflow-x-auto no-scrollbar">
          {homeTabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-3 py-2.5 text-sm font-medium tracking-tight whitespace-nowrap transition-colors relative",
                  isActive ? "text-neutral-950" : "text-neutral-500 hover:text-neutral-800"
                )}
              >
                {tab}
                {isActive && (
                  <motion.div
                    layoutId="home-tab-underline"
                    className="absolute -bottom-px left-3 right-3 h-[2px] bg-neutral-950"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <button
          type="button"
          onClick={handleSaveView}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50 transition-colors text-sm text-neutral-700 font-medium"
        >
          <Plus className="size-3.5" />
          Create view
        </button>

        <FilterDropdown
          icon={<Calendar className="size-3.5" />}
          label={rangeLabel}
          options={rangeOptions}
          value={range}
          onChange={(v) => setRange(v as Range)}
        />

        <FilterDropdown
          icon={<BarChart3 className="size-3.5" />}
          label={granLabel}
          options={granularityOptions.filter((g) => allowedGranularities.includes(g.value))}
          value={granularity}
          onChange={(v) => setGranularity(v as Granularity)}
        />

        <FilterDropdown
          icon={<Bot className="size-3.5" />}
          label={agentLabel}
          options={agentOptions}
          value={agent}
          onChange={(v) => setAgent(v as AgentId)}
          minWidth={220}
        />
      </div>

      {/* Main panel */}
      {activeTab === "Advanced" ? (
        <AdvancedPanel />
      ) : (
        <>
          <KpiChartCard
            tab={activeTab as Exclude<TabKey, "Advanced">}
            range={range}
            granularity={granularity}
            agent={agent}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <SecondaryCard kpi={secondaryKpis[0]} agent={agent} gradientId="sec-grad-success" />
            <SecondaryCard kpi={secondaryKpis[1]} agent={agent} gradientId="sec-grad-csat" />
          </div>
        </>
      )}

      {/* Live activity + quick actions */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <LiveActivitySection />
        </div>
        <QuickActions />
      </div>
    </div>
  );
}

// --- Filter dropdown ---------------------------------------------------------

interface FilterOption { value: string; label: string }
interface FilterDropdownProps {
  icon?: ReactNode;
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (v: string) => void;
  minWidth?: number;
}

function FilterDropdown({ icon, label, options, value, onChange, minWidth }: FilterDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-neutral-300 hover:border-neutral-500 hover:bg-neutral-50 transition-colors text-sm text-neutral-950 font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
      >
        {icon}
        {label}
        <ChevronDown className="size-3.5 text-neutral-500 -mr-0.5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        style={minWidth ? { minWidth: `${minWidth}px` } : undefined}
      >
        {options.map((opt) => (
          <DropdownMenuItem
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className="cursor-pointer"
          >
            <span className={cn("flex-1", opt.value === value && "font-semibold")}>
              {opt.label}
            </span>
            {opt.value === value && <span className="text-neutral-500 ml-2">·</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// --- Hero stat strip ---------------------------------------------------------

interface HeroStat {
  label: string;
  value: number;
  decimals?: number;
  suffix?: string;
  delta: string;
  deltaDirection: "up" | "down" | "neutral";
  // For latency-style metrics, "down" is the good direction. This flag lets
  // the strip show the delta in emerald instead of rose even when negative.
  positiveWhenDown?: boolean;
  icon: LucideIcon;
  caption: string;
}

function HeroStatStrip({ activeCalls }: { activeCalls: number }) {
  const stats: HeroStat[] = [
    { label: "Calls today",     value: 1247,  delta: "+12.4%",  deltaDirection: "up",   icon: Phone,    caption: "vs yesterday" },
    { label: "Resolved on call", value: 94.2,  decimals: 1, suffix: "%", delta: "+2.1pp", deltaDirection: "up",   icon: CheckCircle2, caption: "vs last week" },
    { label: "Avg first token",  value: 0.71,  decimals: 2, suffix: "s", delta: "-0.05s", deltaDirection: "down", positiveWhenDown: true, icon: Sparkles, caption: "vs last week" },
    { label: "Agents online",    value: activeCalls + 1, suffix: " / 6", delta: "+1",      deltaDirection: "up",   icon: Radio,    caption: "live now" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
      {stats.map((s, i) => {
        const goodDelta = s.deltaDirection === "up" || s.positiveWhenDown;
        const DeltaIcon = s.deltaDirection === "up" ? ArrowUpRight : ArrowDownRight;
        const deltaColor = goodDelta ? "text-emerald-700" : "text-rose-700";
        const deltaIconColor = goodDelta ? "text-emerald-600" : "text-rose-600";
        return (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.06, ease: [0.2, 0.65, 0.3, 0.9] }}
            className="rounded-2xl bg-white border border-neutral-200 p-4 hover:border-neutral-300 transition-colors group"
          >
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[10px] uppercase tracking-widest font-semibold text-neutral-500">
                {s.label}
              </p>
              <span className="size-6 rounded-md bg-neutral-100 group-hover:bg-neutral-900 transition-colors flex items-center justify-center shrink-0">
                <s.icon className="size-3 text-neutral-700 group-hover:text-white transition-colors" />
              </span>
            </div>
            <p className="text-2xl md:text-3xl font-bold tracking-tight tabular-nums">
              <CountUp to={s.value} decimals={s.decimals ?? 0} />
              {s.suffix && (
                <span className="text-neutral-500 font-normal text-xl md:text-2xl">{s.suffix}</span>
              )}
            </p>
            <p className="text-[11px] mt-1.5 inline-flex items-center gap-1">
              <DeltaIcon className={cn("size-3", deltaIconColor)} />
              <span className={cn("font-semibold tabular-nums", deltaColor)}>{s.delta}</span>
              <span className="text-neutral-500">{s.caption}</span>
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}

// --- Live activity feed ------------------------------------------------------

type ActivityEvent = {
  id: string;
  icon: LucideIcon;
  action: string;
  subject: string;
  tile: string;
  addedAt: number;
};

// Pakistan + Callen-context templates. Each call picks one, threads in a
// randomised subject (order number, caller suffix, etc) so no two ticks
// look identical.
const EVENT_TEMPLATES: Array<{
  icon: LucideIcon;
  tile: string;
  action: string;
  subject: () => string;
}> = [
  { icon: Phone,        tile: "bg-emerald-50 text-emerald-700", action: "Cheezious agent answered a call from", subject: () => `+92 31${rand(0, 9)} ${randDigits(7)}` },
  { icon: ShoppingBag,  tile: "bg-indigo-50 text-indigo-700",   action: "Foodpanda order synced:",              subject: () => `CZ-${rand(7000, 7999)}` },
  { icon: BookOpenText, tile: "bg-amber-50 text-amber-700",     action: "Knowledge base indexed:",              subject: () => pick(["Promotions_June.pdf", "Menu_v3.pdf", "Delivery_FAQ.txt", "Allergens.pdf"]) },
  { icon: ArrowRightLeft, tile: "bg-rose-50 text-rose-700",     action: "Call escalated to manager:",           subject: () => pick(["spice complaint", "missing item", "late delivery", "refund request"]) },
  { icon: CheckCircle2, tile: "bg-emerald-50 text-emerald-700", action: "WhatsApp template approved by Meta:",  subject: () => pick(["order_confirmation_v3", "rider_on_the_way", "review_request"]) },
  { icon: UsersIcon,    tile: "bg-blue-50 text-blue-700",       action: "Teammate joined the workspace:",       subject: () => pick(["Hassan Raza · Manager", "Sara Iqbal · Viewer", "Bilal Ahmed · Manager"]) },
  { icon: CreditCard,   tile: "bg-violet-50 text-violet-700",   action: "Stripe payment captured:",             subject: () => `Rs. ${rand(800, 3500).toLocaleString()} · ${pick(["Cheezious", "Lahore Smile", "Hardee's"])}` },
  { icon: Mic,          tile: "bg-amber-50 text-amber-700",     action: "Whisper STT processed",                subject: () => `${rand(8, 32)}s of Urdu audio` },
  { icon: Boxes,        tile: "bg-blue-50 text-blue-700",       action: "Foodpanda integration synced",         subject: () => `${rand(3, 12)} menu items updated` },
  { icon: Calendar,     tile: "bg-violet-50 text-violet-700",   action: "Appointment booked:",                  subject: () => `Lahore Smile · ${pick(["Tomorrow 11:00", "Friday 4:30", "Monday 10:15"])}` },
  { icon: Activity,     tile: "bg-neutral-100 text-neutral-700", action: "Daily summary ready:",                subject: () => `${rand(120, 200)} calls · ${rand(78, 92)}% resolved` },
  { icon: Webhook,      tile: "bg-neutral-100 text-neutral-700", action: "Webhook delivered:",                  subject: () => `call.completed -> ${pick(["api.cheezious.pk", "hooks.zapier.com"])}` },
];

function rand(lo: number, hi: number): number {
  return Math.floor(lo + Math.random() * (hi - lo + 1));
}
function randDigits(n: number): string {
  let s = "";
  for (let i = 0; i < n; i++) s += rand(0, 9);
  return s;
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function makeEvent(): ActivityEvent {
  const t = EVENT_TEMPLATES[Math.floor(Math.random() * EVENT_TEMPLATES.length)];
  return {
    id: `e_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    icon: t.icon,
    tile: t.tile,
    action: t.action,
    subject: t.subject(),
    addedAt: Date.now(),
  };
}

function relativeTime(addedAt: number, now: number): string {
  const diff = Math.max(0, Math.floor((now - addedAt) / 1000));
  if (diff < 5) return "just now";
  if (diff < 60) return `${diff}s ago`;
  const m = Math.floor(diff / 60);
  return `${m}m ago`;
}

function LiveActivitySection() {
  const [events, setEvents] = useState<ActivityEvent[]>(() => {
    const seeded: ActivityEvent[] = [];
    const now = Date.now();
    for (let i = 0; i < 6; i++) {
      seeded.push({ ...makeEvent(), addedAt: now - (i + 1) * 1000 * rand(15, 95) });
    }
    return seeded;
  });
  // Tick so the relative-time labels stay fresh
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 5000);
    return () => clearInterval(id);
  }, []);

  // Stream a new event in every 8-14 seconds
  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const schedule = () => {
      const wait = 8000 + Math.random() * 6000;
      timeoutId = setTimeout(() => {
        if (cancelled) return;
        setEvents((prev) => [makeEvent(), ...prev.slice(0, 5)]);
        schedule();
      }, wait);
    };
    schedule();
    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const now = useMemo(() => Date.now(), [tick]);

  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] uppercase tracking-widest font-semibold text-neutral-500">
            Live activity
          </p>
          <h3 className="text-base font-semibold tracking-tight">
            Happening{" "}
            <span className="italic font-light">right now.</span>
          </h3>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold">
          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Streaming
        </span>
      </div>
      <ul className="space-y-1.5">
        <AnimatePresence initial={false} mode="popLayout">
          {events.map((e, i) => (
            <motion.li
              key={e.id}
              layout
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, height: 0, marginTop: 0, marginBottom: 0 }}
              transition={{ duration: 0.35, ease: [0.2, 0.65, 0.3, 0.9] }}
              className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-neutral-50/60 transition-colors"
            >
              <span
                className={cn(
                  "size-7 rounded-md flex items-center justify-center shrink-0",
                  e.tile
                )}
              >
                <e.icon className="size-3.5" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[12.5px] text-neutral-800 leading-snug">
                  <span className="text-neutral-600">{e.action}</span>{" "}
                  <span className="font-semibold tabular-nums">{e.subject}</span>
                </p>
              </div>
              <span className={cn(
                "text-[10px] text-neutral-400 tabular-nums shrink-0",
                i === 0 && "text-emerald-700 font-semibold"
              )}>
                {relativeTime(e.addedAt, now)}
              </span>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}

// --- Quick actions -----------------------------------------------------------

function QuickActions() {
  const actions: Array<{ icon: LucideIcon; title: string; body: string; href: string }> = [
    { icon: Mic,      title: "Talk to your agent", body: "Try the live preview orb",   href: "/agent" },
    { icon: Radio,    title: "Watch live calls",   body: "Listen in on active calls",  href: "/calls/live" },
    { icon: BookOpen, title: "Update your menu",   body: "Items, prices and deals",    href: "/menu" },
    { icon: Phone,    title: "Buy a phone number", body: "Pakistani +92 numbers",      href: "/phone-numbers" },
  ];
  return (
    <div className="rounded-3xl bg-neutral-950 text-white p-5 relative overflow-hidden h-full">
      {/* Subtle dot grid backdrop */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize: "12px 12px",
        }}
        aria-hidden="true"
      />
      <div className="relative">
        <p className="text-[10px] uppercase tracking-widest font-semibold text-white/55 mb-1">
          Quick actions
        </p>
        <h3 className="text-base font-semibold tracking-tight mb-4">
          What&apos;s next?
        </h3>
        <div className="space-y-1">
          {actions.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="flex items-center gap-3 -mx-2 px-2 py-2 rounded-lg hover:bg-white/10 transition-colors group"
            >
              <span className="size-8 rounded-md bg-white/10 group-hover:bg-white/20 transition-colors flex items-center justify-center shrink-0">
                <a.icon className="size-4 text-white" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold tracking-tight">{a.title}</p>
                <p className="text-[11px] text-white/55">{a.body}</p>
              </div>
              <ChevronRight className="size-3.5 text-white/40 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Advanced panel ----------------------------------------------------------

function AdvancedPanel() {
  const items = [
    { icon: ShieldAlert, title: "Escalation rules",   sub: "If-then routing for human handoff" },
    { icon: Settings2,   title: "Compliance & PII",   sub: "Redaction patterns, consent prompts, retention" },
    { icon: Webhook,     title: "Webhooks",           sub: "Outbound POST on call.end, escalation, tool.error" },
    { icon: KeyRound,    title: "API keys",           sub: "Provisioning and rotation for REST + WebSocket" },
  ];
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white overflow-hidden">
      <div className="px-6 py-5 border-b border-neutral-100">
        <h3 className="text-lg font-bold tracking-tight">Advanced configuration</h3>
        <p className="text-sm text-neutral-600 mt-0.5">Operational controls that sit beyond day-to-day metrics.</p>
      </div>
      <div className="grid sm:grid-cols-2 divide-x divide-y divide-neutral-100">
        {items.map((it) => (
          <Link
            key={it.title}
            href="/settings"
            className="flex items-start gap-4 px-6 py-5 hover:bg-neutral-50 transition-colors group"
          >
            <div className="size-10 rounded-xl bg-neutral-100 group-hover:bg-neutral-950 transition-colors flex items-center justify-center shrink-0">
              <it.icon className="size-5 text-neutral-700 group-hover:text-white transition-colors" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold tracking-tight">{it.title}</p>
              <p className="text-xs text-neutral-600 mt-0.5 leading-relaxed">{it.sub}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
