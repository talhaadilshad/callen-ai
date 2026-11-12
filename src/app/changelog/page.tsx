// /changelog — dated history of meaningful product changes. Mirrors how
// Linear, Vercel, and ElevenLabs ship their public changelogs.

import {
  MarketingShell,
  MarketingHero,
  MarketingSection,
} from "@/components/marketing/marketing-shell";

export const metadata = {
  title: "Changelog",
  description:
    "What's new in Callen.ai. Voice agent platform updates, new integrations, and product improvements.",
};

type Tag = "Feature" | "Improvement" | "Fix" | "Voice" | "Integration" | "Security";

const TAG_STYLES: Record<Tag, string> = {
  Feature:     "bg-neutral-950 text-white",
  Improvement: "bg-shell text-black border border-hairline",
  Fix:         "bg-white text-black border border-neutral-300",
  Voice:       "bg-shell text-black border border-hairline",
  Integration: "bg-shell text-black border border-hairline",
  Security:    "bg-white text-black border border-neutral-300",
};

const ENTRIES: Array<{
  date: string;
  title: string;
  tags: Tag[];
  body: string[];
}> = [
  {
    date: "May 25, 2026",
    title: "Live browser TTS in agent test panel",
    tags: ["Feature", "Voice"],
    body: [
      "The phone button in the agent editor now speaks the agent's actual configured first message using the browser's TTS engine. The chat bubble being spoken visibly rings so it's always clear what's being heard.",
      "On Windows with Microsoft Asad / Uzma installed, the Urdu voices read naturally. We ladder to Hindi neural and then English if those aren't available.",
      "Production TTS via ElevenLabs is coming when the runtime ships. The architecture is already swap-ready.",
    ],
  },
  {
    date: "May 24, 2026",
    title: "16 new voices with Pakistani branding",
    tags: ["Voice"],
    body: [
      "Refreshed the voice catalog top-to-bottom. Sixteen new high-quality samples with Pakistani-named personas matched to gender: Hira, Hamza, Ruhaan, Faraz, Sehar, Amna, Imran, Bilal, Armaan, Roohi, Sana, Aiza, Tariq, Junaid, Yasir, Mansoor.",
      "Each of the fifteen agent templates now resolves to a hand-picked persona via a semantic override map.",
    ],
  },
  {
    date: "May 23, 2026",
    title: "End-to-end agent creation flow",
    tags: ["Feature"],
    body: [
      "Two ways to spin up a custom agent: the new five-step wizard (Sidebar → Create agent) or one click from any template (Agent Studio → Use template).",
      "Both land on a per-agent editor with editable system prompt, first message, voice picker, language and LLM selectors, twelve toggleable behavior traits, and a live test panel.",
      "Your created agents now appear in a Your agents section in the sidebar with draft and published status pills.",
    ],
  },
  {
    date: "May 22, 2026",
    title: "Smart system prompt generator",
    tags: ["Feature"],
    body: [
      "Every new agent now ships with an auto-generated system prompt built from the wizard inputs: industry, use case, main goal, website, language, and active behavior traits.",
      "The prompt is structured: Personality, Goal, Primary use case, Knowledge, Style, Limits.",
      "You can hit Regenerate any time to rebuild from current config, or edit the prompt by hand.",
    ],
  },
  {
    date: "May 20, 2026",
    title: "Functional Knowledge Base, Tools, and Integrations",
    tags: ["Feature"],
    body: [
      "All three configuration surfaces are now real. Knowledge Base has four upload flows (URL, file, text, folder). Tools has a shared schema editor. Integrations Marketplace ships with nine connectors: Foodpanda, WhatsApp Business, HubSpot, Zendesk, Notion, Google Calendar, Zapier, Stripe, Airtable.",
    ],
  },
  {
    date: "May 18, 2026",
    title: "ElevenLabs-style dashboard home",
    tags: ["Improvement"],
    body: [
      "Rebuilt the home dashboard around an eight-tab KPI strip. Filters (range, granularity, agent) regenerate every chart and metric live.",
      "Old KPI cards moved to /analytics for the deep-metrics view.",
    ],
  },
  {
    date: "May 15, 2026",
    title: "Stripe replaces JazzCash as the default payments connector",
    tags: ["Integration"],
    body: [
      "Stripe added as a first-class integration. Generate payment links mid-call, push receipts to WhatsApp.",
    ],
  },
  {
    date: "May 12, 2026",
    title: "Per-tenant data isolation",
    tags: ["Security"],
    body: [
      "Every call recording, transcript, and KB document is scoped to a tenant_id at the storage layer.",
      "Cross-tenant queries are impossible by design, not by policy.",
    ],
  },
  {
    date: "May 8, 2026",
    title: "Private beta opens to Pakistani SMBs",
    tags: ["Feature"],
    body: [
      "First public-facing release. Seven verticals supported out of the gate.",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <MarketingShell>
      <MarketingHero
        eyebrow="Changelog"
        title={
          <>
            What we&apos;re{" "}
            <span>shipping.</span>
          </>
        }
        lede="Every meaningful change to Callen.ai, dated and grouped by tag. New entries land here the day they ship."
      />

      <MarketingSection>
        <div className="space-y-12">
          {ENTRIES.map((e) => (
            <article
              key={e.date + e.title}
              className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-6 md:gap-12 pb-12 border-b border-hairline last:border-0"
            >
              <div className="text-sm text-ink-soft font-medium tabular-nums shrink-0">
                {e.date}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {e.tags.map((t) => (
                    <span
                      key={t}
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-normal uppercase tracking-wider ${TAG_STYLES[t]}`}
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <h3 className="text-xl md:text-2xl font-normal tracking-tight mb-3">{e.title}</h3>
                <div className="space-y-3 text-[15px] text-black leading-relaxed">
                  {e.body.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </MarketingSection>
    </MarketingShell>
  );
}
