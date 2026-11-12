// "A day on your phone line", from 12 noon to 2 am, in three layers that
// share one time axis:
//   1. how many calls come in (bars: a lunch peak and a bigger dinner peak)
//   2. when your staff can actually reach the phone (a band with gaps)
//   3. Callen (a band with no gaps)
// A marker moves through five moments of the day; the card underneath says
// what your staff are doing at that moment and what Callen is doing. It
// advances by itself while on screen; the arrows or a click on the chart
// take over.

"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Orb } from "@/components/brand/orb";
import { cn } from "@/lib/utils";

// 28 half-hour slots, 12:00 noon to 2:00 am.
const SLOTS = 28;
const CALLS = [5, 8, 10, 9, 6, 4, 3, 3, 3, 4, 4, 5, 6, 7, 8, 10, 12, 12, 11, 9, 8, 7, 6, 5, 4, 3, 3, 2];
const PEAK = Math.max(...CALLS);

type Staff = "free" | "busy" | "away";
// When staff can reach the phone: busy in both rushes, away on the
// afternoon break and thin after midnight.
const STAFF: Staff[] = [
  "free", "free", "busy", "busy", "busy", "free", "free", "free", "away", "away", "free", "free", "free", "free",
  "free", "free", "busy", "busy", "busy", "busy", "busy", "free", "free", "free", "free", "away", "away", "away",
];

type Moment = { slot: number; time: string; title: string; staff: string; callen: string };

const MOMENTS: Moment[] = [
  {
    slot: 2,
    time: "1:00 pm",
    title: "Lunch rush",
    staff: "Busy at the counter. The phone rings out.",
    callen: "Picks up on the first ring and takes the order.",
  },
  {
    slot: 9,
    time: "4:30 pm",
    title: "Afternoon break",
    staff: "On a break before the evening shift.",
    callen: "Takes a takeaway order for 6 pm pickup.",
  },
  {
    slot: 18,
    time: "9:00 pm",
    title: "Friday night",
    staff: "Slammed. Nobody can get to the phone.",
    callen: "Answers each caller and offers today's deal.",
  },
  {
    slot: 23,
    time: "11:30 pm",
    title: "Late delivery",
    staff: "Closing down the dining area.",
    callen: "Takes a delivery order to G-11 and reads it back.",
  },
  {
    slot: 26,
    time: "1:00 am",
    title: "After midnight",
    staff: "Most of the team has gone home.",
    callen: "Still answering, the same way, until you close.",
  },
];

const STEP_MS = 4400;
const HOUR_LABELS = ["12 pm", "2 pm", "4 pm", "6 pm", "8 pm", "10 pm", "12 am", "2 am"];

export function DayTimeline() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-120px" });
  const seen = useInView(ref, { once: true, margin: "-120px" });
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
  // A click on the chart jumps to the nearest moment.
  const goToSlot = (slot: number) => {
    let best = 0;
    MOMENTS.forEach((m, i) => {
      if (Math.abs(m.slot - slot) < Math.abs(MOMENTS[best].slot - slot)) best = i;
    });
    go(best);
  };

  const moment = MOMENTS[index];
  const left = ((moment.slot + 0.5) / SLOTS) * 100;
  const staffNow = STAFF[moment.slot];

  return (
    <div ref={ref} className="rounded-3xl border border-hairline bg-shell p-5 sm:p-8 lg:p-10">
      <div className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-x-3 sm:grid-cols-[6.5rem_minmax(0,1fr)] sm:gap-x-5">
        {/* Row 1: calls coming in */}
        <p className="self-end pb-1 text-[13px] leading-tight text-ink-soft">Calls coming in</p>
        <div className="relative">
          {/* marker: time pill and a line through all three rows */}
          <motion.div
            className="pointer-events-none absolute -bottom-[5.75rem] top-0 z-10 w-0"
            animate={{ left: `${left}%` }}
            transition={{ type: "spring", stiffness: 70, damping: 18 }}
          >
            <span className="absolute left-1/2 top-0 -translate-x-1/2 whitespace-nowrap rounded-full bg-black px-2.5 py-1 text-xs text-white">
              {moment.time}
            </span>
            <span className="absolute bottom-0 left-1/2 top-7 w-px -translate-x-1/2 bg-black" />
          </motion.div>

          <div className="flex h-32 items-end gap-[3px] pt-9 sm:gap-1.5">
            {CALLS.map((n, i) => {
              const near = Math.abs(i - moment.slot) <= 1;
              return (
                <button
                  key={i}
                  type="button"
                  tabIndex={-1}
                  aria-hidden
                  onClick={() => goToSlot(i)}
                  className="flex h-full flex-1 items-end"
                >
                  <motion.span
                    className={cn("w-full rounded-t-[3px] transition-colors duration-300", near ? "bg-black" : "bg-black/20")}
                    initial={{ height: "0%" }}
                    animate={{ height: seen ? `${(n / PEAK) * 100}%` : "0%" }}
                    transition={{ duration: 0.7, delay: seen ? i * 0.02 : 0, ease: [0.2, 0.65, 0.3, 0.9] }}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 2: your staff */}
        <p className="mt-4 self-center text-[13px] leading-tight text-ink-soft">Your staff</p>
        <div className="mt-4 flex h-3 gap-[3px] sm:gap-1.5">
          {STAFF.map((s, i) => (
            <span
              key={i}
              className={cn(
                "h-full flex-1 rounded-full",
                s === "free" && "bg-black/55",
                s === "busy" && "bg-[repeating-linear-gradient(135deg,rgba(0,0,0,0.35)_0_2px,transparent_2px_5px)]",
                s === "away" && "border border-dashed border-black/25"
              )}
            />
          ))}
        </div>

        {/* Row 3: Callen */}
        <p className="mt-3.5 flex items-center gap-1.5 self-center text-[13px] leading-tight text-black">
          <Orb palette="ember" className="size-3.5" />
          Callen
        </p>
        <div className="mt-3.5 h-3 overflow-hidden rounded-full bg-black/10">
          <motion.div
            className="h-full rounded-full bg-black"
            initial={{ width: "0%" }}
            animate={{ width: seen ? "100%" : "0%" }}
            transition={{ duration: 1.4, delay: 0.4, ease: [0.2, 0.65, 0.3, 0.9] }}
          />
        </div>

        {/* Hours */}
        <span />
        <div className="mt-3 flex justify-between text-[11px] text-black/40 sm:text-xs">
          {HOUR_LABELS.map((h, i) => (
            <span key={h} className={cn(i % 2 === 1 && "hidden sm:inline")}>
              {h}
            </span>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-ink-soft">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-5 rounded-full bg-black/55" /> Can answer
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-5 rounded-full bg-[repeating-linear-gradient(135deg,rgba(0,0,0,0.35)_0_2px,transparent_2px_5px)]" />
          Too busy
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-5 rounded-full border border-dashed border-black/25" /> Away
        </span>
      </div>

      {/* The moment */}
      <div className="mt-6 flex items-stretch gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => go(index - 1)}
          aria-label="Earlier in the day"
          className="flex w-9 shrink-0 items-center justify-center rounded-2xl border border-hairline bg-white text-black transition-colors hover:bg-paper sm:w-11"
        >
          <ChevronLeft className="size-4" />
        </button>

        <div className="min-h-[9.5rem] flex-1 overflow-hidden rounded-2xl border border-hairline bg-white p-5 shadow-[0_8px_30px_-14px_rgba(0,0,0,0.12)]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28 }}
              className="grid gap-x-8 gap-y-4 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,1fr)]"
            >
              <div>
                <p className="text-sm text-ink-soft">{moment.time}</p>
                <p className="mt-1 text-2xl font-light tracking-[-0.02em] text-black">{moment.title}</p>
              </div>
              <div>
                <p className="text-[13px] text-ink-soft">
                  Your staff · {staffNow === "busy" ? "too busy" : staffNow === "away" ? "away" : "can answer"}
                </p>
                <p className="mt-1 text-[15px] leading-relaxed text-black/55">{moment.staff}</p>
              </div>
              <div>
                <p className="flex items-center gap-1.5 text-[13px] text-ink-soft">
                  <Orb palette="ember" className="size-3.5" active />
                  Callen · answering
                </p>
                <p className="mt-1 text-[15px] leading-relaxed text-black">{moment.callen}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <button
          type="button"
          onClick={() => go(index + 1)}
          aria-label="Later in the day"
          className="flex w-9 shrink-0 items-center justify-center rounded-2xl border border-hairline bg-white text-black transition-colors hover:bg-paper sm:w-11"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      {/* Which moment */}
      <div className="mt-4 flex justify-center gap-1.5">
        {MOMENTS.map((m, i) => (
          <button
            key={m.time}
            type="button"
            onClick={() => go(i)}
            aria-label={`${m.time}: ${m.title}`}
            aria-current={i === index}
            className={cn("h-1 rounded-full transition-all duration-300", i === index ? "w-7 bg-black" : "w-3 bg-black/20")}
          />
        ))}
      </div>
    </div>
  );
}
