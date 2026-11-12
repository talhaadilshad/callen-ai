// Callen.ai landing page: Urdu AI phone agents for Pakistani restaurants.
//
// The look: neutral grey-white pages, black type set light and large,
// hairline rules and pill buttons. There is no brand colour; colour lives
// only in the gradient orbs (one per agent voice) and a few grain surfaces.
// Most sections move: the voice stage plays a sample call, the order demo
// fills in a ticket, the call flow and the day timeline advance by
// themselves, and everything else fades up as it scrolls into view.

"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { BookOpen, Check, Headphones, Phone, Store } from "lucide-react";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { GrainSurface, Orb, type OrbPalette } from "@/components/brand/orb";
import { CountUp } from "@/components/count-up";
import { CallFlow } from "@/components/landing/call-flow";
import { DayTimeline } from "@/components/landing/day-timeline";
import { OrderDemo } from "@/components/landing/order-demo";
import { SaidRight } from "@/components/landing/said-right";
import { VoiceStage } from "@/components/landing/voice-stage";
import {
  Band, BTN_PRIMARY, BTN_SECONDARY, H1, H2, InfoCard, Rail, SectionHead,
} from "@/components/marketing/kit";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { Reveal, WordsReveal } from "@/components/marketing/reveal";
import { AgentStudioMockup } from "@/components/mockups/agent-studio-mockup";
import { TestimonialsSection } from "@/components/testimonials-section";
import { urduFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

const RESTAURANTS = ["Cheezious", "Domino's", "KFC", "Pizza Hut", "Howdy", "OPTP"];

const QUESTIONS_A = ["Kab tak khule hain?", "G-11 mein delivery?", "Delivery charges?", "Minimum order?"];
const QUESTIONS_B = ["Card se payment?", "Nearest branch?", "Aaj ki deal?", "Table for six?"];

const VOICE_WALL: Array<{ name: string; palette: OrbPalette }> = [
  { name: "Ayesha", palette: "ember" },
  { name: "Ahmed", palette: "ocean" },
  { name: "Hira", palette: "lilac" },
  { name: "Bilal", palette: "moss" },
  { name: "Sana", palette: "rose" },
  { name: "Usman", palette: "dusk" },
  { name: "Zainab", palette: "sun" },
  { name: "Hamza", palette: "mint" },
];

const STEPS = [
  {
    n: "1",
    title: "Tell it about your restaurant",
    body: "Name, branches, timings, delivery areas and payment. Pick a voice and listen to it before you choose.",
  },
  {
    n: "2",
    title: "Add your menu and deals",
    body: "Paste your menu, then add deals, policies and FAQs. Your agent says only what you have given it.",
  },
  {
    n: "3",
    title: "Call it, then go live",
    body: "Talk to your agent in the browser first. When you are happy, we arrange a Pakistani number for you.",
  },
];

const CONTROL = [
  { icon: BookOpen, title: "Your menu is the script", body: "Change a price in the dashboard and your agent has it within a minute." },
  { icon: Headphones, title: "Test before customers do", body: "Talk to your agent in the browser as often as you like before it goes on a real line." },
  { icon: Phone, title: "A local number", body: "Our team sets up a Pakistani number for your restaurant. Forward your existing line to it." },
  { icon: Store, title: "One agent per branch", body: "Each branch keeps its own timings, delivery areas and deals." },
];

const PLANS: Array<{ name: string; price: string; per: string; line: string; palette: OrbPalette | null }> = [
  { name: "Free pilot", price: "PKR 0", per: "for 14 days", line: "100 call minutes to build and test your agent.", palette: null },
  { name: "Starter", price: "PKR 14,900", per: "per month", line: "600 minutes included. One branch.", palette: "ember" },
  { name: "Growth", price: "PKR 34,900", per: "per month", line: "1,600 minutes included. Up to three branches.", palette: null },
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
    a: "About ten minutes for a first agent. You enter your restaurant details, add your menu and deals, and pick a voice. After that, you can talk to it straight away in your browser.",
  },
  {
    q: "Do I need a new phone number?",
    a: "During the beta, our team arranges a dedicated Pakistani number for your restaurant, usually within a few working days. You can forward your existing line to it, so customers keep calling the number they already know.",
  },
  {
    q: "Does it understand English words?",
    a: "Yes. Callen is built for Urdu first, and it understands the English that Pakistanis mix into Urdu every day: item names, sizes, addresses and words like order, deal and delivery.",
  },
  {
    q: "What does it cost?",
    a: "You start with a free 14-day pilot that includes 100 call minutes. Paid plans start at PKR 14,900 a month for Starter (600 minutes, one branch) and PKR 34,900 a month for Growth (1,600 minutes, up to three branches). Chains are priced on call volume.",
  },
];

function Chips({ items, reverse = false }: { items: string[]; reverse?: boolean }) {
  // The list is doubled so the marquee can loop without a gap.
  return (
    <div className={cn("flex w-max gap-2 animate-marquee", reverse && "[animation-direction:reverse]")}>
      {[...items, ...items, ...items, ...items].map((q, i) => (
        <span key={i} className="whitespace-nowrap rounded-full border border-hairline bg-white px-3.5 py-1.5 text-sm text-black">
          {q}
        </span>
      ))}
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className={cn(urduFont, "overflow-x-clip bg-paper text-black")}>
      <MarketingNav />

      {/* ============================ HERO ============================ */}
      <section>
        <Rail className="pb-16 pt-14 lg:pb-20 lg:pt-20">
          <div className="grid items-end gap-x-12 gap-y-6 lg:grid-cols-2">
            <div>
              <h1 className={H1}>
                <WordsReveal text={"Missed calls are\nmissed orders"} onView={false} />
              </h1>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.45 }}
                className="mt-7 flex flex-wrap items-center gap-2.5"
              >
                <Link href="/signup" className={BTN_PRIMARY}>
                  Start free pilot
                </Link>
                <Link href="/contact" className={BTN_SECONDARY}>
                  Talk to us
                </Link>
              </motion.div>
            </div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="max-w-md text-base leading-relaxed text-black lg:justify-self-end"
            >
              Callen answers your restaurant&apos;s phone on the first ring and takes the order in natural Urdu. It
              knows your menu and today&apos;s deals, and it never puts a caller on hold.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.2, 0.65, 0.3, 0.9] }}
            className="mt-12 lg:mt-14"
          >
            <VoiceStage />
          </motion.div>
        </Rail>
      </section>

      {/* ============================ RESTAURANTS + NUMBERS ============================ */}
      <section className="border-t border-hairline">
        <Rail className="py-12">
          <p className="mb-8 text-center text-[15px] text-ink-soft">
            Built for the restaurants Pakistan calls every day
          </p>
          <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
            <div className="flex w-max animate-marquee items-center">
              {[...RESTAURANTS, ...RESTAURANTS, ...RESTAURANTS, ...RESTAURANTS].map((name, i) => (
                <span key={i} className="px-10 text-xl tracking-tight text-black/40 lg:px-14">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </Rail>
        <div className="border-t border-hairline">
          <Rail className="grid grid-cols-2 !px-0 md:grid-cols-4">
            {[
              { big: <CountUp to={16} />, label: "Urdu voices, male and female" },
              { big: "24/7", label: "Answers on the first ring" },
              { big: <CountUp to={10} suffix=" min" />, label: "To set up your first agent" },
              { big: <CountUp to={100} />, label: "Free call minutes in the pilot" },
            ].map((stat, i) => (
              <Reveal
                key={stat.label}
                delay={i * 0.06}
                className={cn(
                  "border-hairline px-5 py-9 sm:px-8 lg:px-12",
                  i % 2 === 1 && "border-l",
                  i >= 2 && "border-t md:border-t-0",
                  i === 2 && "md:border-l"
                )}
              >
                <p className="text-4xl font-light tracking-[-0.02em] lg:text-5xl">{stat.big}</p>
                <p className="mt-2 text-[15px] text-ink-soft">{stat.label}</p>
              </Reveal>
            ))}
          </Rail>
        </div>
      </section>

      {/* ============================ PRODUCT ============================ */}
      <Band id="product">
        <Reveal>
          <SectionHead
            label="Callen Agents"
            title="An agent that takes the order, not just the call"
            body="It listens, asks for what is missing, reads the order back and confirms the total, the way your best person on the phone would. At 2 pm or at 2 am."
            cta={{ href: "/signup", label: "Build your agent" }}
          />
        </Reveal>

        <Reveal>
          <OrderDemo />
        </Reveal>

        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
          <Reveal>
            <InfoCard
              className="h-full"
              title="Deals"
              body="Every caller hears today's deal, and the add-on that fits the order, once and politely."
            >
              <div className="space-y-2 rounded-2xl border border-hairline bg-white p-3 text-sm">
                <div className="flex items-center justify-between gap-3 rounded-xl bg-shell px-3 py-2.5">
                  <span>Family Deal</span>
                  <span className="flex items-center gap-2">
                    <span className="tabular-nums text-ink-soft">1,999</span>
                    <span className="rounded-full bg-black px-2 py-0.5 text-[11px] text-white">Live</span>
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 px-3 py-2.5 text-black/45">
                  <span>Midnight Deal</span>
                  <span className="flex items-center gap-2">
                    <span className="tabular-nums">1,499</span>
                    <span className="rounded-full border border-hairline px-2 py-0.5 text-[11px]">Paused</span>
                  </span>
                </div>
              </div>
            </InfoCard>
          </Reveal>

          <Reveal delay={0.06}>
            <InfoCard
              className="h-full overflow-hidden"
              title="Questions"
              body="Timings, branches, delivery areas and charges, answered from your own restaurant info."
            >
              <div className="-mx-6 space-y-2 overflow-hidden py-2 [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
                <Chips items={QUESTIONS_A} />
                <Chips items={QUESTIONS_B} reverse />
              </div>
            </InfoCard>
          </Reveal>

          <Reveal delay={0.12}>
            <InfoCard
              className="h-full"
              title="Table bookings"
              body="Takes the day, the time and the number of guests, and reads them back to the caller."
            >
              <div className="rounded-2xl border border-hairline bg-white p-3 text-sm">
                <p className="px-1 pb-2.5 text-ink-soft">Saturday · 6 guests</p>
                <div className="grid grid-cols-3 gap-1.5 text-center">
                  <span className="rounded-xl border border-hairline py-2 text-black/45">7:30 pm</span>
                  <span className="flex items-center justify-center gap-1 rounded-xl bg-black py-2 text-white">
                    <Check className="size-3.5" strokeWidth={2.5} /> 8:00 pm
                  </span>
                  <span className="rounded-xl border border-hairline py-2 text-black/45">8:30 pm</span>
                </div>
              </div>
            </InfoCard>
          </Reveal>
        </div>
      </Band>

      {/* ============================ CALL FLOW ============================ */}
      <Band id="flow">
        <Reveal>
          <SectionHead
            label="On every call"
            title="From the first ring to a confirmed order"
            body="The same five steps on every call, whether it is the first of the day or the two-hundredth. Hover over a step to hold it."
          />
        </Reveal>
        <Reveal>
          <CallFlow />
        </Reveal>
      </Band>

      {/* ============================ URDU VOICES ============================ */}
      <Band id="voices">
        <Reveal>
          <SectionHead
            label="Urdu voices"
            title="Sounds like your best order taker, not a robot"
            body="Everyday Pakistani Urdu, with words like pizza, deal and delivery said the natural way. Each voice uses the right grammar for a male or a female speaker."
          />
        </Reveal>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <Reveal>
            <InfoCard
              className="h-full"
              title="Sixteen voices"
              body="Choose the voice that fits your brand, and listen to it before you decide. Every voice has its own orb."
            >
              <div className="my-auto grid grid-cols-4 gap-x-3 gap-y-9 py-6">
                {VOICE_WALL.map((v, i) => (
                  <motion.div
                    key={v.name}
                    className="flex flex-col items-center gap-2.5"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 4 + (i % 4) * 0.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.25 }}
                  >
                    <Orb
                      palette={v.palette}
                      className="size-14 shadow-[0_12px_24px_-12px_rgba(0,0,0,0.35)] transition-transform duration-300 hover:scale-110 sm:size-[5.5rem]"
                    />
                    <span className="text-sm text-black">{v.name}</span>
                  </motion.div>
                ))}
              </div>
            </InfoCard>
          </Reveal>

          <Reveal delay={0.08} className="h-full">
            <SaidRight />
          </Reveal>
        </div>
      </Band>

      {/* ============================ A DAY ON THE LINE ============================ */}
      <Band>
        <Reveal>
          <SectionHead
            label="Always on"
            title="A day on your phone line"
            body="Your staff get busy, go on break and go home. The phone keeps getting answered, the same way, from the lunch rush to the last order of the night."
          />
        </Reveal>
        <Reveal>
          <DayTimeline />
        </Reveal>
      </Band>

      {/* ============================ HOW IT WORKS ============================ */}
      <Band id="how">
        <Reveal>
          <SectionHead
            label="Agent Studio"
            title="Set up before the dinner rush"
            body="No engineer and no code. If you can fill in a menu, you can build your agent, and you can change it at any time."
          />
        </Reveal>

        <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-[1fr_1.35fr]">
          <div className="rounded-3xl border border-hairline bg-shell px-6">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.1} className="flex gap-5 border-b border-hairline py-6 last:border-0">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-hairline bg-white text-sm">
                  {s.n}
                </span>
                <div>
                  <h3 className="text-[15px] text-black">{s.title}</h3>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-ink-soft">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.1}>
            <AgentStudioMockup />
          </Reveal>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CONTROL.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.06}>
              <InfoCard className="h-full" icon={<f.icon className="size-[18px]" strokeWidth={1.5} />} title={f.title} body={f.body} />
            </Reveal>
          ))}
        </div>

        <p className="mt-6 text-sm text-ink-soft">
          Coming next in the beta: each order sent to your team on WhatsApp, call recordings with transcripts, and a
          link to your POS.
        </p>
      </Band>

      {/* ============================ PRICING ============================ */}
      <Band id="pricing">
        <Reveal>
          <SectionHead
            label="Pricing"
            title="Costs less than one person on the phone"
            body="Call minutes are included in every plan, and you pay in rupees. Try it free first, and pay only when it is taking real calls."
            cta={{ href: "/pricing", label: "See full pricing" }}
          />
        </Reveal>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {PLANS.map((plan, i) => {
            const inner = (
              <div className="flex h-56 flex-col justify-between p-6">
                <div className="flex items-center justify-between">
                  <span className="text-xl font-light">{plan.name}</span>
                  {plan.palette && (
                    <span className="rounded-full border border-white/60 px-2.5 py-0.5 text-xs">Most restaurants</span>
                  )}
                </div>
                <div>
                  <p className="text-[1.7rem] font-light leading-none tracking-[-0.02em]">
                    {plan.price}{" "}
                    <span className={cn("text-sm", plan.palette ? "text-white/85" : "text-ink-soft")}>{plan.per}</span>
                  </p>
                  <p className={cn("mt-2.5 text-[15px] leading-relaxed", plan.palette ? "text-white/90" : "text-ink-soft")}>
                    {plan.line}
                  </p>
                </div>
              </div>
            );
            return (
              <Reveal key={plan.name} delay={i * 0.07}>
                <div className="transition-transform duration-300 hover:-translate-y-1">
                  {plan.palette ? (
                    <GrainSurface palette={plan.palette} className="rounded-3xl text-white">
                      {inner}
                    </GrainSurface>
                  ) : (
                    <div className="rounded-3xl border border-hairline bg-shell">{inner}</div>
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>
      </Band>

      {/* ============================ TESTIMONIALS ============================ */}
      <TestimonialsSection />

      {/* ============================ FAQ ============================ */}
      <Band id="faq">
        <div className="grid gap-x-12 gap-y-8 lg:grid-cols-[1fr_1.5fr]">
          <Reveal>
            <p className="mb-4 text-sm text-ink-soft">Questions</p>
            <h2 className={H2}>What owners ask us first</h2>
          </Reveal>
          <Reveal delay={0.08}>
            <Accordion className="w-full">
              {FAQS.map((item, i) => (
                <AccordionItem key={item.q} value={`item-${i}`} className="border-b border-hairline last:border-0">
                  <AccordionTrigger className="py-5 text-left text-[17px] font-normal hover:no-underline">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="pb-5 text-[15px] leading-relaxed text-ink-soft">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>
      </Band>

      {/* ============================ CLOSING ============================ */}
      <section className="border-t border-hairline">
        <Rail className="flex flex-col items-center py-24 text-center lg:py-32">
          <Reveal>
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
              <Orb palette="ember" className="mx-auto size-28 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.4)] lg:size-36" />
            </motion.div>
          </Reveal>
          <h2 className={cn(H1, "mt-10 max-w-3xl")}>
            <WordsReveal text={"Hear it take an order\nfrom your own menu"} />
          </h2>
          <Reveal delay={0.2}>
            <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-ink-soft">
              Build your agent in ten minutes and call it yourself. Free for 14 days, with 100 call minutes included.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
              <Link href="/signup" className={BTN_PRIMARY}>
                Start free pilot
              </Link>
              <Link href="/contact" className={BTN_SECONDARY}>
                Talk to us
              </Link>
            </div>
          </Reveal>
        </Rail>
      </section>

      <MarketingFooter />
    </div>
  );
}
