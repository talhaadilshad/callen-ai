// "What a missed call costs": the visitor puts in their own numbers and
// sees what unanswered calls are worth in a month. Nothing here is a claim
// about results; it is arithmetic on the three inputs, with the one
// assumption (half of unanswered callers wanted to order) stated on screen.

"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { motion, useMotionValueEvent, useSpring } from "motion/react";
import { GrainSurface } from "@/components/brand/orb";

const ORDER_SHARE = 0.5; // share of unanswered callers who wanted to order
const DAYS = 30;

function Rolling({ value, prefix = "" }: { value: number; prefix?: string }) {
  const spring = useSpring(value, { stiffness: 90, damping: 20 });
  const [shown, setShown] = useState(value);
  useEffect(() => {
    spring.set(value);
  }, [spring, value]);
  useMotionValueEvent(spring, "change", (v) => setShown(Math.round(v)));
  return (
    <span className="tabular-nums">
      {prefix}
      {shown.toLocaleString("en-PK")}
    </span>
  );
}

function Slider({
  label,
  value,
  display,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  const fill = ((value - min) / (max - min)) * 100;
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-4">
        <span className="text-[15px] text-ink-soft">{label}</span>
        <span className="text-xl font-light tabular-nums tracking-[-0.01em] text-black">{display}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="range-ink mt-3"
        style={{ "--fill": `${fill}%` } as CSSProperties}
      />
    </label>
  );
}

export function ValueCalculator() {
  const [calls, setCalls] = useState(120);
  const [missed, setMissed] = useState(20);
  const [order, setOrder] = useState(1500);

  const missedCalls = Math.round(calls * (missed / 100) * DAYS);
  const lostOrders = Math.round(missedCalls * ORDER_SHARE);
  const lostRevenue = lostOrders * order;
  const answered = 100 - missed;

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_1.1fr]">
      {/* Inputs */}
      <div className="flex flex-col rounded-3xl border border-hairline bg-shell p-6 sm:p-8">
        <p className="text-[15px] text-black">Your restaurant, on a normal day</p>
        <div className="mt-7 space-y-8">
          <Slider label="Calls you get in a day" value={calls} display={`${calls}`} min={20} max={400} step={10} onChange={setCalls} />
          <Slider
            label="Calls that go unanswered"
            value={missed}
            display={`${missed}%`}
            min={5}
            max={50}
            step={1}
            onChange={setMissed}
          />
          <Slider
            label="Average order value"
            value={order}
            display={`PKR ${order.toLocaleString("en-PK")}`}
            min={500}
            max={5000}
            step={100}
            onChange={setOrder}
          />
        </div>
        <p className="mt-auto pt-8 text-sm leading-relaxed text-ink-soft">
          An estimate from your own numbers. It assumes half of the callers who could not get through wanted to
          order, over 30 days.
        </p>
      </div>

      {/* Result */}
      <GrainSurface palette="ember" className="rounded-3xl text-white">
        <div className="flex h-full min-h-[26rem] flex-col p-6 sm:p-8">
          <p className="text-[15px] text-white/85">Left on the table every month</p>
          <p className="mt-3 text-5xl font-light leading-none tracking-[-0.03em] sm:text-6xl lg:text-[4.25rem]">
            <Rolling value={lostRevenue} prefix="PKR " />
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/25 bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-3xl font-light tracking-[-0.02em]">
                <Rolling value={missedCalls} />
              </p>
              <p className="mt-1 text-sm text-white/85">calls nobody picked up</p>
            </div>
            <div className="rounded-2xl border border-white/25 bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-3xl font-light tracking-[-0.02em]">
                <Rolling value={lostOrders} />
              </p>
              <p className="mt-1 text-sm text-white/85">orders that went elsewhere</p>
            </div>
          </div>

          <div className="mt-auto space-y-3 pt-8 text-sm">
            <div>
              <div className="mb-1.5 flex justify-between text-white/85">
                <span>Answered today</span>
                <span className="tabular-nums">{answered}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/25">
                <motion.div
                  className="h-full rounded-full bg-white/70"
                  animate={{ width: `${answered}%` }}
                  transition={{ type: "spring", stiffness: 120, damping: 22 }}
                />
              </div>
            </div>
            <div>
              <div className="mb-1.5 flex justify-between">
                <span>Answered with Callen</span>
                <span>Every call</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/25">
                <motion.div
                  className="h-full rounded-full bg-white"
                  initial={{ width: "0%" }}
                  whileInView={{ width: "100%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: 0.3, ease: [0.2, 0.65, 0.3, 0.9] }}
                />
              </div>
            </div>
          </div>
        </div>
      </GrainSurface>
    </div>
  );
}
