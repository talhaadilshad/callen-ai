// "A day on your phone line": a ruler of the restaurant's open hours with
// a marker that moves from one moment to the next. Each stop says what
// Callen is doing at that hour. Arrows (or a click on a tick) move it by
// hand; otherwise it advances on its own while on screen.

"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// The ruler runs from 12 noon to 2 am: 14 hours, 4 ticks an hour.
const HOURS = 14;
const TICKS = HOURS * 4 + 1;

type Moment = { at: number; time: string; title: string; body: string };

// `at` is hours after 12 noon.
const MOMENTS: Moment[] = [
  { at: 1, time: "1:00 pm", title: "Lunch rush", body: "Orders come in back to back. Each caller is greeted on the first ring." },
  { at: 5.5, time: "5:30 pm", title: "A deal question", body: "A caller asks what is on offer today, hears the deal and orders it." },
  { at: 9, time: "9:00 pm", title: "Friday night", body: "The counter is slammed and nobody can reach the phone. It still gets answered." },
  { at: 11.75, time: "11:45 pm", title: "Late delivery", body: "A delivery order to G-11 is taken, read back and confirmed in under two minutes." },
  { at: 13, time: "1:00 am", title: "After midnight", body: "Still answering, the same way, until the minute you close." },
];

const STEP_MS = 4200;

export function DayTimeline() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-120px" });
  const [index, setIndex] = useState(0);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (!inView || !auto) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % MOMENTS.length), STEP_MS);
    return () => clearTimeout(t);
  }, [inView, auto, index]);

  const go = (i: number) => {
    setAuto(false);
    setIndex((i + MOMENTS.length) % MOMENTS.length);
  };

  const moment = MOMENTS[index];
  const left = (moment.at / HOURS) * 100;

  return (
    <div ref={ref} className="rounded-3xl border border-hairline bg-shell px-4 py-12 sm:px-10 sm:py-16">
      <div className="flex items-center gap-3 sm:gap-6">
        <button
          type="button"
          onClick={() => go(index - 1)}
          aria-label="Earlier"
          className="flex size-9 shrink-0 items-center justify-center rounded-full border border-hairline bg-white text-black shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-transform hover:scale-105"
        >
          <ChevronLeft className="size-4" />
        </button>

        <div className="relative h-56 flex-1">
          {/* ticks */}
          <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 items-center justify-between">
            {Array.from({ length: TICKS }, (_, i) => {
              const hour = i / 4;
              const stop = MOMENTS.findIndex((m) => m.at === hour);
              return (
                <button
                  key={i}
                  type="button"
                  tabIndex={stop >= 0 ? 0 : -1}
                  aria-label={stop >= 0 ? MOMENTS[stop].time : undefined}
                  aria-hidden={stop < 0}
                  onClick={() => stop >= 0 && go(stop)}
                  className={cn(
                    "w-px shrink-0",
                    stop >= 0 ? "h-4 cursor-pointer bg-black" : i % 4 === 0 ? "h-2.5 bg-black/30" : "h-1.5 bg-black/15"
                  )}
                />
              );
            })}
          </div>

          {/* marker */}
          <motion.div
            className="absolute inset-y-0 w-0"
            animate={{ left: `${left}%` }}
            transition={{ type: "spring", stiffness: 70, damping: 18 }}
          >
            <div className="absolute left-1/2 top-1/2 h-24 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-hairline bg-white shadow-[0_4px_14px_-4px_rgba(0,0,0,0.2)]">
              <span className="absolute inset-y-2 left-1/2 w-px -translate-x-1/2 bg-black" />
            </div>

            <div className="absolute bottom-[calc(50%+3.75rem)] left-1/2 w-56 -translate-x-1/2 text-center">
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={index}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="text-lg text-black"
                >
                  {moment.title}
                </motion.p>
              </AnimatePresence>
            </div>

            <div className="absolute left-1/2 top-[calc(50%+3.75rem)] w-60 -translate-x-1/2 text-center sm:w-72">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <p className="text-sm text-ink-soft">{moment.time}</p>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        <button
          type="button"
          onClick={() => go(index + 1)}
          aria-label="Later"
          className="flex size-9 shrink-0 items-center justify-center rounded-full border border-hairline bg-white text-black shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-transform hover:scale-105"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="mx-auto mt-2 flex min-h-[3.5rem] max-w-lg items-start justify-center text-center">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={index}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="text-[17px] font-light leading-relaxed text-black"
          >
            {moment.body}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="mt-6 flex justify-between px-12 text-xs text-black/40 sm:px-16">
        <span>12 noon</span>
        <span>2 am</span>
      </div>
    </div>
  );
}
