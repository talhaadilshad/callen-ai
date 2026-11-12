// The hero panel: how Callen presents the product. Tabs pick the kind of
// call, the orbs are the agent's voices, and the sample call plays as live
// captions (Roman Urdu or Urdu script). It starts by itself when it scrolls
// into view and moves on to the next kind of call, until the visitor takes
// over. The agent's grammar follows the voice: a female voice says "rahi
// hoon", a male one "raha hoon", exactly as the real agent does.
//
// The restaurant ("Karachi Bites") is made up so no real brand is implied.

"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "motion/react";
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
    blurb: "Delivery and takeaway orders, read back to the caller before they are confirmed.",
    outcome: "Order taken · PKR 2,300 · DHA Phase 6",
    turns: (v) => [
      {
        agent: true,
        roman: `Assalam-o-Alaikum, Karachi Bites! Main ${v.name} baat kar ${v.female ? "rahi" : "raha"} hoon. Ji, farmaiye?`,
        ur: `السلام علیکم، کراچی بائٹس! میں ${v.ur} بات کر ${v.female ? "رہی" : "رہا"} ہوں۔ جی، فرمائیے؟`,
      },
      {
        agent: false,
        roman: "Ek large chicken tikka pizza aur ek zinger burger. Delivery DHA Phase 6 mein.",
        ur: "ایک لارج چکن تکہ پیزا اور ایک زنگر برگر۔ ڈیلیوری ڈی ایچ اے فیز چھ میں۔",
      },
      {
        agent: true,
        roman: "Ji bilkul. Ek large chicken tikka pizza aur ek zinger burger. Total 2,300 rupay, cash on delivery. Confirm kar doon?",
        ur: "جی بالکل۔ ایک لارج چکن تکہ پیزا اور ایک زنگر برگر۔ ٹوٹل تئیس سو روپے، کیش آن ڈیلیوری۔ کنفرم کر دوں؟",
      },
      { agent: false, roman: "Ji, kar dein.", ur: "جی، کر دیں۔" },
      {
        agent: true,
        roman: "Order confirm ho gaya. 35 se 40 minute mein pohanch jaye ga. Shukriya!",
        ur: "آرڈر کنفرم ہو گیا۔ پینتیس سے چالیس منٹ میں پہنچ جائے گا۔ شکریہ!",
      },
    ],
  },
  {
    id: "deals",
    label: "Deals",
    dot: "ocean",
    blurb: "Every caller hears today's deal, and the add-on that fits the order.",
    outcome: "Deal applied · PKR 1,999",
    turns: () => [
      { agent: false, roman: "Aaj koi deal chal rahi hai?", ur: "آج کوئی ڈیل چل رہی ہے؟" },
      {
        agent: true,
        roman: "Ji bilkul. Aaj Family Deal hai: 2 medium pizza aur 1.5 litre drink, sirf 1,999 rupay mein.",
        ur: "جی بالکل۔ آج فیملی ڈیل ہے: دو میڈیم پیزا اور ڈیڑھ لیٹر ڈرنک، صرف انیس سو ننانوے روپے میں۔",
      },
      { agent: false, roman: "Theek hai, yehi kar dein.", ur: "ٹھیک ہے، یہی کر دیں۔" },
      {
        agent: true,
        roman: "Ji, note kar liya. Saath garlic bread sirf 200 rupay mein shamil kar doon?",
        ur: "جی، نوٹ کر لیا۔ ساتھ گارلک بریڈ صرف دو سو روپے میں شامل کر دوں؟",
      },
    ],
  },
  {
    id: "questions",
    label: "Questions",
    dot: "lilac",
    blurb: "Timings, delivery areas and table bookings, answered from your own restaurant info.",
    outcome: "Answered from your restaurant info",
    turns: (v) => [
      {
        agent: false,
        roman: "Kya aap G-11 mein delivery karte hain? Aur kab tak khule hain?",
        ur: "کیا آپ جی الیون میں ڈیلیوری کرتے ہیں؟ اور کب تک کھلے ہیں؟",
      },
      {
        agent: true,
        roman: "Ji, G-11 mein delivery hoti hai, charges 100 rupay hain. Hum raat 2 baje tak khule hain.",
        ur: "جی، جی الیون میں ڈیلیوری ہوتی ہے، چارجز ایک سو روپے ہیں۔ ہم رات دو بجے تک کھلے ہیں۔",
      },
      {
        agent: false,
        roman: "Hafte ki raat 8 baje 6 logon ki table mil jaye gi?",
        ur: "ہفتے کی رات آٹھ بجے چھ لوگوں کی ٹیبل مل جائے گی؟",
      },
      {
        agent: true,
        roman: `Ji, Hafta, raat 8 baje, 6 afraad. Main abhi book kar ${v.female ? "deti" : "deta"} hoon. Kis naam se?`,
        ur: `جی، ہفتہ، رات آٹھ بجے، چھ افراد۔ میں ابھی بُک کر ${v.female ? "دیتی" : "دیتا"} ہوں۔ کس نام سے؟`,
      },
    ],
  },
];

const TURN_MS = 3200;
const EASE = [0.2, 0.65, 0.3, 0.9] as [number, number, number, number];

const slide = {
  enter: (d: number) => ({ opacity: 0, x: d * 70, scale: 0.82 }),
  center: { opacity: 1, x: 0, scale: 1 },
  exit: (d: number) => ({ opacity: 0, x: d * -70, scale: 0.82 }),
};

export function VoiceStage() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });

  const [callIdx, setCallIdx] = useState(0);
  const [voiceIdx, setVoiceIdx] = useState(0);
  const [dir, setDir] = useState(1);
  const [urdu, setUrdu] = useState(false);
  const [playing, setPlaying] = useState(false);
  // "auto" = the demo is driving itself; any click on play/pause ends that.
  const [auto, setAuto] = useState(true);
  const [step, setStep] = useState(0);

  const call = CALLS[callIdx];
  const voice = VOICES[voiceIdx];
  const turns = call.turns(voice);
  const finished = step >= turns.length;
  const turn = turns[Math.min(step, turns.length - 1)];

  // Start once, when the panel first comes into view.
  useEffect(() => {
    if (!inView) return;
    const t = setTimeout(() => setPlaying(true), 900);
    return () => clearTimeout(t);
  }, [inView]);

  useEffect(() => {
    if (!playing) return;
    if (step < turns.length) {
      const t = setTimeout(() => setStep((s) => s + 1), TURN_MS);
      return () => clearTimeout(t);
    }
    // Call finished: in auto mode move on to the next kind of call.
    const t = setTimeout(() => {
      if (auto) {
        setCallIdx((i) => (i + 1) % CALLS.length);
        setStep(0);
      } else {
        setPlaying(false);
      }
    }, auto ? 3400 : 400);
    return () => clearTimeout(t);
  }, [playing, step, turns.length, auto]);

  const pickCall = (i: number) => {
    setCallIdx(i);
    setStep(0);
  };
  const pickVoice = (i: number, d: number) => {
    setDir(d);
    setVoiceIdx((i + VOICES.length) % VOICES.length);
    setStep(0);
  };
  const toggle = () => {
    setAuto(false);
    if (finished) {
      setStep(0);
      setPlaying(true);
      return;
    }
    setPlaying((p) => !p);
  };

  const prev = VOICES[(voiceIdx - 1 + VOICES.length) % VOICES.length];
  const next = VOICES[(voiceIdx + 1) % VOICES.length];
  const live = playing && !finished;
  const agentSpeaking = live && turn.agent;

  return (
    <div ref={ref} className="rounded-[1.75rem] border border-hairline bg-shell p-1.5">
      {/* Kind of call */}
      <div role="tablist" aria-label="Kind of call" className="relative grid grid-cols-3 gap-1">
        {CALLS.map((c, i) => {
          const on = i === callIdx;
          return (
            <button
              key={c.id}
              role="tab"
              type="button"
              aria-selected={on}
              onClick={() => pickCall(i)}
              className={cn(
                "relative flex items-center justify-center gap-2 rounded-[1.1rem] px-3 py-3 text-[15px] transition-colors",
                on ? "text-black" : "text-ink-soft hover:text-black"
              )}
            >
              {on && (
                <motion.span
                  layoutId="voice-stage-tab"
                  className="absolute inset-0 rounded-[1.1rem] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                  transition={{ type: "spring", stiffness: 380, damping: 34 }}
                />
              )}
              <Orb palette={c.dot} className="relative size-3.5" />
              <span className="relative">{c.label}</span>
            </button>
          );
        })}
      </div>

      <div className="px-4 pb-6 pt-10 sm:px-8 sm:pt-14">
        {/* Voices */}
        <div className="flex items-center justify-center gap-6 sm:gap-14 lg:gap-24">
          <button
            type="button"
            onClick={() => pickVoice(voiceIdx - 1, -1)}
            aria-label={`Switch to ${prev.name}`}
            className="hidden transition-transform duration-300 hover:scale-105 sm:block"
          >
            <AnimatePresence mode="popLayout" custom={dir} initial={false}>
              <motion.div
                key={prev.name}
                custom={dir}
                variants={slide}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.45, ease: EASE }}
              >
                <Orb palette={prev.palette} className="size-32 lg:size-40" />
              </motion.div>
            </AnimatePresence>
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={toggle}
              aria-label={playing ? "Pause the sample call" : "Play a sample call"}
              className="group relative block"
            >
              <AnimatePresence mode="popLayout" custom={dir} initial={false}>
                <motion.div
                  key={voice.name}
                  custom={dir}
                  variants={slide}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.45, ease: EASE }}
                >
                  <Orb
                    palette={voice.palette}
                    active={agentSpeaking}
                    className="size-48 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.35)] sm:size-52 lg:size-60"
                  />
                </motion.div>
              </AnimatePresence>
              <span className="absolute left-1/2 top-1/2 flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-black shadow-lg transition-transform duration-200 group-hover:scale-110">
                {playing ? <Pause className="size-4 fill-current" /> : <Play className="ml-0.5 size-4 fill-current" />}
              </span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => pickVoice(voiceIdx + 1, 1)}
            aria-label={`Switch to ${next.name}`}
            className="hidden transition-transform duration-300 hover:scale-105 sm:block"
          >
            <AnimatePresence mode="popLayout" custom={dir} initial={false}>
              <motion.div
                key={next.name}
                custom={dir}
                variants={slide}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.45, ease: EASE }}
              >
                <Orb palette={next.palette} className="size-32 lg:size-40" />
              </motion.div>
            </AnimatePresence>
          </button>
        </div>

        {/* Voice name */}
        <div className="mt-9 flex items-center justify-center gap-5">
          <button
            type="button"
            onClick={() => pickVoice(voiceIdx - 1, -1)}
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
            onClick={() => pickVoice(voiceIdx + 1, 1)}
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
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[15px] text-black shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
              >
                <span className="flex size-4 items-center justify-center rounded-full bg-black text-white">
                  <Check className="size-2.5" strokeWidth={3} />
                </span>
                {call.outcome}
              </motion.div>
            ) : (
              <motion.div
                key={`${call.id}-${voiceIdx}-${step}-${urdu}`}
                initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(4px)" }}
                transition={{ duration: 0.3 }}
              >
                <p className="mb-1.5 flex items-center justify-center gap-2 text-[13px] text-ink-soft">
                  {live && <span className="size-1.5 animate-pulse rounded-full bg-black" />}
                  {turn.agent ? voice.name : "Caller"}
                </p>
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

        {/* Progress: one bar per line of the call */}
        <div className="mt-4 flex items-center justify-center gap-1.5" aria-hidden>
          {turns.map((_, i) => (
            <span key={i} className="relative h-0.5 w-7 overflow-hidden rounded-full bg-black/12">
              {i < step && <span className="absolute inset-0 bg-black" />}
              {i === step && live && (
                <motion.span
                  key={`${callIdx}-${voiceIdx}-${step}`}
                  className="absolute inset-0 origin-left bg-black"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: TURN_MS / 1000, ease: "linear" }}
                />
              )}
            </span>
          ))}
        </div>

        {/* Footer row */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-hairline pt-5 sm:flex-row">
          <p className="max-w-sm text-center text-[15px] leading-relaxed text-ink-soft sm:text-left">{call.blurb}</p>
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
