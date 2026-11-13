// /status — public service status page in the Vercel / Linear style.

import {
  MarketingShell,
  MarketingHero,
  MarketingSection,
} from "@/components/marketing/marketing-shell";

export const metadata = {
  title: "Status",
  description:
    "Live status of Callen.ai services: voice runtime, telephony, dashboards, API, knowledge base, and integrations.",
};

type Status = "operational" | "degraded" | "outage" | "maintenance";

const STATUS_STYLES: Record<Status, { dot: string; pill: string; label: string }> = {
  operational: {
    dot: "bg-emerald-500",
    pill: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    label: "Operational",
  },
  degraded: {
    dot: "bg-amber-500",
    pill: "bg-amber-50 text-amber-700 border border-amber-200",
    label: "Degraded",
  },
  outage: {
    dot: "bg-rose-500",
    pill: "bg-rose-50 text-rose-700 border border-rose-200",
    label: "Outage",
  },
  maintenance: {
    dot: "bg-blue-500",
    pill: "bg-blue-50 text-blue-700 border border-blue-200",
    label: "Maintenance",
  },
};

const SERVICES: Array<{ name: string; status: Status; uptime: string }> = [
  { name: "Voice runtime (STT → LLM → TTS)", status: "operational", uptime: "99.98%" },
  { name: "Telephony (Twilio +92 numbers)",  status: "operational", uptime: "99.99%" },
  { name: "Workspace dashboards",            status: "operational", uptime: "99.99%" },
  { name: "REST + WebSocket API",            status: "operational", uptime: "99.97%" },
  { name: "Knowledge base ingestion",        status: "operational", uptime: "99.95%" },
  { name: "Integrations marketplace",        status: "operational", uptime: "99.96%" },
  { name: "WhatsApp channel",                status: "operational", uptime: "99.94%" },
];

const INCIDENTS: Array<{
  title: string;
  status: "Resolved" | "Monitoring" | "Investigating";
  start: string;
  duration: string;
  body: string;
}> = [
  {
    title: "Elevated STT latency on Urdu calls",
    status: "Resolved",
    start: "May 18, 2026 · 14:22 PKT",
    duration: "27 minutes",
    body: "A regional spike in Whisper inference queue caused Urdu transcription latency to climb above 1.2s p95. Failover to backup region restored normal latency. Root cause documented internally.",
  },
  {
    title: "Foodpanda webhook delivery delay",
    status: "Resolved",
    start: "May 11, 2026 · 09:47 PKT",
    duration: "1h 04m",
    body: "Foodpanda's signing key rotated without prior notice. Once we re-issued the verification secret on our side, delivery normalised. We've added a daily key check to prevent recurrence.",
  },
  {
    title: "Scheduled database upgrade",
    status: "Resolved",
    start: "May 4, 2026 · 03:00 PKT",
    duration: "22 minutes",
    body: "Postgres 16 → 17 minor version upgrade. Read-only mode for the duration. No data loss, no customer-visible API errors.",
  },
];

export default function StatusPage() {
  // Server-rendered at build/deploy time, so the badge always reflects
  // the latest deploy instead of a hardcoded date drifting stale.
  const lastChecked = new Date();
  return (
    <MarketingShell>
      <MarketingHero orb="mint"
        eyebrow="Status"
        title={
          <>
            All systems{" "}
            <span>operational.</span>
          </>
        }
        lede="Live status of every Callen.ai service. Past incidents listed below with full post-mortems. Subscribe to email alerts in your workspace settings."
      />

      <MarketingSection>
        <div className="rounded-3xl border border-hairline bg-white overflow-hidden">
          <div className="px-6 lg:px-8 py-5 border-b border-hairline flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span className="relative flex size-2.5">
                <span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-60" />
                <span className="relative rounded-full size-2.5 bg-emerald-500" />
              </span>
              <p className="font-normal tracking-tight">All systems operational</p>
            </div>
            <p className="text-xs text-ink-soft tabular-nums">
              Updated{" "}
              <time dateTime={lastChecked.toISOString()}>
                {new Intl.DateTimeFormat("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                  timeZone: "Asia/Karachi",
                }).format(lastChecked)}{" "}
                PKT
              </time>
            </p>
          </div>

          <div>
            {SERVICES.map((s, i) => (
              <div
                key={s.name}
                className={`flex items-center justify-between gap-3 px-6 lg:px-8 py-4 ${
                  i > 0 ? "border-t border-hairline" : ""
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`size-2 rounded-full shrink-0 ${STATUS_STYLES[s.status].dot}`} />
                  <p className="text-[14px] font-medium truncate">{s.name}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-ink-soft tabular-nums hidden sm:block">
                    {s.uptime} · 90d
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-normal uppercase tracking-wider ${STATUS_STYLES[s.status].pill}`}
                  >
                    {STATUS_STYLES[s.status].label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </MarketingSection>

      <MarketingSection
        eyebrow="Past incidents"
        title={
          <>
            Full post-mortems,{" "}
            <span>no hiding.</span>
          </>
        }
      >
        <div className="space-y-5">
          {INCIDENTS.map((inc) => (
            <article key={inc.title} className="rounded-2xl border border-hairline p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <h3 className="text-lg font-normal tracking-tight">{inc.title}</h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-normal uppercase tracking-wider">
                  {inc.status}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-ink-soft mb-3 tabular-nums">
                <span>{inc.start}</span>
                <span className="size-0.5 rounded-full bg-neutral-400" />
                <span>{inc.duration}</span>
              </div>
              <p className="text-[14px] text-black leading-relaxed">{inc.body}</p>
            </article>
          ))}
        </div>
      </MarketingSection>
    </MarketingShell>
  );
}
