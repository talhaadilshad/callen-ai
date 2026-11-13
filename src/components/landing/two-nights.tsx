// "Same calls, two nights": one busy Friday hour, played twice at once.
// The same eight calls arrive on both sides. On the left the phone is left
// to a busy counter, so most of them ring out and pile up as missed-call
// notifications. On the right Callen answers, and each call becomes an
// order. Totals underneath keep score. It replays while on screen.
//
// The calls, numbers and amounts are an illustration, and say so.

"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useMotionValueEvent, useSpring } from "motion/react";
import { Check, PhoneIncoming, PhoneMissed, RotateCcw } from "lucide-react";
import { GrainSurface, Orb } from "@/components/brand/orb";
import { cn } from "@/lib/utils";

type Call = {
  time: string;
  from: string;
  order: string;
  detail: string;
  amount: number;
  // Did someone at the counter manage to pick this one up?
  staff: boolean;
};

const CALLS: Call[] = [
  { time: "9:02 pm", from: "0333 ··· 4471", order: "Chicken Karahi, 4 Naan", detail: "Takeaway", amount: 1850, staff: true },
  { time: "9:05 pm", from: "0301 ··· 9082", order: "2 × Zinger Burger", detail: "Delivery · G-11", amount: 1300, staff: false },
  { time: "9:09 pm", from: "0345 ··· 1126", order: "Family Deal", detail: "Delivery · F-10", amount: 1999, staff: false },
  { time: "9:14 pm", from: "0321 ··· 7730", order: "Large Chicken Tikka Pizza", detail: "Takeaway", amount: 1650, staff: true },
  { time: "9:18 pm", from: "0312 ··· 5519", order: "Table for 6, Saturday 8 pm", detail: "Booking", amount: 0, staff: false },
  { time: "9:23 pm", from: "0336 ··· 2204", order: "3 × Chicken Biryani", detail: "Delivery · E-11", amount: 1350, staff: false },
  { time: "9:31 pm", from: "0300 ··· 6648", order: "Midnight Deal, Garlic Bread", detail: "Delivery · DHA Phase 6", amount: 1699, staff: false },
  { time: "9:38 pm", from: "0343 ··· 8815", order: "2 × Beef Burger, Fries", detail: "Takeaway", amount: 1900, staff: true },
];

const STEP_MS = 1900;
const HOLD_MS = 6500;
const VISIBLE = 4;

function Rolling({ value }: { value: number }) {
  const spring = useSpring(value, { stiffness: 110, damping: 22 });
  const [shown, setShown] = useState(value);
  useEffect(() => {
    spring.set(value);
  }, [spring, value]);
  useMotionValueEvent(spring, "change", (v) => setShown(Math.round(v)));
  return <span className="tabular-nums">{shown.toLocaleString("en-PK")}</span>;
}

const rowMotion = (idx: number) => ({
  layout: true,
  initial: { opacity: 0, y: -22, scale: 0.94 },
  animate: { opacity: Math.max(0, 1 - idx * 0.24), y: 0, scale: 1 - idx * 0.025 },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
  transition: { type: "spring" as const, stiffness: 320, damping: 30 },
});

export function TwoNights() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-140px" });
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const done = step >= CALLS.length;
    const t = setTimeout(() => setStep(done ? 0 : step + 1), done ? HOLD_MS : step === 0 ? 900 : STEP_MS);
    return () => clearTimeout(t);
  }, [inView, step]);

  const arrived = CALLS.slice(0, step);
  // newest first, and only the top few stay on the pile
  const pile = arrived.map((c, i) => ({ ...c, id: i })).reverse().slice(0, VISIBLE);
  const current = arrived[arrived.length - 1];
  const done = step >= CALLS.length;

  const missed = arrived.filter((c) => !c.staff).length;
  const counterTaken = arrived.filter((c) => c.staff).reduce((a, c) => a + c.amount, 0);
  const callenTaken = arrived.reduce((a, c) => a + c.amount, 0);

  return (
    <div ref={ref}>
      {/* The clock both sides share */}
      <div className="mb-4 flex items-center justify-center gap-2">
        <div className="flex items-center gap-2.5 rounded-full border border-hairline bg-white py-2 pl-2.5 pr-4 text-sm shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <motion.span
            key={step}
            animate={current && !done ? { rotate: [0, -16, 14, -10, 8, 0] } : { rotate: 0 }}
            transition={{ duration: 0.6 }}
            className="flex size-7 items-center justify-center rounded-full bg-black text-white"
          >
            <PhoneIncoming className="size-3.5" />
          </motion.span>
          <span className="tabular-nums text-black">Friday · {current ? current.time : "9:00 pm"}</span>
          <span className="hidden text-ink-soft sm:inline">
            {done ? "40 minutes, 8 calls" : current ? `Call from ${current.from}` : "The dinner rush begins"}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setStep(0)}
          aria-label="Play the hour again"
          className="flex size-9 items-center justify-center rounded-full border border-hairline bg-white text-black shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-transform hover:scale-105"
        >
          <RotateCcw className="size-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {/* ---------------- Without Callen ---------------- */}
        <div className="flex flex-col rounded-3xl border border-hairline bg-shell p-5 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[13px] text-ink-soft">Without Callen</p>
              <p className="mt-1 text-2xl font-light tracking-[-0.02em]">One phone, one busy counter</p>
            </div>
            <span className="mt-1 flex shrink-0 items-center gap-1.5 rounded-full bg-black px-2.5 py-1 text-xs text-white">
              <PhoneMissed className="size-3" />
              <Rolling value={missed} /> missed
            </span>
          </div>

          <ul className="relative mt-6 h-[19.5rem] space-y-2.5 overflow-hidden [mask-image:linear-gradient(to_bottom,black_70%,transparent)]">
            <AnimatePresence initial={false} mode="popLayout">
              {pile.map((c, idx) => (
                <motion.li
                  key={c.id}
                  {...rowMotion(idx)}
                  className={cn(
                    "flex items-center gap-3.5 rounded-2xl border p-3.5",
                    c.staff ? "border-hairline bg-white/60" : "border-hairline bg-white shadow-[0_6px_20px_-12px_rgba(0,0,0,0.25)]"
                  )}
                >
                  <span
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-xl",
                      c.staff ? "border border-hairline bg-white text-black/50" : "bg-black text-white"
                    )}
                  >
                    {c.staff ? <Check className="size-4" strokeWidth={2} /> : <PhoneMissed className="size-4" strokeWidth={1.75} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={cn("block truncate text-[15px]", c.staff ? "text-black/55" : "text-black")}>
                      {c.staff ? "Answered at the counter" : "Missed call"}
                    </span>
                    <span className="block truncate text-[13px] text-ink-soft">
                      {c.from} · {c.staff ? c.order : "Rang out. Did not call back."}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs tabular-nums text-ink-soft">{c.time}</span>
                </motion.li>
              ))}
            </AnimatePresence>
            {arrived.length === 0 && <li className="pt-24 text-center text-sm text-black/35">Waiting for the first call</li>}
          </ul>

          <div className="mt-2 flex items-end justify-between gap-4 border-t border-hairline pt-5">
            <div>
              <p className="text-[13px] text-ink-soft">Orders taken</p>
              <p className="mt-1 text-3xl font-light tracking-[-0.02em] text-black/60 sm:text-4xl">
                PKR <Rolling value={counterTaken} />
              </p>
            </div>
            <p className="max-w-[11rem] text-right text-[13px] leading-snug text-ink-soft">
              Callers who cannot get through order from somewhere else.
            </p>
          </div>
        </div>

        {/* ---------------- With Callen ---------------- */}
        <GrainSurface palette="forest" className="rounded-3xl text-white">
          <div className="flex h-full flex-col p-5 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="flex items-center gap-2 text-[13px] text-white/85">
                  <Orb palette="mint" className="size-4" active={!done && step > 0} />
                  With Callen
                </p>
                <p className="mt-1 text-2xl font-light tracking-[-0.02em]">Every call picked up</p>
              </div>
              <span className="mt-1 flex shrink-0 items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs text-black">
                <Check className="size-3" strokeWidth={2.5} />
                <Rolling value={arrived.length} /> answered
              </span>
            </div>

            <ul className="relative mt-6 h-[19.5rem] space-y-2.5 overflow-hidden [mask-image:linear-gradient(to_bottom,black_70%,transparent)]">
              <AnimatePresence initial={false} mode="popLayout">
                {pile.map((c, idx) => (
                  <motion.li
                    key={c.id}
                    {...rowMotion(idx)}
                    className="flex items-center gap-3.5 rounded-2xl bg-white p-3.5 text-black shadow-[0_10px_30px_-14px_rgba(0,0,0,0.45)]"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-black text-white">
                      <Check className="size-4" strokeWidth={2} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px]">{c.order}</span>
                      <span className="block truncate text-[13px] text-ink-soft">
                        {c.from} · {c.detail}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block text-[15px] tabular-nums">
                        {c.amount > 0 ? `PKR ${c.amount.toLocaleString("en-PK")}` : "Booked"}
                      </span>
                      <span className="block text-xs tabular-nums text-ink-soft">{c.time}</span>
                    </span>
                  </motion.li>
                ))}
              </AnimatePresence>
              {arrived.length === 0 && <li className="pt-24 text-center text-sm text-white/60">Waiting for the first call</li>}
            </ul>

            <div className="mt-2 flex items-end justify-between gap-4 border-t border-white/25 pt-5">
              <div>
                <p className="text-[13px] text-white/85">Orders taken</p>
                <p className="mt-1 text-3xl font-light tracking-[-0.02em] sm:text-4xl">
                  PKR <Rolling value={callenTaken} />
                </p>
              </div>
              <p className="max-w-[11rem] text-right text-[13px] leading-snug text-white/85">
                Same calls, same hour. Nobody left the counter.
              </p>
            </div>
          </div>
        </GrainSurface>
      </div>

      <p className="mt-4 text-center text-xs text-black/40">
        An illustration of one busy hour, not figures from a real restaurant.
      </p>
    </div>
  );
}
