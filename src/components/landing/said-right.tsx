// "Said the way people say it": one line from a menu, read two ways. A
// generic voice bot reads it letter by letter; Callen says it the way a
// person on the phone in Pakistan would. The examples change by themselves
// and each Callen line is "spoken" word by word next to a moving waveform.

"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { Check, X } from "lucide-react";
import { Orb } from "@/components/brand/orb";
import { cn } from "@/lib/utils";

type Example = {
  tab: string;
  written: string;
  note: string;
  robot: string;
  ur: string;
  roman: string;
};

const EXAMPLES: Example[] = [
  {
    tab: "Short forms",
    written: "BBQ Pizza",
    note: "Menu item",
    robot: "“B, B, Q pizza”",
    ur: "باربی کیو پیزا",
    roman: "barbecue pizza",
  },
  {
    tab: "Prices",
    written: "Rs. 1,250",
    note: "Price",
    robot: "“One thousand two hundred and fifty rupees”",
    ur: "ساڑھے بارہ سو روپے",
    roman: "saarhay baara sau rupay",
  },
  {
    tab: "Sizes",
    written: "1.5 L Drink",
    note: "Add-on",
    robot: "“One point five L drink”",
    ur: "ڈیڑھ لیٹر ڈرنک",
    roman: "derh litre drink",
  },
  {
    tab: "Areas",
    written: "F-10 Markaz",
    note: "Delivery area",
    robot: "“F dash ten markaz”",
    ur: "ایف ٹین مرکز",
    roman: "F-ten markaz",
  },
  {
    tab: "Payment",
    written: "COD",
    note: "Payment",
    robot: "“C, O, D”",
    ur: "کیش آن ڈیلیوری",
    roman: "cash on delivery",
  },
];

const STEP_MS = 4600;
const BARS = [0.5, 0.9, 0.6, 1, 0.7, 0.45, 0.85, 0.55];

export function SaidRight() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-120px" });
  const [index, setIndex] = useState(0);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (!inView || !auto) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % EXAMPLES.length), STEP_MS);
    return () => clearTimeout(t);
  }, [inView, auto, index]);

  const ex = EXAMPLES[index];
  const words = ex.roman.split(" ");

  return (
    <div ref={ref} className="flex h-full flex-col rounded-3xl border border-hairline bg-shell p-6">
      {/* What kind of thing is being said */}
      <div className="flex flex-wrap gap-1.5">
        {EXAMPLES.map((e, i) => {
          const on = i === index;
          return (
            <button
              key={e.tab}
              type="button"
              aria-pressed={on}
              onClick={() => {
                setAuto(false);
                setIndex(i);
              }}
              className={cn(
                "relative rounded-full px-3.5 py-1.5 text-sm transition-colors",
                on ? "text-black" : "text-ink-soft hover:text-black"
              )}
            >
              {on && (
                <motion.span
                  layoutId="said-right-tab"
                  className="absolute inset-0 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                  transition={{ type: "spring", stiffness: 380, damping: 34 }}
                />
              )}
              <span className="relative">{e.tab}</span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-1 flex-col justify-center py-7">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            {/* The line as it is written on the menu */}
            <div className="flex items-end justify-between gap-4 border-b border-dotted border-black/20 pb-4">
              <div>
                <p className="text-[13px] text-ink-soft">On your menu · {ex.note}</p>
                <p className="mt-1 font-mono text-2xl tracking-tight text-black sm:text-[1.7rem]">{ex.written}</p>
              </div>
            </div>

            {/* A generic bot */}
            <div className="mt-5 flex items-start gap-3">
              <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-hairline bg-white text-black/45">
                <X className="size-3.5" strokeWidth={2} />
              </span>
              <div>
                <p className="text-[13px] text-ink-soft">A generic voice bot reads</p>
                <p className="mt-0.5 text-[15px] text-black/40 line-through decoration-black/25">{ex.robot}</p>
              </div>
            </div>

            {/* Callen */}
            <div className="mt-4 rounded-2xl border border-hairline bg-white p-4 shadow-[0_8px_30px_-14px_rgba(0,0,0,0.14)]">
              <div className="flex items-center justify-between gap-3">
                <p className="flex items-center gap-2 text-[13px] text-ink-soft">
                  <span className="flex size-5 items-center justify-center rounded-full bg-black text-white">
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                  Callen says
                </p>
                <div className="flex h-5 items-center gap-[3px]" aria-hidden>
                  {BARS.map((h, i) => (
                    <motion.span
                      key={i}
                      className="w-[3px] rounded-full bg-black"
                      initial={{ height: 4 }}
                      animate={{ height: [4, h * 20, 6, h * 14, 4] }}
                      transition={{ duration: 1.3, delay: 0.25 + i * 0.07, repeat: 1, ease: "easeInOut" }}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-2 flex items-center gap-3.5">
                <Orb palette="ember" className="size-11" active />
                <div className="min-w-0">
                  <p dir="rtl" lang="ur" className="text-left font-urdu text-[1.35rem] leading-[2.1] text-black">
                    {ex.ur}
                  </p>
                  <p className="text-[15px]">
                    {words.map((w, i) => (
                      <motion.span
                        key={i}
                        initial={{ color: "rgba(0,0,0,0.3)" }}
                        animate={{ color: "rgba(0,0,0,1)" }}
                        transition={{ duration: 0.25, delay: 0.45 + i * 0.28 }}
                      >
                        {w}{" "}
                      </motion.span>
                    ))}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div>
        <h3 className="text-[15px] text-ink-soft">Said the way people say it</h3>
        <p className="mt-1.5 text-[15px] leading-relaxed text-black">
          Short forms, prices, sizes and areas come out the way a person in Pakistan would say them. Teach it your own
          names once, and it says them right on every call.
        </p>
      </div>
    </div>
  );
}
