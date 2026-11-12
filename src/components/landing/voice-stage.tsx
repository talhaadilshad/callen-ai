// The hero panel: how Callen "presents the model". Tabs pick the kind of
// call, the orbs are the agent's voices, and Play runs a sample call as
// live captions (Roman Urdu or Urdu script). The agent's own grammar
// follows the voice: a female voice says "rahi hoon", a male one "raha
// hoon", exactly as the real agent does.
//
// The restaurant ("Karachi Bites") is made up so no real brand is implied.

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Check, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { Orb, type OrbPalette } from "@/components/brand/orb";
import { cn } from "@/lib/utils";

type Voice = { name: string; ur: string; female: boolean; palette: OrbPalette };

const VOICES: Voice[] = [
  { name: "Ayesha", ur: "عائشہ", female: true, palette: "ember" },
  { name: "Ahmed", ur: "احمد", female: false, palette: "ocean" },
  { name: "Hira", ur: "حرا", female: true, palette: "lilac" },
  { name: "Bilal", ur: "بلال", female: false, palette: "moss" },
  { name: "Sana", ur: "ثنا", female: true, palette: "rose" },
  { name: "Usman", ur: "عثمان", female: false, palette: "dusk" },
];

type Turn = { agent: boolean; roman: string; ur: string };

type CallKind = {
  id: string;
  label: string;
  dot: OrbPalette;
  blurb: string;
  outcome: string;
  turns: (v: Voice) => Turn[];
};

const CALLS: CallKind[] = [
  {
    id: "orders",
    label: "Orders",
    dot: "ember",
    blurb: "Delivery and takeaway orders, read back before they are confirmed.",
    outcome: "Order taken · PKR 2,300 · DHA Phase 6",
    turns: (v) => [
      {
        agent: true,
        roman: `Assalam o alaikum, Karachi Bites! Main ${v.name} baat kar ${v.female ? "rahi" : "raha"} hoon. Ji farmaiye?`,
        ur: `السلام علیکم، کراچی بائٹس! میں ${v.ur} بات کر ${v.female ? "رہی" : "رہا"} ہوں۔ جی فرمائیے؟`,
      },
      {
        agent: false,
        roman: "Aik large chicken tikka pizza aur aik zinger burger. Delivery DHA Phase 6.",
        ur: "ایک لارج چکن تکہ پیزا اور ایک زنگر برگر۔ ڈیلیوری ڈی ایچ اے فیز چھ۔",
      },
      {
        agent: true,
        roman: "Ji bilkul. Aik large chicken tikka pizza, aik zinger burger. Total teis sau rupay, cash on delivery. Confirm kar doon?",
        ur: "جی بالکل۔ ایک لارج چکن تکہ پیزا، ایک زنگر برگر۔ ٹوٹل تئیس سو روپے، کیش آن ڈیلیوری۔ کنفرم کر دوں؟",
      },
      { agent: false, roman: "Ji, kar dein.", ur: "جی، کر دیں۔" },
      {
        agent: true,
        roman: "Order confirm ho gaya. Paintees se chaalees minute mein pohanch jaye ga. Shukriya!",
        ur: "آرڈر کنفرم ہو گیا۔ پینتیس سے چالیس منٹ میں پہنچ جائے گا۔ شکریہ!",
      },
    ],
  },
  {
    id: "deals",
    label: "Deals",
    dot: "ocean",
    blurb: "Every caller hears today's deal, and the right add-on, once.",
    outcome: "Deal applied · PKR 1,999",
    turns: (v) => [
      { agent: false, roman: "Aaj koi deal chal rahi hai?", ur: "آج کوئی ڈیل چل رہی ہے؟" },
      {
        agent: true,
        roman: "Ji bilkul. Aaj family deal hai: do medium pizza aur dairh litre drink, sirf unnees sau ninanway rupay mein.",
        ur: "جی بالکل۔ آج فیملی ڈیل ہے: دو میڈیم پیزا اور ڈیڑھ لیٹر ڈرنک، صرف انیس سو ننانوے روپے میں۔",
      },
      { agent: false, roman: "Theek hai, yehi kar dein.", ur: "ٹھیک ہے، یہی کر دیں۔" },
      {
        agent: true,
        roman: `Main ne note kar liya. Saath garlic bread sirf do sau rupay mein shamil kar ${v.female ? "deti" : "deta"} hoon?`,
        ur: `میں نے نوٹ کر لیا۔ ساتھ گارلک بریڈ صرف دو سو روپے میں شامل کر ${v.female ? "دیتی" : "دیتا"} ہوں؟`,
      },
    ],
  },
  {
    id: "questions",
    label: "Questions",
    dot: "dusk",
    blurb: "Timings, delivery areas and table bookings, answered from your own info.",
    outcome: "Answered from your restaurant info",
    turns: (v) => [
      {
        agent: false,
        roman: "Aap G-11 mein delivery karte hain? Aur kab tak khule hain?",
        ur: "آپ جی الیون میں ڈیلیوری کرتے ہیں؟ اور کب تک کھلے ہیں؟",
      },
      {
        agent: true,
        roman: "Ji, G-11 mein delivery hoti hai, charges aik sau rupay hain. Hum raat do bajay tak khule hain.",
        ur: "جی، جی الیون میں ڈیلیوری ہوتی ہے، چارجز ایک سو روپے ہیں۔ ہم رات دو بجے تک کھلے ہیں۔",
      },
      {
        agent: false,
        roman: "Haftay ki raat aath bajay chhe logon ki table mil jaye gi?",
        ur: "ہفتے کی رات آٹھ بجے چھ لوگوں کی ٹیبل مل جائے گی؟",
      },
      {
        agent: true,
        roman: `Ji, hafta raat aath bajay, chhe afraad. Main abhi book kar ${v.female ? "deti" : "deta"} hoon. Kis naam se?`,
        ur: `جی، ہفتہ رات آٹھ بجے، چھ افراد۔ میں ابھی بُک کر ${v.female ? "دیتی" : "دیتا"} ہوں۔ کس نام سے؟`,
      },
    ],
  },
];

const TURN_MS = 3000;

export function VoiceStage() {
  const [callId, setCallId] = useState(CALLS[0].id);
  const [voiceIdx, setVoiceIdx] = useState(0);
  const [urdu, setUrdu] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [step, setStep] = useState(0);

  const call = CALLS.find((c) => c.id === callId) ?? CALLS[0];
  const voice = VOICES[voiceIdx];
  const turns = call.turns(voice);
  const finished = step >= turns.length;
  const turn = turns[Math.min(step, turns.length - 1)];

  useEffect(() => {
    if (!playing) return;
    if (step >= turns.length) {
      const t = setTimeout(() => setPlaying(false), 400);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStep((s) => s + 1), TURN_MS);
    return () => clearTimeout(t);
  }, [playing, step, turns.length]);

  const restart = (keepPlaying: boolean) => {
    setStep(0);
    setPlaying(keepPlaying);
  };
  const pickCall = (id: string) => {
    setCallId(id);
    restart(playing);
  };
  const pickVoice = (i: number) => {
    setVoiceIdx((i + VOICES.length) % VOICES.length);
    restart(playing);
  };
  const toggle = () => {
    if (finished) return restart(true);
    setPlaying((p) => !p);
  };

  const prev = VOICES[(voiceIdx - 1 + VOICES.length) % VOICES.length];
  const next = VOICES[(voiceIdx + 1) % VOICES.length];
  const agentSpeaking = playing && !finished && turn.agent;

  return (
    <div className="rounded-[1.75rem] border border-hairline bg-shell p-1.5">
      {/* Kind of call */}
      <div role="tablist" aria-label="Kind of call" className="grid grid-cols-3 gap-1">
        {CALLS.map((c) => {
          const on = c.id === call.id;
          return (
            <button
              key={c.id}
              role="tab"
              type="button"
              aria-selected={on}
              onClick={() => pickCall(c.id)}
              className={cn(
                "flex items-center justify-center gap-2 rounded-[1.1rem] px-3 py-3 text-sm transition-all",
                on ? "bg-white text-black shadow-[0_1px_3px_rgba(0,0,0,0.08)]" : "text-ink-soft hover:text-black"
              )}
            >
              <Orb palette={c.dot} className="size-3" />
              {c.label}
            </button>
          );
        })}
      </div>

      <div className="px-4 pb-6 pt-10 sm:px-8 sm:pt-14">
        {/* Voices */}
        <div className="flex items-center justify-center gap-6 sm:gap-14 lg:gap-24">
          <button
            type="button"
            onClick={() => pickVoice(voiceIdx - 1)}
            aria-label={`Switch to ${prev.name}`}
            className="hidden opacity-80 transition hover:opacity-100 sm:block"
          >
            <Orb palette={prev.palette} className="size-32 lg:size-40" />
          </button>

          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? "Pause the sample call" : "Play a sample call"}
            className="group relative"
          >
            <Orb palette={voice.palette} active={agentSpeaking} className="size-48 sm:size-52 lg:size-56" />
            <span className="absolute left-1/2 top-1/2 flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-black shadow-lg transition-transform group-hover:scale-105">
              {playing ? <Pause className="size-4 fill-current" /> : <Play className="ml-0.5 size-4 fill-current" />}
            </span>
          </button>

          <button
            type="button"
            onClick={() => pickVoice(voiceIdx + 1)}
            aria-label={`Switch to ${next.name}`}
            className="hidden opacity-80 transition hover:opacity-100 sm:block"
          >
            <Orb palette={next.palette} className="size-32 lg:size-40" />
          </button>
        </div>

        {/* Voice name */}
        <div className="mt-8 flex items-center justify-center gap-5">
          <button
            type="button"
            onClick={() => pickVoice(voiceIdx - 1)}
            aria-label="Previous voice"
            className="flex size-8 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-white hover:text-black"
          >
            <ChevronLeft className="size-4" />
          </button>
          <div className="w-44 text-center">
            <p className="text-base text-black">{voice.name}</p>
            <p className="text-sm text-ink-soft">{voice.female ? "Female" : "Male"} Urdu voice</p>
          </div>
          <button
            type="button"
            onClick={() => pickVoice(voiceIdx + 1)}
            aria-label="Next voice"
            className="flex size-8 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-white hover:text-black"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        {/* Live captions */}
        <div className="mx-auto mt-7 flex min-h-[7.5rem] max-w-xl flex-col items-center justify-center text-center">
          <AnimatePresence mode="wait" initial={false}>
            {finished ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-black shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
              >
                <span className="flex size-4 items-center justify-center rounded-full bg-black text-white">
                  <Check className="size-2.5" strokeWidth={3} />
                </span>
                {call.outcome}
              </motion.div>
            ) : (
              <motion.div
                key={`${call.id}-${voiceIdx}-${step}-${urdu}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <p className="mb-1.5 text-xs text-ink-soft">{turn.agent ? voice.name : "Caller"}</p>
                {urdu ? (
                  <p dir="rtl" lang="ur" className="font-urdu text-lg leading-[2.2] text-black">
                    {turn.ur}
                  </p>
                ) : (
                  <p className="text-[17px] leading-relaxed text-black">{turn.roman}</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Progress */}
        <div className="mt-4 flex items-center justify-center gap-1.5" aria-hidden>
          {turns.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-0.5 w-6 rounded-full transition-colors duration-300",
                i < step || (i === step && playing) ? "bg-black" : "bg-black/15"
              )}
            />
          ))}
        </div>

        {/* Footer row */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-hairline pt-5 sm:flex-row">
          <p className="max-w-sm text-center text-sm text-ink-soft sm:text-left">{call.blurb}</p>
          <div className="flex shrink-0 items-center gap-2">
            <div role="group" aria-label="Caption script" className="flex rounded-full bg-shell-deep p-0.5 text-sm">
              <button
                type="button"
                aria-pressed={!urdu}
                onClick={() => setUrdu(false)}
                className={cn("rounded-full px-3 py-1.5 transition-colors", !urdu ? "bg-white text-black shadow-sm" : "text-ink-soft")}
              >
                Roman
              </button>
              <button
                type="button"
                aria-pressed={urdu}
                onClick={() => setUrdu(true)}
                className={cn(
                  "rounded-full px-3 pb-2 pt-0 font-urdu text-[13px] leading-[2] transition-colors",
                  urdu ? "bg-white text-black shadow-sm" : "text-ink-soft"
                )}
              >
                اردو
              </button>
            </div>
            <Link
              href="/signup"
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-black px-4 text-sm text-white transition-colors hover:bg-neutral-800"
            >
              Build yours <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
