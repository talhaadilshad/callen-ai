// /pricing — per-restaurant plans in PKR.
//
// Prices are set from what a call minute costs us: the voice runtime
// (Uplift) charges about PKR 12 per phone minute and PKR 9 per browser
// minute (2026-11). Included minutes work out to PKR 22 to 25 each, so
// every plan covers its own minutes with roughly 45 to 50% left over.
// Revisit these numbers whenever the runtime's rate changes.

import Link from "next/link";
import { Check } from "lucide-react";
import {
  MarketingShell,
  MarketingHero,
  MarketingSection,
} from "@/components/marketing/marketing-shell";
import { BTN_PRIMARY } from "@/components/marketing/kit";
import { GrainSurface, Orb } from "@/components/brand/orb";

export const metadata = {
  title: "Pricing",
  description:
    "Callen.ai pricing for Pakistani restaurants. Free 14-day pilot, then plans from PKR 14,900 a month with call minutes included. Pay in PKR.",
};

type Tier = {
  id: "starter" | "growth" | "chains";
  name: string;
  price: string;
  priceLabel: string;
  description: string;
  features: string[];
  cta: string;
  ctaHref: string;
  featured?: boolean;
};

const TIERS: Tier[] = [
  {
    id: "starter",
    name: "Starter",
    price: "PKR 14,900",
    priceLabel: "per month · 600 minutes included",
    description: "One branch that wants every call answered, in Urdu.",
    features: [
      "1 Urdu agent for one branch",
      "600 call minutes a month (about 10 calls a day)",
      "1 Pakistani phone number",
      "Knowledge Base: menu, deals, policies, FAQs",
      "16 Urdu voices and your own pronunciation list",
      "Extra minutes at PKR 25 each",
      "Email and WhatsApp support",
    ],
    cta: "Start free pilot",
    ctaHref: "/signup",
  },
  {
    id: "growth",
    name: "Growth",
    price: "PKR 34,900",
    priceLabel: "per month · 1,600 minutes included",
    description: "Busy restaurants and small groups with up to three branches.",
    features: [
      "Up to 3 Urdu agents, one per branch",
      "1,600 call minutes a month (about 25 calls a day)",
      "Up to 3 Pakistani phone numbers",
      "Everything in Starter",
      "Extra minutes at PKR 22 each",
      "We set up your menu and deals for you",
      "Priority WhatsApp support",
    ],
    cta: "Start free pilot",
    ctaHref: "/signup",
    featured: true,
  },
  {
    id: "chains",
    name: "Chains",
    price: "Custom",
    priceLabel: "priced on your call volume",
    description: "Restaurant chains and call centres taking thousands of calls.",
    features: [
      "As many agents and branches as you need",
      "Volume rate per minute",
      "Several calls answered at the same time",
      "Numbers for every branch",
      "Hands-on setup and tuning by our team",
      "A named contact for support",
    ],
    cta: "Talk to us",
    ctaHref: "/contact",
  },
];

const FAQS: Array<{ q: string; a: string }> = [
  {
    q: "How does the free pilot work?",
    a: "You get 14 days and 100 call minutes at no cost. Build your agent, add your menu, and talk to it from the dashboard. No card is needed to start.",
  },
  {
    q: "What counts as a minute?",
    a: "The time your agent spends on a call with a customer. Test calls you make from the dashboard count too.",
  },
  {
    q: "What happens if I go over my minutes?",
    a: "Extra minutes are billed at PKR 25 each on Starter and PKR 22 on Growth. We contact you before you run over, so there are no surprise bills.",
  },
  {
    q: "How do I get a phone number?",
    a: "Request one from the Phone Numbers page. We arrange a Pakistani number through our telephony partner and connect it to your agent, usually within one business day. You can keep your current restaurant number and forward its calls to the new one.",
  },
  {
    q: "How do I pay?",
    a: "We invoice monthly in Pakistani Rupees. During the beta, payment is by bank transfer.",
  },
  {
    q: "Is there a long-term contract?",
    a: "No. Starter and Growth are monthly and you can cancel any time. Chains plans are agreed with you.",
  },
];

export default function PricingPage() {
  return (
    <MarketingShell>
      <MarketingHero
        eyebrow="Pricing"
        title={
          <>
            Simple PKR pricing.{" "}
            <span>Built for restaurants.</span>
          </>
        }
        lede="Pay in rupees. Start with a free 14-day pilot, then pick the plan that matches how many calls your restaurant takes."
      />

      <MarketingSection>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-hairline bg-shell px-6 py-5">
          <div className="flex items-center gap-4">
            <Orb palette="sun" className="size-10" />
            <div>
              <p className="text-[17px] text-black">Free pilot: 14 days, 100 call minutes</p>
              <p className="mt-0.5 text-[15px] text-ink-soft">
                Build your agent, add your menu and talk to it in Urdu before you pay anything.
              </p>
            </div>
          </div>
          <Link href="/signup" className={BTN_PRIMARY}>
            Start free pilot
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-x-3 gap-y-10 lg:grid-cols-3">
          {TIERS.map((tier) => {
            const tile = (
              <div className="flex h-44 flex-col justify-between p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-light tracking-[-0.01em]">{tier.name}</h3>
                  {tier.featured && (
                    <span className="rounded-full border border-white/60 px-2.5 py-0.5 text-xs">Most popular</span>
                  )}
                </div>
                <div>
                  <p className="text-[1.6rem] font-light leading-none tracking-[-0.02em]">{tier.price}</p>
                  <p className={tier.featured ? "mt-2 text-sm text-white/85" : "mt-2 text-sm text-ink-soft"}>
                    {tier.priceLabel}
                  </p>
                </div>
              </div>
            );
            return (
              <div key={tier.id} className="flex flex-col">
                {tier.featured ? (
                  <GrainSurface palette="ember" className="rounded-3xl text-white">
                    {tile}
                  </GrainSurface>
                ) : (
                  <div className="rounded-3xl border border-hairline bg-shell">{tile}</div>
                )}
                <Link href={tier.ctaHref} className={`${BTN_PRIMARY} mt-3 w-full`}>
                  {tier.cta}
                </Link>
                <p className="mt-6 text-[15px] leading-relaxed text-ink-soft">{tier.description}</p>
                <ul className="mt-4">
                  {tier.features.map((f) => (
                    <li
                      key={f}
                      className="flex gap-3 border-b border-dotted border-black/15 py-3 text-[15px] text-black last:border-0"
                    >
                      <Check className="mt-1 size-4 shrink-0" strokeWidth={1.75} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </MarketingSection>

      <MarketingSection
        eyebrow="Pricing FAQ"
        title={<>What you&apos;d ask <span>on a demo call.</span></>}
      >
        <div className="grid gap-3 md:grid-cols-2">
          {FAQS.map((f) => (
            <div key={f.q} className="rounded-3xl border border-hairline bg-shell p-6">
              <h4 className="text-base font-normal tracking-tight mb-2">{f.q}</h4>
              <p className="text-[14.5px] text-ink-soft leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </MarketingSection>

      <MarketingSection>
        <GrainSurface palette="ocean" className="rounded-3xl text-white">
          <div className="flex flex-col items-start justify-between gap-6 p-8 md:flex-row md:items-end lg:p-12">
            <div>
              <h2 className="mb-3 text-3xl font-light tracking-[-0.02em] md:text-4xl">Still working out the math?</h2>
              <p className="max-w-xl text-base leading-relaxed text-white/90">
                Tell us how many calls your restaurant takes in a day and we&apos;ll size a plan for you, in Pakistani Rupees.
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex h-11 shrink-0 items-center rounded-full bg-white px-5 text-[15px] text-black transition-colors hover:bg-white/90"
            >
              Talk to us
            </Link>
          </div>
        </GrainSurface>
      </MarketingSection>
    </MarketingShell>
  );
}
