// /use-cases — vertical-by-vertical breakdown of what Callen.ai handles.
// Linked from the Product column of the footer.

import Link from "next/link";
import {
  UtensilsCrossed,
  Stethoscope,
  Home as HomeIcon,
  ShoppingBag,
  Scale,
  Phone,
  Building2,
  Briefcase,
  ArrowRight,
} from "lucide-react";
import {
  MarketingShell,
  MarketingHero,
  MarketingSection,
} from "@/components/marketing/marketing-shell";

export const metadata = {
  title: "Use cases",
  description:
    "Voice AI agents for restaurants, clinics, real estate, e-commerce, law firms, telcos, and more. See how Pakistani businesses use Callen.ai.",
};

const VERTICALS = [
  {
    icon: UtensilsCrossed,
    title: "Restaurants & delivery",
    blurb:
      "Take orders, suggest deals, capture address, dispatch riders. Cheezious, Domino's, Pizza Hut Pakistan, Howdy, OPTP.",
    bullets: [
      "Average 2 minute call from greeting to confirmed order",
      "POS push for Foodpanda, Shopify, and direct webhooks",
      "60%+ of inbound orders handled without a human",
    ],
  },
  {
    icon: Stethoscope,
    title: "Healthcare & clinics",
    blurb:
      "Triage incoming calls, book appointments, route emergencies to the on-call line. Lahore Smile, Shifa Care, Hayat Medical.",
    bullets: [
      "HIPAA-aware consent prompts and PII redaction",
      "Calendar sync with Cal.com, Google Calendar, Microsoft 365",
      "Emergency keywords transfer to a live nurse in under 8 seconds",
    ],
  },
  {
    icon: HomeIcon,
    title: "Real estate",
    blurb:
      "Capture buyer profile, quote matching listings, book viewings. Imlaak Realty, Zameen-style listing agents.",
    bullets: [
      "Pulls live MLS-style listings filtered by budget + society",
      "Books viewings in the agent's calendar with SMS reminders",
      "Hands off warm leads to human agents with full call context",
    ],
  },
  {
    icon: ShoppingBag,
    title: "E-commerce support",
    blurb:
      "Order status, refund initiation, COD verification, return labels. Daraz, Foodpanda Mall, Shopify storefronts.",
    bullets: [
      "Live courier position pulled from Leopards, TCS, M&P",
      "Refunds initiated mid-call with ticket reference",
      "COD callers verified against registered phone + email",
    ],
  },
  {
    icon: Scale,
    title: "Legal intake",
    blurb:
      "Screen potential clients, collect case facts, run conflict checks. Family, civil, corporate, criminal.",
    bullets: [
      "Disclaimer recited at every intake (not legal advice)",
      "Case facts captured with PII separation for matter creation",
      "Suitable matters auto-book a 30 minute consultation",
    ],
  },
  {
    icon: Phone,
    title: "Utility & telecom",
    blurb:
      "Balance, bill, package, complaint. Jazz, Telenor Microfinance, K-Electric, SNGPL.",
    bullets: [
      "MSISDN match for instant subscriber lookup",
      "Live package read with cost, validity, and benefits",
      "Complaint ticket logged with 24-hour callback SLA",
    ],
  },
  {
    icon: Building2,
    title: "IT help desk",
    blurb:
      "Password resets, VPN, software access, incident triage. Internal-facing line for enterprise teams.",
    bullets: [
      "Active Directory and Okta integrations",
      "MFA re-enrollment walked through step-by-step",
      "Severity-classified incident tickets with on-call paging",
    ],
  },
  {
    icon: Briefcase,
    title: "Outbound CS",
    blurb:
      "Renewals, payment reminders, win-back campaigns. Respectful, never pushy, single-offer collections.",
    bullets: [
      "Do-not-call list scanned before every dial",
      "Permission asked in the first 5 seconds of every call",
      "Stripe payment links sent mid-call for collections",
    ],
  },
];

export default function UseCasesPage() {
  return (
    <MarketingShell>
      <MarketingHero
        eyebrow="Use cases"
        title={
          <>
            Every kind of call your business{" "}
            <span>already takes.</span>
          </>
        }
        lede="Callen.ai ships templates for the eight verticals Pakistani SMBs run on. Pick one, tune the prompt, point a phone number at it. Live in under ten minutes."
      />

      <MarketingSection>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
          {VERTICALS.map((v) => (
            <div
              key={v.title}
              className="rounded-3xl border border-hairline p-7 lg:p-8 hover:border-neutral-400 transition-colors"
            >
              <div className="size-11 rounded-2xl bg-shell flex items-center justify-center mb-5">
                <v.icon className="size-5" />
              </div>
              <h3 className="text-xl font-normal tracking-tight mb-2">{v.title}</h3>
              <p className="text-[15px] text-ink-soft leading-relaxed mb-5">{v.blurb}</p>
              <ul className="space-y-2.5">
                {v.bullets.map((b) => (
                  <li
                    key={b}
                    className="flex gap-2.5 text-[14px] text-black leading-relaxed"
                  >
                    <span className="text-neutral-400 shrink-0 mt-1">·</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </MarketingSection>

      <MarketingSection
        eyebrow="Built for your line of work"
        title={
          <>
            Don&apos;t see your vertical?{" "}
            <span>Build a custom one.</span>
          </>
        }
      >
        <p className="text-ink-soft leading-relaxed mb-7 max-w-2xl">
          Every Callen.ai agent is a prompt, a workflow, and a set of tools.
          You can build one from scratch in Agent Studio for any business you
          run. The 8 templates above are starting points, not limits.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-neutral-950 text-white text-sm font-normal hover:bg-neutral-800 transition-colors"
          >
            Try Callen.ai free <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white border border-neutral-300 text-neutral-950 text-sm font-normal hover:bg-shell transition-colors"
          >
            Talk to a human
          </Link>
        </div>
      </MarketingSection>
    </MarketingShell>
  );
}
