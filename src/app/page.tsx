// Callen.ai landing page: Urdu AI phone agents for Pakistani restaurants.
// Brand colours (emerald, saffron, sand) and the display/Urdu fonts come
// from globals.css and src/lib/fonts.ts.

"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { motion } from "motion/react";
import {
  ArrowRight, BookOpen, Check, Headphones, Phone, Store, X,
} from "lucide-react";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { CallScenarios } from "@/components/landing/call-scenarios";
import { HeroCallDemo } from "@/components/landing/hero-call-demo";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { TestimonialsSection } from "@/components/testimonials-section";
import { marketingFonts } from "@/lib/fonts";
import { cn } from "@/lib/utils";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, ease: [0.2, 0.65, 0.3, 0.9] as [number, number, number, number] },
};

const NAV_LINKS = [
  { href: "/#product", label: "What it does" },
  { href: "/#how", label: "How it works" },
  { href: "/#urdu", label: "Urdu" },
  { href: "/pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
];

const BTN_SAFFRON =
  "inline-flex items-center justify-center gap-2 rounded-full bg-saffron-400 px-6 py-3.5 text-sm font-semibold text-neutral-950 transition-colors hover:bg-saffron-300";
const BTN_BRAND =
  "inline-flex items-center justify-center gap-2 rounded-full bg-brand-700 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800";
const BTN_GHOST_DARK =
  "inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10";
const BTN_GHOST_LIGHT =
  "inline-flex items-center justify-center gap-2 rounded-full border border-sand-300 bg-white px-6 py-3.5 text-sm font-semibold text-neutral-950 transition-colors hover:border-brand-300 hover:text-brand-800";

function Eyebrow({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return (
    <motion.span
      {...fadeUp}
      className={cn(
        "mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]",
        dark ? "text-saffron-300" : "text-brand-700"
      )}
    >
      <span className={cn("size-1.5 rounded-full", dark ? "bg-saffron-400" : "bg-saffron-500")} />
      {children}
    </motion.span>
  );
}

function H2({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.h2
      {...fadeUp}
      className={cn(
        "font-display text-4xl font-medium leading-[1.05] tracking-[-0.02em] md:text-5xl lg:text-[3.5rem]",
        className
      )}
    >
      {children}
    </motion.h2>
  );
}

const FACTS = [
  { big: "24/7", label: "Picks up on the first ring, day and night" },
  { big: "16", label: "Natural Urdu voices, male and female" },
  { big: "10 min", label: "To set up your first agent" },
  { big: "PKR 0", label: "For a 14-day pilot with 100 call minutes" },
];

const WITHOUT = [
  "The line is busy at 9 pm on a Friday, so the caller tries the next restaurant",
  "Orders are written by hand, repeated twice and still go out wrong",
  "Nobody picks up during the rush or after closing",
  "Staff forget to mention today's deal",
  "Every new person on the phone has to learn the menu again",
];

const WITH = [
  "Picks up on the first ring, even when the counter is slammed",
  "Reads the full order and total back in Urdu before confirming",
  "Answers at 2 am the same way it does at 2 pm",
  "Offers the right deal on every single call",
  "Knows a new menu the moment you update it",
];

const STEPS = [
  {
    n: "01",
    title: "Tell us about your restaurant",
    body: "Name, branches, timings, delivery areas and payment. Pick one of 16 Urdu voices and listen before you choose.",
  },
  {
    n: "02",
    title: "Add your menu and deals",
    body: "Paste your menu, add deals, policies and FAQs. Your agent only says what you have given it, nothing else.",
  },
  {
    n: "03",
    title: "Call it, then go live",
    body: "Talk to your agent in the browser first. When you are happy, we arrange a Pakistani number for your restaurant.",
  },
];

const URDU_POINTS = [
  {
    title: "Everyday Pakistani Urdu",
    body: "The mix people really use on the phone: Urdu, with words like pizza, deal and delivery said the natural way.",
  },
  {
    title: "Prices the way people say them",
    body: "Saarhe chaubees sau, not two thousand four hundred and fifty. Sectors and areas too: F-10 is “F ten”.",
  },
  {
    title: "Your names, said right",
    body: "Teach it your restaurant name, your signature items and your local areas once. It says them your way on every call.",
  },
  {
    title: "A voice that fits your brand",
    body: "Sixteen voices to choose from, each with correct Urdu grammar for a male or a female speaker.",
  },
];

const SAID_AS = [
  { written: "BBQ", spoken: "باربی کیو" },
  { written: "PKR 1,250", spoken: "ساڑھے بارہ سو روپے" },
  { written: "1.5 L", spoken: "ڈیڑھ لیٹر" },
  { written: "F-10", spoken: "ایف ٹین" },
  { written: "COD", spoken: "کیش آن ڈیلیوری" },
];

const VOICES = ["Ayesha", "Hira", "Sana", "Zainab", "Ahmed", "Bilal", "Usman", "Hamza"];

const CONTROL = [
  {
    icon: BookOpen,
    title: "Your menu is the script",
    body: "Callen answers only from your menu, deals, policies and FAQs. Change a price in the dashboard and your agent has it within a minute.",
  },
  {
    icon: Headphones,
    title: "Test it before customers do",
    body: "Talk to your agent in the browser as many times as you like. It does not go on a real line until you are satisfied.",
  },
  {
    icon: Phone,
    title: "A local number, arranged for you",
    body: "During the beta our team sets up a dedicated Pakistani number for your restaurant. Forward your existing line to it.",
  },
  {
    icon: Store,
    title: "One agent for each branch",
    body: "Every branch has its own timings, delivery areas and deals, so callers get answers for the branch they rang.",
  },
];

const PLANS = [
  {
    name: "Free pilot",
    price: "PKR 0",
    per: "14 days",
    line: "100 call minutes to build your agent and test it properly.",
    featured: false,
  },
  {
    name: "Starter",
    price: "PKR 14,900",
    per: "per month",
    line: "600 minutes included. One branch, every call answered.",
    featured: true,
  },
  {
    name: "Growth",
    price: "PKR 34,900",
    per: "per month",
    line: "1,600 minutes included. Up to three branches.",
    featured: false,
  },
];

const FAQS = [
  {
    q: "Will it sound like a robot?",
    a: "No. Callen speaks everyday Pakistani Urdu in a natural voice that you choose. You do not have to take our word for it: build your agent, call it from the dashboard and judge it yourself before a single customer hears it.",
  },
  {
    q: "What if a caller asks something it does not know?",
    a: "Callen answers only from the menu, deals and information you have given it. If the answer is not there, it says so plainly instead of guessing. You can then add the answer to your knowledge base in a minute.",
  },
  {
    q: "How long does setup take?",
    a: "About ten minutes for a first agent. You enter your restaurant details, add your menu and deals, and pick a voice. After that you can talk to it straight away in your browser.",
  },
  {
    q: "Do I need a new phone number?",
    a: "During the beta our team arranges a dedicated Pakistani number for your restaurant, usually within a few working days. You can forward your existing line to it, so customers keep calling the number they already know.",
  },
  {
    q: "Does it understand English words?",
    a: "Yes. Callen is built for Urdu first, and it understands the English that Pakistanis mix into Urdu every day: item names, sizes, addresses and words like order, deal and delivery.",
  },
  {
    q: "What does it cost?",
    a: "Start with a free 14-day pilot that includes 100 call minutes. Paid plans start at PKR 14,900 a month for Starter (600 minutes, one branch) and PKR 34,900 for Growth (1,600 minutes, up to three branches). Chains are priced on call volume.",
  },
];

export default function LandingPage() {
  return (
    <div className={cn(marketingFonts, "bg-white text-neutral-950")}>
      <MarketingNav links={NAV_LINKS} overDark />

      {/* ============================ HERO ============================ */}
      <section className="relative bg-brand-950 pt-32 text-white lg:pt-40">
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-48 left-1/2 h-[38rem] w-[64rem] -translate-x-1/2 rounded-full bg-brand-600/35 blur-3xl" />
          <div className="absolute -right-40 top-48 size-[30rem] rounded-full bg-saffron-500/15 blur-3xl" />
          <div className="absolute -left-40 bottom-0 size-[26rem] rounded-full bg-brand-400/15 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-5xl px-6 text-center lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white/85"
          >
            <span className="size-1.5 rounded-full bg-saffron-400" />
            Private beta · Built for Pakistani restaurants
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="font-display text-5xl font-medium leading-[1.02] tracking-[-0.025em] sm:text-6xl lg:text-[5.25rem]"
          >
            Every call answered.
            <br />
            Every order taken, <em className="italic text-saffron-300">in Urdu.</em>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.12 }}
            dir="rtl"
            lang="ur"
            className="mt-5 font-urdu text-xl leading-[2.2] text-saffron-200/90 sm:text-2xl sm:leading-[2.2]"
          >
            آپ کا ریسٹورنٹ، ہر کال پر حاضر۔
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.18 }}
            className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-white/75 md:text-xl"
          >
            Callen is an AI phone agent for Pakistani restaurants. It picks up on the first ring, takes delivery
            and takeaway orders in natural Urdu, knows your menu and today&apos;s deals, and never puts a caller on
            hold.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.26 }}
            className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Link href="/signup" className={BTN_SAFFRON}>
              Start your free pilot
              <ArrowRight className="size-4" />
            </Link>
            <Link href="/#how" className={BTN_GHOST_DARK}>
              See how it works
            </Link>
          </motion.div>

          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/65"
          >
            {["14-day free pilot", "100 call minutes included", "No card needed"].map((t) => (
              <li key={t} className="flex items-center gap-1.5">
                <Check className="size-4 text-saffron-300" strokeWidth={2.5} />
                {t}
              </li>
            ))}
          </motion.ul>
        </div>

        {/* Sample call: hangs over the edge of the hero into the next section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.2, 0.65, 0.3, 0.9] }}
          className="relative z-10 mx-auto -mb-36 mt-14 max-w-4xl px-4 sm:px-6 lg:-mb-44 lg:mt-16"
        >
          <HeroCallDemo />
        </motion.div>
      </section>

      {/* ============================ FACTS ============================ */}
      <section className="border-b border-sand-200 bg-sand-50 pb-14 pt-48 lg:pb-16 lg:pt-60">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
            {FACTS.map((fact) => (
              <div key={fact.big} className="text-center md:text-left">
                <div className="font-display text-4xl font-medium tracking-[-0.02em] text-brand-800 md:text-5xl">
                  {fact.big}
                </div>
                <div className="mt-2 text-sm leading-relaxed text-neutral-600">{fact.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ RESTAURANT NAMES ============================ */}
      <section className="py-14 lg:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="mb-9 text-center text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
            Built for the restaurants Pakistan calls every day
          </p>
          <div className="grid grid-cols-2 items-center gap-6 sm:grid-cols-3 md:grid-cols-6 lg:gap-10">
            {["Cheezious", "Domino's", "KFC", "Pizza Hut", "Howdy", "OPTP"].map((name) => (
              <div
                key={name}
                className="text-center text-base font-semibold tracking-tight text-neutral-400 transition-colors hover:text-brand-700"
              >
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ THE PROBLEM ============================ */}
      <section className="border-y border-sand-200 bg-sand-50 py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <Eyebrow>Why restaurants lose orders</Eyebrow>
            <H2 className="mb-5">
              In Pakistan, the order still <em className="italic text-brand-600">comes by phone.</em>
            </H2>
            <motion.p {...fadeUp} className="text-lg leading-relaxed text-neutral-600">
              And during the rush, the phone is the first thing your team stops answering. Every missed call is an
              order that went to the restaurant next door.
            </motion.p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:gap-6">
            <motion.div {...fadeUp} className="rounded-3xl border border-sand-200 bg-white p-8 lg:p-10">
              <span className="mb-4 inline-block text-xs font-semibold uppercase tracking-widest text-neutral-500">
                One busy phone line
              </span>
              <h3 className="mb-6 font-display text-2xl font-medium tracking-[-0.01em] lg:text-[1.7rem]">
                Missed calls. Wrong orders.
              </h3>
              <ul className="space-y-3.5">
                {WITHOUT.map((t) => (
                  <li key={t} className="flex gap-3 text-[15px] leading-relaxed text-neutral-600">
                    <X className="mt-1 size-4 shrink-0 text-neutral-400" strokeWidth={2.5} />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.08 }}
              className="relative overflow-hidden rounded-3xl bg-brand-900 p-8 text-white lg:p-10"
            >
              <div className="absolute -right-24 -top-24 size-64 rounded-full bg-saffron-400/20 blur-3xl" />
              <div className="relative">
                <span className="mb-4 inline-block text-xs font-semibold uppercase tracking-widest text-saffron-300">
                  With Callen
                </span>
                <h3 className="mb-6 font-display text-2xl font-medium tracking-[-0.01em] lg:text-[1.7rem]">
                  Every call picked up. Every order right.
                </h3>
                <ul className="space-y-3.5">
                  {WITH.map((t) => (
                    <li key={t} className="flex gap-3 text-[15px] leading-relaxed text-white/85">
                      <Check className="mt-1 size-4 shrink-0 text-saffron-300" strokeWidth={2.5} />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================ WHAT IT HANDLES ============================ */}
      <section id="product" className="scroll-mt-16 py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-14 max-w-3xl">
            <Eyebrow>What Callen handles</Eyebrow>
            <H2>
              One agent for the calls that <em className="italic text-brand-600">fill your kitchen.</em>
            </H2>
          </div>
          <motion.div {...fadeUp} className="-mx-2 rounded-[2rem] bg-sand-50 p-2 sm:mx-0 sm:p-6 lg:p-10">
            <CallScenarios />
          </motion.div>
        </div>
      </section>

      {/* ============================ HOW IT WORKS ============================ */}
      <section id="how" className="scroll-mt-16 border-y border-sand-200 bg-sand-50 py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <Eyebrow>How it works</Eyebrow>
            <H2>
              Set up <em className="italic text-brand-600">before the dinner rush.</em>
            </H2>
          </div>

          <div className="grid gap-5 md:grid-cols-3 lg:gap-6">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.n}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.08 }}
                className="card-lift rounded-3xl border border-sand-200 bg-white p-8 hover:border-brand-200"
              >
                <div className="mb-6 flex size-12 items-center justify-center rounded-2xl bg-brand-50 font-display text-xl font-medium text-brand-700">
                  {s.n}
                </div>
                <h3 className="mb-2.5 font-display text-2xl font-medium tracking-[-0.01em]">{s.title}</h3>
                <p className="text-[15px] leading-relaxed text-neutral-600">{s.body}</p>
              </motion.div>
            ))}
          </div>

          <motion.div {...fadeUp} className="mt-10 flex justify-center">
            <Link href="/signup" className={BTN_BRAND}>
              Build your agent
              <ArrowRight className="size-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ============================ URDU ============================ */}
      <section id="urdu" className="relative scroll-mt-16 overflow-hidden bg-brand-950 py-24 text-white lg:py-32">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -left-32 top-0 size-[28rem] rounded-full bg-brand-600/25 blur-3xl" />
          <div className="absolute -right-32 bottom-0 size-[26rem] rounded-full bg-saffron-500/10 blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-6 lg:grid-cols-2 lg:gap-20 lg:px-8">
          <div>
            <Eyebrow dark>Urdu first</Eyebrow>
            <H2 className="mb-10">
              Sounds like your best order taker, <em className="italic text-saffron-300">not a robot.</em>
            </H2>
            <div className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
              {URDU_POINTS.map((point, i) => (
                <motion.div key={point.title} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.06 }}>
                  <h3 className="mb-1.5 text-base font-semibold tracking-tight">{point.title}</h3>
                  <p className="text-[15px] leading-relaxed text-white/65">{point.body}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div {...fadeUp} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm sm:p-8">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
              On the menu → on the call
            </p>
            <ul className="divide-y divide-white/10">
              {SAID_AS.map((row) => (
                <li key={row.written} className="flex items-center justify-between gap-4 py-2.5">
                  <span className="rounded-lg bg-white/10 px-2.5 py-1 font-mono text-xs text-white/80">
                    {row.written}
                  </span>
                  <span dir="rtl" lang="ur" className="font-urdu text-lg leading-[2.2] text-saffron-200">
                    {row.spoken}
                  </span>
                </li>
              ))}
            </ul>

            <p className="mb-3 mt-7 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
              Pick a voice
            </p>
            <div className="flex flex-wrap gap-2">
              {VOICES.map((voice, i) => (
                <span
                  key={voice}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm",
                    i === 0
                      ? "border-saffron-400 bg-saffron-400 font-semibold text-neutral-950"
                      : "border-white/15 text-white/80"
                  )}
                >
                  {voice}
                </span>
              ))}
              <span className="rounded-full border border-dashed border-white/20 px-3 py-1.5 text-sm text-white/50">
                + 8 more
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================ CONTROL ============================ */}
      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-14 max-w-3xl">
            <Eyebrow>Built for owners, not engineers</Eyebrow>
            <H2>
              You run the restaurant. <em className="italic text-brand-600">You run the agent.</em>
            </H2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {CONTROL.map((f, i) => (
              <motion.div
                key={f.title}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.06 }}
                className="card-lift rounded-3xl border border-sand-200 bg-white p-7 hover:border-brand-200"
              >
                <div className="mb-5 flex size-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                  <f.icon className="size-5" />
                </div>
                <h3 className="mb-2 text-lg font-semibold tracking-tight">{f.title}</h3>
                <p className="text-sm leading-relaxed text-neutral-600">{f.body}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            {...fadeUp}
            className="mt-6 flex flex-col gap-3 rounded-3xl border border-dashed border-sand-300 bg-sand-50 px-6 py-5 sm:flex-row sm:items-center sm:gap-5"
          >
            <span className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full bg-saffron-200 px-3 py-1 text-xs font-semibold text-neutral-900">
              Coming next in the beta
            </span>
            <p className="text-sm leading-relaxed text-neutral-600">
              Each order sent to your team on WhatsApp, call recordings with transcripts, and a link to your POS.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ============================ PRICING ============================ */}
      <section id="pricing" className="scroll-mt-16 border-y border-sand-200 bg-sand-50 py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <Eyebrow>Pricing in rupees</Eyebrow>
            <H2 className="mb-5">
              Costs less than <em className="italic text-brand-600">one person on the phone.</em>
            </H2>
            <motion.p {...fadeUp} className="text-lg leading-relaxed text-neutral-600">
              Call minutes are included in every plan. Try it free first, and pay only when it is taking real
              calls for you.
            </motion.p>
          </div>

          <div className="grid gap-5 md:grid-cols-3 lg:gap-6">
            {PLANS.map((plan, i) => (
              <motion.div
                key={plan.name}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.08 }}
                className={cn(
                  "rounded-3xl p-8",
                  plan.featured
                    ? "bg-brand-800 text-white shadow-2xl shadow-brand-950/20"
                    : "border border-sand-200 bg-white"
                )}
              >
                <div className="mb-5 flex items-center justify-between">
                  <span
                    className={cn(
                      "text-xs font-semibold uppercase tracking-widest",
                      plan.featured ? "text-saffron-300" : "text-brand-700"
                    )}
                  >
                    {plan.name}
                  </span>
                  {plan.featured && (
                    <span className="rounded-full bg-saffron-400 px-2.5 py-0.5 text-[11px] font-semibold text-neutral-950">
                      Most restaurants
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-4xl font-medium tracking-[-0.02em]">{plan.price}</span>
                  <span className={cn("text-sm", plan.featured ? "text-white/60" : "text-neutral-500")}>
                    {plan.per}
                  </span>
                </div>
                <p className={cn("mt-4 text-[15px] leading-relaxed", plan.featured ? "text-white/75" : "text-neutral-600")}>
                  {plan.line}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div {...fadeUp} className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/signup" className={BTN_BRAND}>
              Start your free pilot
              <ArrowRight className="size-4" />
            </Link>
            <Link href="/pricing" className={BTN_GHOST_LIGHT}>
              See full pricing
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ============================ TESTIMONIALS ============================ */}
      <TestimonialsSection />

      {/* ============================ FAQ ============================ */}
      <section id="faq" className="scroll-mt-16 border-y border-sand-200 bg-sand-50 py-24 lg:py-32">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <div className="mb-12 text-center">
            <Eyebrow>Questions</Eyebrow>
            <H2>
              What owners ask us <em className="italic text-brand-600">first.</em>
            </H2>
          </div>

          <Accordion className="w-full rounded-3xl border border-sand-200 bg-white px-6 lg:px-8">
            {FAQS.map((item, i) => (
              <AccordionItem key={item.q} value={`item-${i}`} className="border-b border-sand-200 last:border-0">
                <AccordionTrigger className="py-5 text-left text-base font-semibold hover:text-brand-700 hover:no-underline lg:text-lg">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-[15px] leading-relaxed text-neutral-600">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ============================ FINAL CTA ============================ */}
      <section id="contact" className="scroll-mt-16 px-4 py-20 sm:px-6 lg:py-28">
        <motion.div
          {...fadeUp}
          className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-brand-800 px-6 py-20 text-center text-white lg:py-28"
        >
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute -top-32 left-1/2 h-80 w-[44rem] -translate-x-1/2 rounded-full bg-brand-500/40 blur-3xl" />
            <div className="absolute -bottom-32 -right-20 size-80 rounded-full bg-saffron-400/25 blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-3xl">
            <h2 className="mb-6 font-display text-4xl font-medium leading-[1.03] tracking-[-0.025em] sm:text-5xl lg:text-7xl">
              Stop losing orders to a <em className="italic text-saffron-300">busy line.</em>
            </h2>
            <p className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-white/75">
              Build your agent in ten minutes, call it yourself, and hear it take an order from your own menu.
              Free for 14 days.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/signup" className={BTN_SAFFRON}>
                Start your free pilot
                <ArrowRight className="size-4" />
              </Link>
              <Link href="/contact" className={BTN_GHOST_DARK}>
                Talk to us
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      <MarketingFooter />
    </div>
  );
}
