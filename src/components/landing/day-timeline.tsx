// "A day on your phone line", from 12 noon to 2 am, drawn as one chart:
//   - a smooth curve of calls coming in (a lunch peak, a bigger dinner peak)
//   - the parts of that curve that fall while your staff cannot reach the
//     phone are filled in solid: those are the calls at risk
//   - underneath, two thin tracks on the same time axis: your staff (with
//     gaps) and Callen (no gaps), whose orb rides along as the marker
// A marker moves through five moments of the day and the card underneath
// says what your staff are doing and what Callen is doing. It advances by
// itself while on screen; the arrows or a click on the chart take over.

"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Orb } from "@/components/brand/orb";
import { cn } from "@/lib/utils";

// 28 half-hour slots, 12:00 noon to 2:00 am.
const SLOTS = 28;
const CALLS = [5, 8, 10, 9, 6, 4, 3, 3, 3, 4, 4, 5, 6, 7, 8, 10, 12, 12, 11, 9, 8, 7, 6, 5, 4, 3, 3, 2];
const TOP = 14; // chart ceiling, a little above the peak

// Slots where staff cannot reach the phone, and why.
const GAPS: Array<{ from: number; to: number; why: string }> = [
  { from: 2, to: 4, why: "Lunch rush" },
  { from: 8, to: 9, why: "Break" },
  { from: 16, to: 20, why: "Dinner rush" },
  { from: 25, to: 27, why: "Late night" },
];
const gapAt = (slot: number) => GAPS.find((g) => slot >= g.from && slot <= g.to);

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
    slot: 22,
    time: "11:00 pm",
    title: "Winding down",
    staff: "Free again, and picking up the phone.",
    callen: "Takes the calls that come in while they are on another line.",
  },
  {
    slot: 26,
    time: "1:00 am",
    title: "After midnight",
    staff: "Most of the team has gone home.",
    callen: "Still answering, the same way, until you close.",
  },
];

// --- chart geometry: 10 units per slot, 100 units tall -------------------
const W = SLOTS * 10;
const H = 100;
const xOf = (slot: number) => slot * 10 + 5;
const yOf = (calls: number) => H - (calls / TOP) * H;

// A smooth line through the middle of every slot, held flat to both edges.
const POINTS: Array<[number, number]> = [
  [0, yOf(CALLS[0])],
  ...CALLS.map((n, i) => [xOf(i), yOf(n)] as [number, number]),
  [W, yOf(CALLS[SLOTS - 1])],
];
// Catmull-Rom spline: each bend takes its direction from the points on
// either side, so the curve flows instead of stepping from slot to slot.
const at = (i: number) => POINTS[Math.max(0, Math.min(POINTS.length - 1, i))];
const LINE = POINTS.reduce((d, [x, y], i) => {
  if (i === 0) return `M ${x} ${y}`;
  const [x0, y0] = at(i - 2);
  const [x1, y1] = at(i - 1);
  const [x3, y3] = at(i + 1);
  const c1 = [x1 + (x - x0) / 6, y1 + (y - y0) / 6];
  const c2 = [x - (x3 - x1) / 6, y - (y3 - y1) / 6];
  return `${d} C ${c1[0].toFixed(2)} ${c1[1].toFixed(2)}, ${c2[0].toFixed(2)} ${c2[1].toFixed(2)}, ${x} ${y}`;
}, "");
const AREA = `${LINE} L ${W} ${H} L 0 ${H} Z`;

const STEP_MS = 4400;
const HOUR_LABELS = ["12 pm", "2 pm", "4 pm", "6 pm", "8 pm", "10 pm", "12 am", "2 am"];
const EASE = [0.2, 0.65, 0.3, 0.9] as [number, number, number, number];

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
  const goToX = (ratio: number) => {
    const slot = ratio * SLOTS - 0.5;
    let best = 0;
    MOMENTS.forEach((m, i) => {
      if (Math.abs(m.slot - slot) < Math.abs(MOMENTS[best].slot - slot)) best = i;
    });
    go(best);
  };

  const moment = MOMENTS[index];
  const left = (xOf(moment.slot) / W) * 100;
  const top = (yOf(CALLS[moment.slot]) / H) * 100;
  const gap = gapAt(moment.slot);
  const spring = { type: "spring" as const, stiffness: 70, damping: 18 };

  return (
    <div ref={ref} className="rounded-3xl border border-hairline bg-shell p-5 sm:p-8 lg:p-10">
      <div className="grid grid-cols-[4.25rem_minmax(0,1fr)] gap-x-3 sm:grid-cols-[6.5rem_minmax(0,1fr)] sm:gap-x-6">
        {/* ---------- Row 1: calls coming in ---------- */}
        <p className="self-end pb-2 text-[13px] leading-tight text-ink-soft">Calls coming in</p>
        <div
          className="relative h-40 cursor-pointer sm:h-48"
          onClick={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            goToX((e.clientX - r.left) / r.width);
          }}
        >
          {/* faint horizontal guides */}
          {[25, 50, 75].map((g) => (
            <span key={g} className="absolute inset-x-0 border-t border-dashed border-black/[0.07]" style={{ top: `${g}%` }} />
          ))}

          {/* the curve wipes in from the left the first time it is seen */}
          <motion.div
            className="absolute inset-0"
            initial={{ clipPath: "inset(0 100% 0 0)" }}
            animate={{ clipPath: seen ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)" }}
            transition={{ duration: 1.5, ease: EASE }}
          >
            <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible" aria-hidden>
              <defs>
                <linearGradient id="day-fade" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#000" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#000" stopOpacity="0.02" />
                </linearGradient>
                <linearGradient id="day-risk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#000" stopOpacity="0.92" />
                  <stop offset="100%" stopColor="#000" stopOpacity="0.55" />
                </linearGradient>
                <clipPath id="day-gaps">
                  {GAPS.map((g) => (
                    <rect key={g.from} x={g.from * 10} y="0" width={(g.to - g.from + 1) * 10} height={H} />
                  ))}
                </clipPath>
              </defs>
              <path d={AREA} fill="url(#day-fade)" />
              <path d={AREA} fill="url(#day-risk)" clipPath="url(#day-gaps)" />
              <path d={LINE} fill="none" stroke="#000" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
            </svg>
          </motion.div>

          {/* why each dark stretch is dark */}
          {GAPS.map((g) => (
            <span
              key={g.why}
              className="pointer-events-none absolute bottom-1.5 hidden -translate-x-1/2 whitespace-nowrap text-[11px] text-white/90 md:block"
              style={{ left: `${(((g.from + g.to + 1) / 2) * 10 * 100) / W}%` }}
            >
              {g.to - g.from >= 2 ? g.why : ""}
            </span>
          ))}

          {/* marker: time, a hairline down through the tracks, a dot on the curve */}
          <motion.div
            className="pointer-events-none absolute -bottom-[4.6rem] -top-1 z-10 w-0"
            animate={{ left: `${left}%` }}
            transition={spring}
          >
            <span className="absolute bottom-0 left-1/2 top-6 w-px -translate-x-1/2 bg-black/35" />
            <span className="absolute left-1/2 top-0 -translate-x-1/2 whitespace-nowrap rounded-full bg-black px-2.5 py-1 text-xs text-white shadow-[0_4px_12px_-4px_rgba(0,0,0,0.4)]">
              {moment.time}
            </span>
          </motion.div>
          <motion.span
            className="pointer-events-none absolute z-10 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-black bg-white shadow-[0_0_0_4px_rgba(255,255,255,0.7)]"
            animate={{ left: `${left}%`, top: `${top}%` }}
            transition={spring}
          />
        </div>

        {/* ---------- Row 2: your staff ---------- */}
        <p className="mt-5 self-center text-[13px] leading-tight text-ink-soft">Your staff</p>
        <div className="relative mt-5 h-1.5">
          {/* dotted where nobody can answer, solid where they can */}
          <span className="absolute inset-x-0 top-1/2 border-t-2 border-dotted border-black/20" />
          {[
            { from: 0, to: 1 },
            { from: 5, to: 7 },
            { from: 10, to: 15 },
            { from: 21, to: 24 },
          ].map((seg, i) => (
            <motion.span
              key={seg.from}
              className="absolute inset-y-0 origin-left rounded-full bg-black/55"
              style={{ left: `${(seg.from * 1000) / W}%`, width: `${((seg.to - seg.from + 1) * 1000) / W}%` }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: seen ? 1 : 0 }}
              transition={{ duration: 0.6, delay: 0.5 + i * 0.18, ease: EASE }}
            />
          ))}
        </div>

        {/* ---------- Row 3: Callen ---------- */}
        <p className="mt-5 self-center text-[13px] leading-tight text-black">Callen</p>
        <div className="relative mt-5 h-1.5">
          <span className="absolute inset-0 rounded-full bg-black/10" />
          <motion.span
            className="absolute inset-0 origin-left rounded-full bg-black"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: seen ? 1 : 0 }}
            transition={{ duration: 1.5, delay: 0.5, ease: EASE }}
          />
          {/* Callen's orb rides the track at the current time */}
          <motion.div className="absolute top-1/2 z-20 size-0" animate={{ left: `${left}%` }} transition={spring}>
            <span className="absolute left-0 top-0 block -translate-x-1/2 -translate-y-1/2 rounded-full bg-shell p-[3px]">
              <Orb palette="ember" className="size-6" active />
            </span>
          </motion.div>
        </div>

        {/* ---------- Hours ---------- */}
        <span />
        <div className="mt-5 flex justify-between text-[11px] text-black/40 sm:text-xs">
          {HOUR_LABELS.map((h, i) => (
            <span key={h} className={cn(i % 2 === 1 && "hidden sm:inline")}>
              {h}
            </span>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-hairline pt-5 text-[13px] text-ink-soft">
        <span className="flex items-center gap-2">
          <span className="size-3 rounded-[4px] bg-black/85" /> Calls your staff cannot get to
        </span>
        <span className="flex items-center gap-2">
          <span className="size-3 rounded-[4px] border border-hairline bg-black/10" /> Calls they can take
        </span>
        <span className="flex items-center gap-2">
          <Orb palette="ember" className="size-3" /> Callen answers all of them
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
                <p className="text-[13px] text-ink-soft">Your staff · {gap ? "cannot answer" : "can answer"}</p>
                <p className="mt-1 text-[15px] leading-relaxed text-black/55">{moment.staff}</p>
              </div>
              <div>
                <p className="text-[13px] text-ink-soft">Callen · answering</p>
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
