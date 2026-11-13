// The hero panel: hear the agent. Tabs pick the kind of call, the orbs are
// the agent's voices, and Play plays that call out loud, line by line: the
// agent in its own voice and the caller in a contrasting one. While the
// agent speaks, its orb moves; while the caller speaks, it rests.
//
// The audio comes from /api/demo-audio (Soniox, the same voices the real
// agents use). If a line cannot be played (no credit, offline), the panel
// falls back to showing the call as captions on a timer, so it never just
// sits there silent. Captions can also be turned on by hand (CC).
//
// One <audio> element is reused for every line and is first started inside
// the click handler, which is what lets Safari and phones keep playing the
// following lines without another tap.

"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Captions, Check, ChevronLeft, ChevronRight, Loader2, Pause, Play } from "lucide-react";
import { Orb } from "@/components/brand/orb";
import { DEMO_CALLS, DEMO_VOICES, demoAudioUrl } from "@/lib/demo-calls";
import { cn } from "@/lib/utils";

const FALLBACK_TURN_MS = 3200;
const EASE = [0.2, 0.65, 0.3, 0.9] as [number, number, number, number];

const slide = {
  enter: (d: number) => ({ opacity: 0, x: d * 70, scale: 0.82 }),
  center: { opacity: 1, x: 0, scale: 1 },
  exit: (d: number) => ({ opacity: 0, x: d * -70, scale: 0.82 }),
};

const INVITE: Record<string, string> = {
  orders: "take an order",
  deals: "offer today's deal",
  questions: "answer a caller's questions",
};

// Bar heights for the little level meter (fractions of full height).
const METER = [0.35, 0.7, 0.5, 0.95, 0.6, 0.4, 0.85, 0.55, 1, 0.65, 0.45, 0.8, 0.5, 0.9, 0.6, 0.35, 0.75, 0.5];

type Status = "idle" | "loading" | "playing" | "paused" | "done";

export function VoiceStage() {
  const [callIdx, setCallIdx] = useState(0);
  const [voiceIdx, setVoiceIdx] = useState(0);
  const [dir, setDir] = useState(1);
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<Status>("idle");
  // false once a line has failed to play: from then on, captions on a timer
  const [audioOk, setAudioOk] = useState(true);
  const [captions, setCaptions] = useState(false);
  const [urdu, setUrdu] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Bumped whenever playback is redirected, so stale audio events are ignored.
  const token = useRef(0);

  const call = DEMO_CALLS[callIdx];
  const voice = DEMO_VOICES[voiceIdx];
  const turns = call.turns(voice);
  const turn = turns[Math.min(step, turns.length - 1)];
  const active = status === "playing" || status === "loading";

  // Play one line; when it ends, play the next, until the call is over.
  const playLine = (c: number, v: number, s: number) => {
    const audio = (audioRef.current ??= new Audio());
    const mine = ++token.current;
    const lines = DEMO_CALLS[c].turns(DEMO_VOICES[v]);

    setCallIdx(c);
    setVoiceIdx(v);
    setStep(s);
    if (s >= lines.length) {
      audio.pause();
      setStatus("done");
      return;
    }
    setStatus("loading");

    const fail = (err?: unknown) => {
      if (mine !== token.current) return;
      if (err instanceof DOMException && err.name === "AbortError") return;
      // No audio available: carry on as captions (the effect below drives it).
      setAudioOk(false);
      setCaptions(true);
      setStatus("playing");
    };
    audio.onplaying = () => mine === token.current && setStatus("playing");
    audio.onwaiting = () => mine === token.current && setStatus("loading");
    audio.onended = () => mine === token.current && playLine(c, v, s + 1);
    audio.onerror = () => fail();
    audio.src = demoAudioUrl(DEMO_CALLS[c], DEMO_VOICES[v], s);
    audio.play().catch(fail);

    // warm the next line so there is no gap between speakers
    if (s + 1 < lines.length) fetch(demoAudioUrl(DEMO_CALLS[c], DEMO_VOICES[v], s + 1)).catch(() => {});
  };

  // Captions-only fallback: step through the call on a timer.
  useEffect(() => {
    if (audioOk || status !== "playing") return;
    const t = setTimeout(() => {
      if (step + 1 >= turns.length) {
        setStep(turns.length);
        setStatus("done");
      } else {
        setStep(step + 1);
      }
    }, FALLBACK_TURN_MS);
    return () => clearTimeout(t);
  }, [audioOk, status, step, turns.length]);

  // Stop the sound if the visitor leaves the page.
  useEffect(() => {
    return () => {
      // Deliberately the live values: whatever is playing when the page goes.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      token.current++;
      audioRef.current?.pause();
    };
  }, []);

  const start = (c: number, v: number, s: number) => {
    if (audioOk) return playLine(c, v, s);
    token.current++;
    setCallIdx(c);
    setVoiceIdx(v);
    setStep(s);
    setStatus("playing");
  };

  const toggle = () => {
    if (status === "idle" || status === "done") return start(callIdx, voiceIdx, 0);
    if (status === "paused") {
      if (!audioOk) return setStatus("playing");
      setStatus("loading");
      audioRef.current?.play().catch(() => setStatus("paused"));
      return;
    }
    // playing or loading -> pause
    audioRef.current?.pause();
    setStatus("paused");
  };

  // Changing the call or the voice restarts from the first line, and keeps
  // playing if it was playing.
  const change = (c: number, v: number) => {
    if (active) return start(c, v, 0);
    token.current++;
    audioRef.current?.pause();
    setCallIdx(c);
    setVoiceIdx(v);
    setStep(0);
    setStatus("idle");
  };
  const pickVoice = (i: number, d: number) => {
    setDir(d);
    change(callIdx, (i + DEMO_VOICES.length) % DEMO_VOICES.length);
  };

  const prev = DEMO_VOICES[(voiceIdx - 1 + DEMO_VOICES.length) % DEMO_VOICES.length];
  const next = DEMO_VOICES[(voiceIdx + 1) % DEMO_VOICES.length];
  const sounding = status === "playing";
  const agentSpeaking = sounding && turn.agent;

  const statusLine =
    status === "idle"
      ? `Press play to hear ${voice.name} ${INVITE[call.id]}`
      : status === "loading"
        ? "Connecting"
        : status === "paused"
          ? "Paused"
          : turn.agent
            ? `${voice.name} is speaking`
            : "The caller is speaking";

  return (
    <div className="rounded-[1.75rem] border border-hairline bg-shell p-1.5">
      {/* Kind of call */}
      <div role="tablist" aria-label="Kind of call" className="relative grid grid-cols-3 gap-1">
        {DEMO_CALLS.map((c, i) => {
          const on = i === callIdx;
          return (
            <button
              key={c.id}
              role="tab"
              type="button"
              aria-selected={on}
              onClick={() => change(i, voiceIdx)}
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
              <motion.span
                key={prev.name}
                className="block"
                custom={dir}
                variants={slide}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.45, ease: EASE }}
              >
                <Orb palette={prev.palette} className="size-32 lg:size-40" />
              </motion.span>
            </AnimatePresence>
          </button>

          <button
            type="button"
            onClick={toggle}
            aria-label={active ? "Pause" : `Play: hear ${voice.name} ${INVITE[call.id]}`}
            className="group relative block"
          >
            <AnimatePresence mode="popLayout" custom={dir} initial={false}>
              <motion.span
                key={voice.name}
                className="block"
                custom={dir}
                variants={slide}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.45, ease: EASE }}
              >
                <Orb palette={voice.palette} active={agentSpeaking} className="size-48 sm:size-52 lg:size-60" />
              </motion.span>
            </AnimatePresence>
            <span className="absolute left-1/2 top-1/2 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-black shadow-[0_8px_24px_-6px_rgba(0,0,0,0.35)] transition-transform duration-200 group-hover:scale-110">
              {status === "loading" ? (
                <Loader2 className="size-5 animate-spin" />
              ) : active ? (
                <Pause className="size-5 fill-current" />
              ) : (
                <Play className="ml-0.5 size-5 fill-current" />
              )}
            </span>
          </button>

          <button
            type="button"
            onClick={() => pickVoice(voiceIdx + 1, 1)}
            aria-label={`Switch to ${next.name}`}
            className="hidden transition-transform duration-300 hover:scale-105 sm:block"
          >
            <AnimatePresence mode="popLayout" custom={dir} initial={false}>
              <motion.span
                key={next.name}
                className="block"
                custom={dir}
                variants={slide}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.45, ease: EASE }}
              >
                <Orb palette={next.palette} className="size-32 lg:size-40" />
              </motion.span>
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

        {/* Now playing: who is speaking, and a level meter */}
        <div className="mx-auto mt-7 flex min-h-[5.5rem] max-w-xl flex-col items-center justify-center text-center">
          {status === "done" ? (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[15px] text-black shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
            >
              <span className="flex size-4 items-center justify-center rounded-full bg-black text-white">
                <Check className="size-2.5" strokeWidth={3} />
              </span>
              {call.outcome}
            </motion.div>
          ) : (
            <>
              <div className="flex h-7 items-center gap-[3px]" aria-hidden>
                {METER.map((h, i) => (
                  <motion.span
                    key={i}
                    className={cn("w-[3px] rounded-full", turn.agent || !sounding ? "bg-black" : "bg-black/40")}
                    animate={
                      sounding
                        ? { height: [5, h * 28, 8, h * 18, 5], opacity: 1 }
                        : { height: 4, opacity: status === "idle" ? 0.25 : 0.4 }
                    }
                    transition={
                      sounding
                        ? { duration: 0.9 + (i % 5) * 0.12, repeat: Infinity, ease: "easeInOut", delay: (i % 7) * 0.06 }
                        : { duration: 0.3 }
                    }
                  />
                ))}
              </div>
              <p className="mt-3 text-[15px] text-ink-soft" aria-live="polite">
                {statusLine}
              </p>
            </>
          )}

          {/* Captions, only when asked for (or when there is no audio) */}
          <AnimatePresence initial={false} mode="wait">
            {captions && status !== "idle" && status !== "done" && (
              <motion.div
                key={`${call.id}-${voiceIdx}-${step}-${urdu}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="mt-3"
              >
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
          {turns.map((t, i) => (
            <span
              key={i}
              className={cn(
                "h-0.5 rounded-full transition-all duration-300",
                t.agent ? "w-8" : "w-4",
                i < step || (i === step && active) ? "bg-black" : "bg-black/15"
              )}
            />
          ))}
        </div>

        {/* Footer row */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-hairline pt-5 sm:flex-row">
          <p className="max-w-sm text-center text-[15px] leading-relaxed text-ink-soft sm:text-left">
            {audioOk ? call.blurb : "Sound is not available right now, so this call is shown as captions."}
          </p>
          <div className="flex shrink-0 items-center gap-2">
            {captions && (
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
            )}
            <button
              type="button"
              aria-pressed={captions}
              aria-label="Captions"
              onClick={() => setCaptions((c) => !c)}
              className={cn(
                "flex size-9 items-center justify-center rounded-full border transition-colors",
                captions ? "border-black bg-black text-white" : "border-hairline bg-white text-black hover:bg-paper"
              )}
            >
              <Captions className="size-4" strokeWidth={1.75} />
            </button>
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
