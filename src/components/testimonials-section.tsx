"use client";

import { motion } from "motion/react";
import { TestimonialsColumn, type Testimonial } from "@/components/ui/testimonials-columns-1";

// Initials avatar rendered as an inline SVG data URI: zero external
// requests, works offline, and never breaks if a third-party service dies.
const avatar = (name: string) => {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><rect width="128" height="128" rx="64" fill="#171717"/><text x="64" y="64" dy=".36em" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="48" font-weight="700" fill="#fafafa">${initials}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

const testimonials: Testimonial[] = [
  {
    text: "We stopped missing calls after hours. Callen handles 60% of inbound orders end to end and routes the rest to my team with full context.",
    name: "Bilal Ahmed",
    role: "Operations Manager, Cheezious",
    image: avatar("Bilal Ahmed"),
  },
  {
    text: "The Urdu speech recognition is the part that actually works. Callers don't realise they're talking to an AI until I tell them.",
    name: "Saman Malik",
    role: "Head of CX, Daraz Pakistan",
    image: avatar("Saman Malik"),
  },
  {
    text: "Setup took an afternoon. By the next morning our reception line was answering in Urdu and English, twenty four hours a day.",
    name: "Omar Raza",
    role: "Operations Director, Domino's Pakistan",
    image: avatar("Omar Raza"),
  },
  {
    text: "Appointment volume tripled in three weeks. The agent catches double bookings before they happen and offers the next open slot.",
    name: "Zainab Hussain",
    role: "Clinic Manager, Hayat Medical",
    image: avatar("Zainab Hussain"),
  },
  {
    text: "Wait times dropped from four minutes to under ten seconds. CSAT moved from 71 to 89 in a single quarter.",
    name: "Farhan Siddiqui",
    role: "Support Lead, KFC Pakistan",
    image: avatar("Farhan Siddiqui"),
  },
  {
    text: "What sold me was the analytics. Every intent, every drop off, every escalation reason, all filterable in one view.",
    name: "Aliza Khan",
    role: "Product Lead, Telenor Microfinance",
    image: avatar("Aliza Khan"),
  },
  {
    text: "After hours leads used to die in voicemail. Now every call is answered, qualified, and pushed to our CRM with notes.",
    name: "Hassan Ali",
    role: "Sales Director, Imlaak Realty",
    image: avatar("Hassan Ali"),
  },
  {
    text: "I built our entire customer support workflow in Agent Studio without writing one line of code.",
    name: "Sana Sheikh",
    role: "COO, Pizza Hut Pakistan",
    image: avatar("Sana Sheikh"),
  },
  {
    text: "Compliance aware booking for our clinic. Callen handles consent prompts and routes urgent symptoms to on call instantly.",
    name: "Asma Tariq",
    role: "IT Director, Shifa Care",
    image: avatar("Asma Tariq"),
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, ease: [0.2, 0.65, 0.3, 0.9] as [number, number, number, number] },
};

export function TestimonialsSection() {
  return (
    <section className="py-24 lg:py-32 bg-white relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div {...fadeUp} className="flex flex-col items-center text-center max-w-2xl mx-auto mb-14">
          <span className="inline-block text-xs uppercase tracking-[0.2em] text-neutral-500 mb-4 font-medium">
            Customer stories
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-[-0.03em] leading-[1.05] mb-5">
            Teams that finally <span className="italic font-light">answer</span> every call.
          </h2>
          <p className="text-lg text-neutral-600 leading-relaxed">
            From Karachi delivery floors to Lahore clinics, here is what changed when Pakistani teams switched on Callen.
          </p>
        </motion.div>

        <div className="flex justify-center gap-6 [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)] max-h-[740px] overflow-hidden">
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={19} />
          <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={17} />
        </div>
      </div>
    </section>
  );
}
