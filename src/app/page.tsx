// Callen.ai landing page: Urdu AI phone agents for Pakistani restaurants.
//
// The look: warm off-white paper, black type set light and large, hairline
// rules and pill buttons. There is no brand colour; colour lives only in
// the gradient orbs (one per agent voice) and a few grain surfaces.

"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { BookOpen, CalendarCheck, Headphones, MessageCircleQuestion, Phone, Store, Tag } from "lucide-react";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { GrainSurface, Orb, type OrbPalette } from "@/components/brand/orb";
import { VoiceStage } from "@/components/landing/voice-stage";
import {
  Band, BTN_PRIMARY, BTN_SECONDARY, ClosingBand, H1, InfoCard, Rail, SectionHead,
} from "@/components/marketing/kit";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { AgentStudioMockup } from "@/components/mockups/agent-studio-mockup";
import { TestimonialsSection } from "@/components/testimonials-section";
import { urduFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, ease: [0.2, 0.65, 0.3, 0.9] as [number, number, number, number] },
};

const TICKET = [
  { item: "1 × Chicken Tikka Pizza (Large)", price: "1,650" },
  { item: "1 × Zinger Burger", price: "650" },
];

const SAID_AS = [
  { written: "BBQ", spoken: "باربی کیو", roman: "baar-bee-kyoo" },
  { written: "PKR 1,250", spoken: "ساڑھے بارہ سو روپے", roman: "saarhe baarah sau rupay" },
  { written: "1.5 L", spoken: "ڈیڑھ لیٹر", roman: "dairh litre" },
  { written: "F-10", spoken: "ایف ٹین", roman: "F ten" },
];

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
    body: "Name, branches, timings, delivery areas and payment. Pick a voice and hear it before you choose.",
  },
  {
    n: "2",
    title: "Add your menu and deals",
    body: "Paste your menu, add deals, policies and FAQs. Your agent says only what you have given it.",
  },
  {
    n: "3",
    title: "Call it, then go live",
    body: "Talk to your agent in the browser first. When you are happy, we arrange a Pakistani number for you.",
  },
];

const PLANS = [
  { name: "Free pilot", price: "PKR 0", per: "for 14 days", line: "100 call minutes to build and test your agent.", palette: null },
  { name: "Starter", price: "PKR 14,900", per: "per month", line: "600 minutes included. One branch.", palette: "ember" as OrbPalette },
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
    <div className={cn(urduFont, "bg-paper text-black")}>
      <MarketingNav />

      {/* ============================ HERO ============================ */}
      <section>
        <Rail className="pb-16 pt-14 lg:pb-20 lg:pt-20">
          <div className="grid items-end gap-x-12 gap-y-6 lg:grid-cols-2">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className={H1}
              >
                Every restaurant call,
                <br />
                answered in Urdu
              </motion.h1>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
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
              transition={{ duration: 0.6, delay: 0.15 }}
              className="max-w-md text-base leading-relaxed text-black lg:justify-self-end"
            >
              Callen is an AI phone agent for Pakistani restaurants. It picks up on the first ring, takes delivery
              and takeaway orders in natural Urdu, and knows your menu and today&apos;s deals.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.2, 0.65, 0.3, 0.9] }}
            className="mt-12 lg:mt-14"
          >
            <VoiceStage />
          </motion.div>
        </Rail>
      </section>

      {/* ============================ RESTAURANT NAMES ============================ */}
      <section className="border-t border-hairline">
        <Rail className="py-12">
          <p className="mb-8 text-center text-[15px] text-ink-soft">
            Built for the restaurants Pakistan calls every day
          </p>
          <div className="grid grid-cols-3 items-center gap-y-6 md:grid-cols-6">
            {["Cheezious", "Domino's", "KFC", "Pizza Hut", "Howdy", "OPTP"].map((name) => (
              <div key={name} className="text-center text-lg tracking-tight text-black/45">
                {name}
              </div>
            ))}
          </div>
        </Rail>
      </section>

      {/* ============================ PRODUCT ============================ */}
      <Band id="product">
        <SectionHead
          label="Callen Agents"
          title="An agent that takes the order, not just the call"
          body="It listens, asks for what is missing, reads the order back and confirms the total, the way your best person on the phone would. At 2 pm or 2 am."
          cta={{ href: "/signup", label: "Build your agent" }}
        />

        <div className="grid gap-3 lg:grid-cols-2">
          {/* A sample call on a grain surface */}
          <motion.div {...fadeUp}>
            <GrainSurface palette="ocean" className="flex h-full min-h-[26rem] flex-col rounded-3xl p-6 text-white">
              <div className="my-auto space-y-2.5 py-6 text-[15px]">
                <p className="ml-auto w-fit max-w-[80%] rounded-2xl border border-white/40 px-4 py-2.5">
                  Aik zinger burger aur aik large pizza.
                </p>
                <p className="w-fit max-w-[80%] rounded-2xl bg-white px-4 py-2.5 text-black">
                  Ji bilkul. Pizza kaun sa pasand karein ge?
                </p>
                <p className="ml-auto w-fit max-w-[80%] rounded-2xl border border-white/40 px-4 py-2.5">
                  Chicken tikka.
                </p>
                <p className="w-fit max-w-[80%] rounded-2xl bg-white px-4 py-2.5 text-black">
                  Total teis sau rupay. Confirm kar doon?
                </p>
                <p className="flex w-fit items-center gap-2 rounded-full bg-white px-3.5 py-2 text-sm text-black">
                  <span className="flex size-5 items-center justify-center rounded-full bg-black text-white">
                    <Phone className="size-3" />
                  </span>
                  Order confirmed
                </p>
              </div>
              <div>
                <h3 className="text-[15px] text-white/75">Order taking</h3>
                <p className="mt-1.5 text-[15px] leading-relaxed">
                  Delivery and takeaway orders in everyday Urdu, with the address, the payment and the total read
                  back before it confirms.
                </p>
              </div>
            </GrainSurface>
          </motion.div>

          {/* The order ticket */}
          <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.06 }}>
            <InfoCard
              className="h-full min-h-[26rem]"
              title="A clean order, every time"
              body="Items, sizes, address and payment are captured the same way on every call, so the kitchen gets an order it can read."
            >
              <div className="my-auto w-full max-w-sm self-center rounded-2xl border border-hairline bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
                <div className="mb-4 flex items-center justify-between text-sm">
                  <span className="text-black">Order ticket</span>
                  <span className="text-ink-soft">Delivery</span>
                </div>
                <ul className="space-y-2.5 text-sm">
                  {TICKET.map((row) => (
                    <li key={row.item} className="flex justify-between gap-4 border-b border-dotted border-black/15 pb-2.5">
                      <span>{row.item}</span>
                      <span className="tabular-nums text-ink-soft">{row.price}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-sm text-ink-soft">Total</span>
                  <span className="text-xl font-light tabular-nums">PKR 2,300</span>
                </div>
                <p className="mt-3 text-[13px] text-ink-soft">DHA Phase 6 · Cash on delivery · 35 to 40 min</p>
              </div>
            </InfoCard>
          </motion.div>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {[
            { icon: Tag, title: "Deals", body: "Every caller hears today's deal, and the add-on that fits the order, once and politely." },
            { icon: MessageCircleQuestion, title: "Questions", body: "Timings, branches, delivery areas and charges, answered from your own restaurant info." },
            { icon: CalendarCheck, title: "Table bookings", body: "Takes the day, the time and the number of guests, and reads them back to the caller." },
          ].map((f, i) => (
            <motion.div key={f.title} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.05 }}>
              <InfoCard className="h-full" icon={<f.icon className="size-[18px]" strokeWidth={1.5} />} title={f.title} body={f.body} />
            </motion.div>
          ))}
        </div>
      </Band>

      {/* ============================ URDU VOICES ============================ */}
      <Band id="voices">
        <SectionHead
          label="Urdu voices"
          title="Sounds like your best order taker, not a robot"
          body="Everyday Pakistani Urdu, with words like pizza, deal and delivery said the natural way. Each voice uses the right grammar for a male or a female speaker."
        />

        <div className="grid gap-3 lg:grid-cols-[1.15fr_1fr]">
          <motion.div {...fadeUp}>
            <InfoCard
              className="h-full"
              title="Sixteen voices"
              body="Choose the voice that fits your brand and listen to it before you decide. Every voice has its own orb."
            >
              <div className="grid grid-cols-4 gap-x-3 gap-y-6 py-4">
                {VOICE_WALL.map((v) => (
                  <div key={v.name} className="flex flex-col items-center gap-2.5">
                    <Orb palette={v.palette} className="size-14 sm:size-[4.5rem]" />
                    <span className="text-sm text-black">{v.name}</span>
                  </div>
                ))}
              </div>
            </InfoCard>
          </motion.div>

          <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.06 }}>
            <InfoCard
              className="h-full"
              title="Said the way people say it"
              body="Prices in hundreds, sectors as they are spoken, and your own names taught once and said right on every call."
            >
              <ul className="py-2">
                {SAID_AS.map((row) => (
                  <li
                    key={row.written}
                    className="flex items-center justify-between gap-4 border-b border-dotted border-black/15 py-2 last:border-0"
                  >
                    <span className="rounded-lg border border-hairline bg-paper px-2.5 py-1 font-mono text-xs text-black">
                      {row.written}
                    </span>
                    <span className="text-right">
                      <span dir="rtl" lang="ur" className="block font-urdu text-base leading-[2.1] text-black">
                        {row.spoken}
                      </span>
                      <span className="block text-xs text-ink-soft">{row.roman}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </InfoCard>
          </motion.div>
        </div>
      </Band>

      {/* ============================ HOW IT WORKS ============================ */}
      <Band id="how">
        <SectionHead
          label="Agent Studio"
          title="Set up before the dinner rush"
          body="No engineer and no code. If you can fill in a menu, you can build your agent, and you can change it any time."
        />

        <div className="grid items-start gap-3 lg:grid-cols-[1fr_1.35fr]">
          <div className="rounded-3xl border border-hairline bg-shell px-6">
            {STEPS.map((s) => (
              <motion.div key={s.n} {...fadeUp} className="flex gap-5 border-b border-hairline py-6 last:border-0">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-hairline bg-paper text-sm">
                  {s.n}
                </span>
                <div>
                  <h3 className="text-[15px] text-black">{s.title}</h3>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-ink-soft">{s.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.08 }}>
            <AgentStudioMockup />
          </motion.div>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: BookOpen, title: "Your menu is the script", body: "Change a price in the dashboard and your agent has it within a minute." },
            { icon: Headphones, title: "Test before customers do", body: "Talk to your agent in the browser as often as you like before it goes on a real line." },
            { icon: Phone, title: "A local number", body: "Our team sets up a Pakistani number for your restaurant. Forward your existing line to it." },
            { icon: Store, title: "One agent per branch", body: "Each branch keeps its own timings, delivery areas and deals." },
          ].map((f, i) => (
            <motion.div key={f.title} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.05 }}>
              <InfoCard className="h-full" icon={<f.icon className="size-[18px]" strokeWidth={1.5} />} title={f.title} body={f.body} />
            </motion.div>
          ))}
        </div>

        <p className="mt-6 text-sm text-ink-soft">
          Coming next in the beta: each order sent to your team on WhatsApp, call recordings with transcripts, and a
          link to your POS.
        </p>
      </Band>

      {/* ============================ PRICING ============================ */}
      <Band id="pricing">
        <SectionHead
          label="Pricing"
          title="Costs less than one person on the phone"
          body="Call minutes are included in every plan and you pay in rupees. Try it free first, and pay only when it is taking real calls."
          cta={{ href: "/pricing", label: "See full pricing" }}
        />

        <div className="grid gap-3 md:grid-cols-3">
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
                    {plan.price} <span className={cn("text-sm", plan.palette ? "text-white/80" : "text-ink-soft")}>{plan.per}</span>
                  </p>
                  <p className={cn("mt-2.5 text-[15px] leading-relaxed", plan.palette ? "text-white/90" : "text-ink-soft")}>
                    {plan.line}
                  </p>
                </div>
              </div>
            );
            return (
              <motion.div key={plan.name} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.06 }}>
                {plan.palette ? (
                  <GrainSurface palette={plan.palette} className="rounded-3xl text-white">
                    {inner}
                  </GrainSurface>
                ) : (
                  <div className="rounded-3xl border border-hairline bg-shell">{inner}</div>
                )}
              </motion.div>
            );
          })}
        </div>
      </Band>

      {/* ============================ TESTIMONIALS ============================ */}
      <TestimonialsSection />

      {/* ============================ FAQ ============================ */}
      <Band id="faq">
        <div className="grid gap-x-12 gap-y-8 lg:grid-cols-[1fr_1.5fr]">
          <div>
            <p className="mb-4 text-sm text-ink-soft">Questions</p>
            <h2 className="text-3xl font-light leading-[1.12] tracking-[-0.02em] sm:text-4xl">
              What owners ask us first
            </h2>
          </div>
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
        </div>
      </Band>

      <ClosingBand />
      <MarketingFooter />
    </div>
  );
}
