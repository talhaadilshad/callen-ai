// "What happens on every call": five stages joined by a line. A pulse
// travels along the line and each stage lights up as the pulse reaches it.
// Hovering or tapping a stage holds it there.

"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { BookOpen, Check, Ear, PhoneIncoming, type LucideIcon } from "lucide-react";
import { Orb } from "@/components/brand/orb";
import { cn } from "@/lib/utils";

type Stage = { title: string; short: string; detail: string; icon?: LucideIcon };

const STAGES: Stage[] = [
  {
    title: "The phone rings",
    short: "Your number",
    detail: "A customer calls your restaurant's number, the same way they always have. Nothing changes for them.",
    icon: PhoneIncoming,
  },
  {
    title: "Callen answers",
    short: "First ring",
    detail: "The call is picked up on the first ring, with your greeting, in the voice you chose.",
  },
  {
    title: "It listens",
    short: "Everyday Urdu",
    detail: "It follows everyday Urdu, with the English words people mix in: item names, sizes and addresses.",
    icon: Ear,
  },
  {
    title: "It checks your menu",
    short: "Items, prices, deals",
    detail: "Every answer comes from your menu, deals, delivery areas and policies. Nothing is made up.",
    icon: BookOpen,
  },
  {
    title: "It confirms",
    short: "Read back, total given",
    detail: "The order, the address and the total are read back to the caller before the call ends.",
    icon: Check,
  },
];

const STEP_MS = 2600;

export function CallFlow() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-120px" });
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false);

  useEffect(() => {
    if (!inView || held) return;
    const t = setTimeout(() => setActive((a) => (a + 1) % STAGES.length), STEP_MS);
    return () => clearTimeout(t);
  }, [inView, held, active]);

  const progress = (active / (STAGES.length - 1)) * 100;

  return (
    <div ref={ref} className="rounded-3xl border border-hairline bg-shell p-6 sm:p-10">
      {/* Desktop: a horizontal line of stages */}
      <div className="relative hidden md:block" onMouseLeave={() => setHeld(false)}>
        {/* the line, behind the nodes */}
        <div className="absolute left-[10%] right-[10%] top-7 h-px bg-black/12">
          <motion.div
            className="absolute inset-y-0 left-0 bg-black"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.9, ease: [0.2, 0.65, 0.3, 0.9] }}
          />
          <motion.div
            className="absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black shadow-[0_0_0_5px_rgba(0,0,0,0.08)]"
            animate={{ left: `${progress}%` }}
            transition={{ duration: 0.9, ease: [0.2, 0.65, 0.3, 0.9] }}
          />
        </div>

        <ol className="relative grid grid-cols-5">
          {STAGES.map((stage, i) => {
            const on = i === active;
            const done = i < active;
            return (
              <li key={stage.title} className="flex flex-col items-center text-center">
                <button
                  type="button"
                  onMouseEnter={() => {
                    setHeld(true);
                    setActive(i);
                  }}
                  onFocus={() => {
                    setHeld(true);
                    setActive(i);
                  }}
                  onClick={() => {
                    setHeld(true);
                    setActive(i);
                  }}
                  aria-current={on ? "step" : undefined}
                  className="group flex flex-col items-center"
                >
                  <motion.span
                    animate={{ scale: on ? 1.12 : 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 22 }}
                    className={cn(
                      "flex size-14 items-center justify-center rounded-full border transition-colors duration-300",
                      on
                        ? "border-black bg-black text-white shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]"
                        : done
                          ? "border-black/60 bg-white text-black"
                          : "border-hairline bg-white text-black/45"
                    )}
                  >
                    {stage.icon ? (
                      <stage.icon className="size-5" strokeWidth={1.5} />
                    ) : (
                      <Orb palette="ember" className="size-9" active={on} />
                    )}
                  </motion.span>
                  <span className={cn("mt-4 text-[15px] transition-colors", on ? "text-black" : "text-ink-soft")}>
                    {stage.title}
                  </span>
                  <span className="mt-0.5 text-[13px] text-black/40">{stage.short}</span>
                </button>
              </li>
            );
          })}
        </ol>

        <div className="mx-auto mt-9 flex min-h-[4.5rem] max-w-xl items-start justify-center text-center">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={active}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="text-lg font-light leading-relaxed text-black"
            >
              {STAGES[active].detail}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile: the same stages, stacked */}
      <ol className="space-y-6 md:hidden">
        {STAGES.map((stage, i) => (
          <li key={stage.title} className="flex gap-4">
            <span
              className={cn(
                "flex size-11 shrink-0 items-center justify-center rounded-full border transition-colors duration-300",
                i === active ? "border-black bg-black text-white" : "border-hairline bg-white text-black/60"
              )}
            >
              {stage.icon ? <stage.icon className="size-[18px]" strokeWidth={1.5} /> : <Orb palette="ember" className="size-7" />}
            </span>
            <div>
              <p className="text-[15px] text-black">{stage.title}</p>
              <p className="mt-1 text-[15px] leading-relaxed text-ink-soft">{stage.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
