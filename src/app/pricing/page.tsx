// /pricing — per-restaurant plans in PKR.
//
// Prices are set from what a call minute costs us: the voice runtime
// (Uplift) charges about PKR 12 per phone minute and PKR 9 per browser
// minute (2026-11). Included minutes work out to PKR 22 to 25 each, so
// every plan covers its own minutes with roughly 45 to 50% left over.
// Revisit these numbers whenever the runtime's rate changes.

import Link from "next/link";
import { Check, ArrowRight, Phone } from "lucide-react";
import {
  MarketingShell,
  MarketingHero,
  MarketingSection,
} from "@/components/marketing/marketing-shell";

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
            <span className="italic font-light">Built for restaurants.</span>
          </>
        }
        lede="Pay in rupees. Start with a free 14-day pilot, then pick the plan that matches how many calls your restaurant takes."
      />

      <MarketingSection>
        <div className="rounded-3xl border border-neutral-200 bg-neutral-50 px-6 py-5 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-base font-bold tracking-tight">Free pilot: 14 days, 100 call minutes</p>
            <p className="text-[14px] text-neutral-600 mt-0.5">
              Build your agent, add your menu and talk to it in Urdu before you pay anything.
            </p>
          </div>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-neutral-950 text-white text-sm font-semibold hover:bg-neutral-800 transition-colors"
          >
            Start free pilot <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6">
          {TIERS.map((tier) => (
            <div
              key={tier.id}
              className={
                tier.featured
                  ? "rounded-3xl bg-neutral-950 text-white p-8 lg:p-10 relative overflow-hidden"
                  : "rounded-3xl border border-neutral-200 p-8 lg:p-10"
              }
            >
              {tier.featured && (
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br from-neutral-100/15 via-neutral-50/15 to-white/20 rounded-full blur-3xl" />
              )}
              <div className="relative">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-xl font-bold tracking-tight">{tier.name}</h3>
                  {tier.featured && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-white text-neutral-950 text-[10px] font-semibold uppercase tracking-wider">
                      Most popular
                    </span>
                  )}
                </div>
                <div className="mb-6">
                  <p
                    className={
                      tier.featured
                        ? "text-4xl font-bold tracking-tight"
                        : "text-4xl font-bold tracking-tight"
                    }
                  >
                    {tier.price}
                  </p>
                  <p
                    className={
                      tier.featured
                        ? "text-xs uppercase tracking-widest text-white/60 mt-1"
                        : "text-xs uppercase tracking-widest text-neutral-500 mt-1"
                    }
                  >
                    {tier.priceLabel}
                  </p>
                </div>
                <p
                  className={
                    tier.featured
                      ? "text-[14px] text-white/70 leading-relaxed mb-7"
                      : "text-[14px] text-neutral-600 leading-relaxed mb-7"
                  }
                >
                  {tier.description}
                </p>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((f) => (
                    <li
                      key={f}
                      className={
                        tier.featured
                          ? "flex gap-2.5 text-[14px] text-white/85"
                          : "flex gap-2.5 text-[14px] text-neutral-700"
                      }
                    >
                      <Check
                        className={
                          tier.featured
                            ? "size-4 shrink-0 mt-0.5 text-white/90"
                            : "size-4 shrink-0 mt-0.5 text-neutral-900"
                        }
                      />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={tier.ctaHref}
                  className={
                    tier.featured
                      ? "w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-white text-neutral-950 text-sm font-semibold hover:bg-white/90 transition-colors"
                      : "w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-neutral-950 text-white text-sm font-semibold hover:bg-neutral-800 transition-colors"
                  }
                >
                  {tier.cta} <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </MarketingSection>

      <MarketingSection
        eyebrow="Pricing FAQ"
        title={<>What you&apos;d ask <span className="italic font-light">on a demo call.</span></>}
      >
        <div className="space-y-5">
          {FAQS.map((f) => (
            <div key={f.q} className="rounded-2xl border border-neutral-200 p-6">
              <h4 className="text-base font-semibold tracking-tight mb-2">{f.q}</h4>
              <p className="text-[14.5px] text-neutral-600 leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </MarketingSection>

      <MarketingSection>
        <div className="rounded-3xl bg-neutral-950 text-white p-10 lg:p-14 text-center">
          <Phone className="size-7 mx-auto mb-4 text-white/70" />
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            Still working out the math?
          </h2>
          <p className="text-white/70 leading-relaxed mb-7 max-w-xl mx-auto">
            Tell us how many calls your restaurant takes in a day and we&apos;ll size a plan for you, in Pakistani Rupees.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white text-neutral-950 text-sm font-semibold hover:bg-white/90 transition-colors"
          >
            Talk to us <ArrowRight className="size-4" />
          </Link>
        </div>
      </MarketingSection>
    </MarketingShell>
  );
}
