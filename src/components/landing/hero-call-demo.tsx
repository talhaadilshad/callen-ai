// The hero's sample call: an Urdu delivery order that plays out line by
// line on the left while the order ticket fills in on the right. The
// restaurant is made up ("Karachi Bites"), so no real brand is implied.

"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Clock, MapPin, Phone, Wallet } from "lucide-react";
import { Waveform } from "@/components/waveform";
import { Bubble, ScriptToggle, StatusPill, type Script, type Turn } from "@/components/landing/call-parts";

const SCRIPT: Turn[] = [
  {
    who: "agent",
    ur: "السلام علیکم، کراچی بائٹس! میں عائشہ بات کر رہی ہوں۔ جی فرمائیے، کیا آرڈر کریں گے؟",
    roman: "Assalam o alaikum, Karachi Bites! Main Ayesha baat kar rahi hoon. Ji farmaiye, kya order karein ge?",
  },
  {
    who: "caller",
    ur: "ایک لارج چکن تکہ پیزا اور ایک زنگر برگر۔",
    roman: "Aik large chicken tikka pizza aur aik zinger burger.",
  },
  {
    who: "agent",
    ur: "جی بالکل۔ ساتھ میں ڈیڑھ لیٹر کولڈ ڈرنک صرف ڈیڑھ سو روپے میں، شامل کر دوں؟",
    roman: "Ji bilkul. Saath mein dairh litre cold drink sirf dairh sau rupay mein, shamil kar doon?",
  },
  {
    who: "caller",
    ur: "ہاں، کر دیں۔ ڈی ایچ اے فیز چھ، مکان نمبر بیالیس، گلی نو۔",
    roman: "Haan, kar dein. DHA Phase 6, makaan number bayalees, gali nau.",
  },
  {
    who: "agent",
    ur: "ٹھیک ہے۔ ایک لارج چکن تکہ پیزا، ایک زنگر برگر اور ڈیڑھ لیٹر ڈرنک۔ ٹوٹل ساڑھے چوبیس سو روپے، کیش آن ڈیلیوری۔",
    roman:
      "Theek hai. Aik large chicken tikka pizza, aik zinger burger aur dairh litre drink. Total saarhe chaubees sau rupay, cash on delivery.",
  },
  {
    who: "agent",
    ur: "آرڈر کنفرم ہو گیا۔ پینتیس سے چالیس منٹ میں پہنچ جائے گا۔ شکریہ!",
    roman: "Order confirm ho gaya. Paintees se chaalees minute mein pohanch jaye ga. Shukriya!",
  },
];

// Each ticket line appears once the call has reached turn `after`.
const ITEMS = [
  { after: 2, qty: 1, name: "Chicken Tikka Pizza (Large)", price: 1650 },
  { after: 2, qty: 1, name: "Zinger Burger", price: 650 },
  { after: 4, qty: 1, name: "Cold drink 1.5 L", price: 150, tag: "Deal" },
];

const pkr = (n: number) => `PKR ${n.toLocaleString("en-PK")}`;

export function HeroCallDemo() {
  const reduceMotion = useReducedMotion();
  const [script, setScript] = useState<Script>("ur");
  // Two turns are visible from the start so the card never looks empty.
  const [shown, setShown] = useState(2);
  const [round, setRound] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    if (shown >= SCRIPT.length) {
      const t = setTimeout(() => {
        setShown(1);
        setRound((r) => r + 1);
      }, 5200);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setShown((n) => n + 1), 2400);
    return () => clearTimeout(t);
  }, [shown, reduceMotion]);

  const visibleCount = reduceMotion ? SCRIPT.length : shown;
  const turns = SCRIPT.slice(0, visibleCount);
  const items = ITEMS.filter((item) => visibleCount >= item.after);
  const total = items.reduce((sum, item) => sum + item.qty * item.price, 0);
  const hasAddress = visibleCount >= 4;
  const confirmed = visibleCount >= SCRIPT.length;
  const seconds = Math.min(59, visibleCount * 9);

  return (
    <div className="overflow-hidden rounded-3xl bg-white text-left text-neutral-950 shadow-2xl shadow-black/40 ring-1 ring-black/5">
      {/* Call header */}
      <div className="flex items-center gap-3 border-b border-sand-200 px-4 py-3.5 sm:px-5">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-700 text-white">
          <Phone className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold tracking-tight">Karachi Bites · order line</p>
          <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-neutral-500">
            <span className="size-1.5 animate-pulse rounded-full bg-brand-500" />
            <span>
              Live call · 00:{seconds.toString().padStart(2, "0")} · answered by Ayesha
            </span>
          </div>
        </div>
        <Waveform bars={10} maxHeight={18} barWidth={2} intensity={2} barClassName="bg-brand-500" className="hidden shrink-0 sm:flex" />
        <ScriptToggle value={script} onChange={setScript} className="shrink-0" />
      </div>

      <div className="grid md:grid-cols-[minmax(0,1fr)_17.5rem]">
        {/* Transcript */}
        <div className="relative flex h-[400px] flex-col justify-end gap-2.5 overflow-hidden px-4 py-5 sm:px-5">
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-12 bg-gradient-to-b from-white to-transparent" />
          <AnimatePresence mode="popLayout" initial={false}>
            {turns.map((turn, i) => (
              <motion.div
                key={`${round}-${i}`}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.2, 0.65, 0.3, 0.9] }}
              >
                <Bubble turn={turn} script={script} agentName="Ayesha · AI agent" />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Order ticket */}
        <div className="flex flex-col border-t border-sand-200 bg-sand-50 px-5 py-5 md:border-l md:border-t-0">
          <div className="mb-4 flex items-center justify-between gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">Order ticket</p>
            <StatusPill done={confirmed}>{confirmed ? "Confirmed" : "Taking order"}</StatusPill>
          </div>

          <ul className="min-h-[6.5rem] space-y-2.5">
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <motion.li
                  key={`${round}-${item.name}`}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="flex items-start justify-between gap-3 text-[13px] leading-snug"
                >
                  <span className="text-neutral-800">
                    {item.qty} × {item.name}
                    {item.tag && (
                      <span className="ml-1.5 inline-block rounded-full bg-saffron-200 px-1.5 py-px align-middle text-[9px] font-semibold uppercase tracking-wider text-neutral-900">
                        {item.tag}
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 tabular-nums text-neutral-600">{item.price.toLocaleString("en-PK")}</span>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>

          <div className="mt-4 flex items-baseline justify-between border-t border-dashed border-sand-300 pt-3.5">
            <span className="text-xs font-medium text-neutral-500">Total</span>
            <span className="text-lg font-semibold tabular-nums tracking-tight">{pkr(total)}</span>
          </div>

          <dl className="mt-4 space-y-2 text-xs text-neutral-600">
            <div className="flex items-start gap-2">
              <MapPin className="mt-px size-3.5 shrink-0 text-brand-600" />
              <dd className={hasAddress ? "" : "text-neutral-400"}>
                {hasAddress ? "House 42, Street 9, DHA Phase 6" : "Waiting for the address"}
              </dd>
            </div>
            <div className="flex items-start gap-2">
              <Wallet className="mt-px size-3.5 shrink-0 text-brand-600" />
              <dd className={visibleCount >= 5 ? "" : "text-neutral-400"}>
                {visibleCount >= 5 ? "Cash on delivery" : "Payment not asked yet"}
              </dd>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="mt-px size-3.5 shrink-0 text-brand-600" />
              <dd className={confirmed ? "" : "text-neutral-400"}>
                {confirmed ? "Arrives in 35 to 40 minutes" : "Delivery time to confirm"}
              </dd>
            </div>
          </dl>

          <p className="mt-auto pt-5 text-[11px] leading-relaxed text-neutral-400">
            A sample call. Karachi Bites is a made-up restaurant.
          </p>
        </div>
      </div>
    </div>
  );
}
