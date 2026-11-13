// /about — the company story, mission, and who's behind it.

import Link from "next/link";
import { Heart, MapPin, Phone, Calendar, ArrowRight } from "lucide-react";
import {
  MarketingShell,
  MarketingHero,
  MarketingSection,
} from "@/components/marketing/marketing-shell";

export const metadata = {
  title: "About",
  description:
    "Callen.ai is Pakistan's first voice AI platform purpose-built for Urdu and English. Made in Islamabad. Built for Pakistani SMBs.",
};

const VALUES = [
  {
    title: "Pakistan first",
    body:
      "We didn't translate a US product into Urdu. We built Callen for Pakistani call patterns: code-switching between Urdu and English mid-sentence, addresses written as 'House 42 Street 9 Phase 6', the cultural expectation that every call starts with 'assalam-o-alaikum'.",
  },
  {
    title: "Honest defaults",
    body:
      "We default to declining cookies, hiding analytics, and keeping data in-country. Vendors who hide the worst defaults erode trust over time. We'd rather show you the controls and let you choose.",
  },
  {
    title: "Ship and iterate",
    body:
      "We publish a changelog. We post post-mortems on every incident. We answer support tickets on WhatsApp because that's where Pakistani SMBs are. We move fast and admit when we're wrong.",
  },
  {
    title: "Respect the caller",
    body:
      "Our agents are structured, polite, and never push twice. The locked voice convention (greet, confirm each item, suggest one deal, restate, close) is baked into every system prompt we ship.",
  },
];

const FACTS = [
  { label: "Founded", value: "2025" },
  { label: "Headquarters", value: "Islamabad" },
  { label: "Team", value: "Small + remote-friendly" },
  { label: "Customers", value: "Pakistani SMBs" },
];

export default function AboutPage() {
  return (
    <MarketingShell>
      <MarketingHero orb="ember"
        eyebrow="About"
        title={
          <>
            Voice AI built in{" "}
            <span>Pakistan,</span> for Pakistan.
          </>
        }
        lede="We started Callen.ai because the SaaS that international voice-AI startups ship can't handle the way Pakistani callers actually speak. We're fixing that."
      />

      <MarketingSection>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {FACTS.map((f) => (
            <div key={f.label} className="rounded-2xl border border-hairline p-5">
              <p className="text-xs  text-ink-soft font-normal mb-1.5">
                {f.label}
              </p>
              <p className="text-lg font-normal tracking-tight">{f.value}</p>
            </div>
          ))}
        </div>
      </MarketingSection>

      <MarketingSection
        eyebrow="Story"
        title={
          <>
            Built from{" "}
            <span>three observations.</span>
          </>
        }
      >
        <div className="space-y-6 text-[15px] text-black leading-relaxed max-w-3xl">
          <p>
            <strong className="font-normal text-neutral-950">One.</strong>{" "}
            Pakistani SMBs lose customers every night because nobody is
            answering the phone after 9 PM. The restaurants do, the clinics
            don&apos;t, the real estate agents are reading WhatsApp messages
            instead of taking calls. Voicemail doesn&apos;t cut it.
          </p>
          <p>
            <strong className="font-normal text-neutral-950">Two.</strong>{" "}
            International voice AI is good at English. It&apos;s mediocre at
            Urdu. It&apos;s confused when callers code-switch mid-sentence,
            which is how Pakistanis actually speak on the phone. The
            architectures that work for monolingual American customer-support
            calls do not gracefully extend.
          </p>
          <p>
            <strong className="font-normal text-neutral-950">Three.</strong>{" "}
            The right cascaded pipeline (Whisper, Gemini or GPT, ElevenLabs)
            paired with Pakistani-trained prompts and a small set of
            Pakistani-flavoured voices can sound indistinguishable from a
            human call-centre operator. We&apos;ve built it. It works.
          </p>
          <p>
            Callen.ai is the platform we wanted to exist as customers of our
            own businesses. We&apos;re shipping it publicly so other Pakistani
            SMBs can stop missing calls.
          </p>
        </div>
      </MarketingSection>

      <MarketingSection
        eyebrow="What we believe"
        title={<>The values <span>we ship by.</span></>}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {VALUES.map((v) => (
            <div key={v.title} className="rounded-3xl border border-hairline p-7">
              <h3 className="text-lg font-normal tracking-tight mb-3">{v.title}</h3>
              <p className="text-[14.5px] text-ink-soft leading-relaxed">{v.body}</p>
            </div>
          ))}
        </div>
      </MarketingSection>

      <MarketingSection>
        <div className="rounded-3xl bg-neutral-950 text-white p-10 lg:p-14">
          <Heart className="size-7 mb-5 text-white/70" />
          <h2 className="text-3xl md:text-4xl font-normal tracking-tight mb-3 max-w-xl">
            Want to know more?
          </h2>
          <p className="text-white/70 leading-relaxed mb-7 max-w-xl">
            We&apos;re happy to take a call from any Pakistani business or
            investor curious about the product, the architecture, or the team
            behind it.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[
              { icon: MapPin, label: "Office", value: "Islamabad, Pakistan" },
              { icon: Phone,  label: "Sales",  value: "+92 51 111 22255" },
              { icon: Calendar, label: "Demo", value: "Book a 20 minute call" },
            ].map((c) => (
              <div key={c.label} className="border-t border-white/10 pt-4">
                <c.icon className="size-4 text-white/60 mb-2" />
                <p className="text-[10px]  text-white/50 mb-0.5 font-normal">
                  {c.label}
                </p>
                <p className="text-sm font-medium">{c.value}</p>
              </div>
            ))}
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white text-neutral-950 text-sm font-normal hover:bg-white/90 transition-colors"
          >
            Get in touch <ArrowRight className="size-4" />
          </Link>
        </div>
      </MarketingSection>
    </MarketingShell>
  );
}
