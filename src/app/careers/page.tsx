// /careers — open roles + culture brief.

import Link from "next/link";
import { Briefcase, ArrowRight, MapPin, Clock, Layers } from "lucide-react";
import {
  MarketingShell,
  MarketingHero,
  MarketingSection,
} from "@/components/marketing/marketing-shell";

export const metadata = {
  title: "Careers",
  description:
    "Open roles at Callen.ai. We're building Pakistan's first voice AI platform. Remote-friendly, Islamabad-anchored, English + Urdu working language.",
};

const ROLES = [
  {
    title: "Founding voice ML engineer",
    location: "Remote · Pakistan",
    type: "Full-time",
    team: "Engineering",
    blurb:
      "Own the STT → LLM → TTS pipeline. Improve Urdu transcription accuracy below 4% WER. Drive latency below 600ms p95. You've worked with Whisper, ElevenLabs, or a comparable stack at scale.",
  },
  {
    title: "Founding frontend engineer",
    location: "Islamabad or Remote",
    type: "Full-time",
    team: "Engineering",
    blurb:
      "Own the dashboard. Next.js, TypeScript, Tailwind, motion-design instincts. You've shipped at least one polished SaaS dashboard end-to-end and you read design like code.",
  },
  {
    title: "Customer success lead (Pakistan)",
    location: "Islamabad",
    type: "Full-time",
    team: "Go-to-market",
    blurb:
      "Onboard new Pakistani SMB customers. Configure their first agent in person where it helps. Build the playbooks that turn into self-serve later. Fluent Urdu + English required.",
  },
  {
    title: "Backend engineer",
    location: "Remote · Pakistan",
    type: "Full-time",
    team: "Engineering",
    blurb:
      "Telephony orchestration (Twilio, Pipecat, LiveKit), Postgres, pgvector, MCP tool runtime. Comfortable with realtime systems and the edge cases that show up at 3 AM.",
  },
  {
    title: "Designer (product + brand)",
    location: "Remote · Pakistan",
    type: "Contract or full-time",
    team: "Design",
    blurb:
      "Bring the ElevenLabs / Linear sensibility to a Pakistan-first product. Refine the design system, the marketing site, the auth flows, the voice library page. Strong opinions about typography and motion.",
  },
];

const CULTURE = [
  "Remote-friendly, Islamabad-anchored. Most of the team is in Pakistan, working hours flex around prayer + family.",
  "Async-first. Long blocks of focused work over meeting-heavy weeks. We expect you to ship.",
  "Equity for everyone. Cash + stock, transparent ranges, no negotiation theater.",
  "Pakistan-locked context. We hire engineers who care about Pakistani SMBs, not engineers who'd rather build for the US.",
  "Pragmatic with the stack. Right tool for the right job. We use boring Postgres and exotic LLMs side-by-side.",
];

export default function CareersPage() {
  return (
    <MarketingShell>
      <MarketingHero orb="sun"
        eyebrow="Careers"
        title={
          <>
            Build voice AI for the country{" "}
            <span>that needs it most.</span>
          </>
        }
        lede="Small team. Honest equity. Remote-friendly across Pakistan. We hire for taste and ownership over years of experience."
      />

      <MarketingSection
        eyebrow="Open roles"
        title={<>We&apos;re hiring for <span>five seats.</span></>}
      >
        <div className="space-y-4">
          {ROLES.map((r) => (
            <div
              key={r.title}
              className="rounded-3xl border border-hairline p-7 hover:border-neutral-400 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
                <h3 className="text-xl font-normal tracking-tight">{r.title}</h3>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1.5 text-sm font-normal text-neutral-950 hover:gap-2 transition-all"
                >
                  Apply <ArrowRight className="size-3.5" />
                </Link>
              </div>
              <div className="flex flex-wrap items-center gap-3 mb-4 text-xs text-ink-soft">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-3.5" /> {r.location}
                </span>
                <span className="size-0.5 rounded-full bg-neutral-400" />
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-3.5" /> {r.type}
                </span>
                <span className="size-0.5 rounded-full bg-neutral-400" />
                <span className="inline-flex items-center gap-1.5">
                  <Layers className="size-3.5" /> {r.team}
                </span>
              </div>
              <p className="text-[14.5px] text-ink-soft leading-relaxed">{r.blurb}</p>
            </div>
          ))}
        </div>
      </MarketingSection>

      <MarketingSection
        eyebrow="Culture"
        title={
          <>
            How we{" "}
            <span>work.</span>
          </>
        }
      >
        <ul className="space-y-4 max-w-3xl">
          {CULTURE.map((c) => (
            <li
              key={c}
              className="flex gap-3 text-[15px] text-black leading-relaxed"
            >
              <span className="size-1.5 rounded-full bg-neutral-900 shrink-0 mt-2.5" />
              <span>{c}</span>
            </li>
          ))}
        </ul>
      </MarketingSection>

      <MarketingSection>
        <div className="rounded-3xl bg-neutral-950 text-white p-10 lg:p-14">
          <Briefcase className="size-7 mb-5 text-white/70" />
          <h2 className="text-3xl md:text-4xl font-normal tracking-tight mb-3">
            Don&apos;t see your role?
          </h2>
          <p className="text-white/70 leading-relaxed mb-7 max-w-xl">
            We&apos;re a small team, and we always want to talk to talented
            engineers, designers, and operators who care about Pakistani
            businesses. Send us a note about what you&apos;d build here.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white text-neutral-950 text-sm font-normal hover:bg-white/90 transition-colors"
          >
            Reach out <ArrowRight className="size-4" />
          </Link>
        </div>
      </MarketingSection>
    </MarketingShell>
  );
}
