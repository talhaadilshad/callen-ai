// Two cards that play together: a call on the left, the order ticket it
// produces on the right. As each line of the call lands, the matching row
// appears on the ticket. Loops while it is on screen.

"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { Check, MapPin, Wallet } from "lucide-react";
import { GrainSurface } from "@/components/brand/orb";
import { cn } from "@/lib/utils";

const CHAT = [
  { agent: false, text: "Ek zinger burger aur ek large pizza." },
  { agent: true, text: "Ji bilkul. Pizza kaun sa pasand karein ge?" },
  { agent: false, text: "Chicken tikka. Delivery DHA Phase 6." },
  { agent: true, text: "Total 2,300 rupay, cash on delivery. Confirm kar doon?" },
  { agent: false, text: "Ji, kar dein." },
];

// Each ticket row appears once the call has reached line `at`.
const ITEMS = [
  { at: 1, name: "1 × Zinger Burger", price: 650 },
  { at: 3, name: "1 × Chicken Tikka Pizza (Large)", price: 1650 },
];

const LAST = CHAT.length + 1; // one extra beat for "confirmed"

export function OrderDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-120px" });
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const t = setTimeout(() => setStep((s) => (s >= LAST ? 0 : s + 1)), step >= LAST ? 3600 : step === 0 ? 700 : 1500);
    return () => clearTimeout(t);
  }, [inView, step]);

  const items = ITEMS.filter((item) => step >= item.at);
  const total = items.reduce((sum, item) => sum + item.price, 0);
  const hasAddress = step >= 3;
  const hasPayment = step >= 4;
  const confirmed = step >= LAST;

  return (
    <div ref={ref} className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      {/* The call */}
      <GrainSurface palette="ocean" className="flex min-h-[28rem] flex-col rounded-3xl p-6 text-white">
        <div className="flex flex-1 flex-col justify-end gap-2.5 pb-8 pt-2 text-[15px]">
          <AnimatePresence initial={false}>
            {CHAT.slice(0, Math.min(step, CHAT.length)).map((line, i) => (
              <motion.p
                key={i}
                layout
                initial={{ opacity: 0, y: 14, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                transition={{ duration: 0.4, ease: [0.2, 0.65, 0.3, 0.9] }}
                className={cn(
                  "w-fit max-w-[82%] rounded-2xl px-4 py-2.5",
                  line.agent ? "bg-white text-black" : "ml-auto border border-white/50 backdrop-blur-sm"
                )}
              >
                {line.text}
              </motion.p>
            ))}
            {confirmed && (
              <motion.p
                key="done"
                layout
                initial={{ opacity: 0, y: 14, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                className="flex w-fit items-center gap-2 rounded-full bg-white px-3.5 py-2 text-sm text-black"
              >
                <span className="flex size-5 items-center justify-center rounded-full bg-black text-white">
                  <Check className="size-3" strokeWidth={3} />
                </span>
                Order confirmed
              </motion.p>
            )}
          </AnimatePresence>
        </div>
        <div>
          <h3 className="text-[15px] text-white/75">Order taking</h3>
          <p className="mt-1.5 text-[15px] leading-relaxed">
            Delivery and takeaway orders in everyday Urdu. The address, the payment and the total are read back before
            the order is confirmed.
          </p>
        </div>
      </GrainSurface>

      {/* The ticket */}
      <div className="flex min-h-[28rem] flex-col rounded-3xl border border-hairline bg-shell p-6">
        <div className="flex flex-1 items-center justify-center py-4">
          <div className="w-full max-w-sm rounded-2xl border border-hairline bg-white p-5 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)]">
            <div className="mb-4 flex items-center justify-between text-sm">
              <span className="text-black">Order ticket</span>
              <span
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs transition-colors duration-300",
                  confirmed ? "bg-black text-white" : "bg-shell text-ink-soft"
                )}
              >
                {!confirmed && <span className="size-1.5 animate-pulse rounded-full bg-black/50" />}
                {confirmed ? "Confirmed" : "On the call"}
              </span>
            </div>

            <ul className="min-h-[5.25rem] text-sm">
              <AnimatePresence initial={false}>
                {items.map((item) => (
                  <motion.li
                    key={item.name}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.35 }}
                    className="overflow-hidden"
                  >
                    <span className="flex justify-between gap-4 border-b border-dotted border-black/15 py-2.5">
                      <span>{item.name}</span>
                      <span className="tabular-nums text-ink-soft">{item.price.toLocaleString("en-PK")}</span>
                    </span>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>

            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-sm text-ink-soft">Total</span>
              <span className="text-2xl font-light tabular-nums tracking-[-0.01em]">
                PKR {total.toLocaleString("en-PK")}
              </span>
            </div>

            <div className="mt-4 space-y-2 border-t border-hairline pt-4 text-[13px]">
              <p className={cn("flex items-center gap-2 transition-colors duration-300", hasAddress ? "text-black" : "text-black/30")}>
                <MapPin className="size-3.5" strokeWidth={1.75} />
                {hasAddress ? "DHA Phase 6 · arrives in 35 to 40 min" : "Address"}
              </p>
              <p className={cn("flex items-center gap-2 transition-colors duration-300", hasPayment ? "text-black" : "text-black/30")}>
                <Wallet className="size-3.5" strokeWidth={1.75} />
                {hasPayment ? "Cash on delivery" : "Payment"}
              </p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-[15px] text-ink-soft">A clean order, every time</h3>
          <p className="mt-1.5 text-[15px] leading-relaxed text-black">
            Items, sizes, address and payment are captured the same way on every call, so the kitchen gets an order it
            can read.
          </p>
        </div>
      </div>
    </div>
  );
}
