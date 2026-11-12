// "What Callen handles": three kinds of call. Picking one on the left
// shows a short sample of that call on the right, with what it produced.

"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check } from "lucide-react";
import {
  Bubble, ScriptToggle, StatusPill, TicketRows,
  type Script, type TicketRow, type Turn,
} from "@/components/landing/call-parts";
import { cn } from "@/lib/utils";

type Scenario = {
  id: string;
  label: string;
  title: string;
  body: string;
  points: string[];
  turns: Turn[];
  ticketTitle: string;
  rows: TicketRow[];
  total?: string;
  status: string;
};

const SCENARIOS: Scenario[] = [
  {
    id: "orders",
    label: "Orders",
    title: "Delivery and takeaway, taken properly.",
    body: "Callen knows every item, size and price on your menu, and takes the order the way your best staff member would.",
    points: [
      "Asks for the address and checks it against your delivery areas",
      "Reads the full order and total back before confirming",
      "Works from your own minimum order, delivery fee and timings",
    ],
    turns: [
      {
        who: "caller",
        ur: "ایک چکن کڑاہی ہاف، چار نان اور ایک رائتہ، ٹیک اوے۔",
        roman: "Aik chicken karahi half, chaar naan aur aik raita, takeaway.",
      },
      {
        who: "agent",
        ur: "جی۔ چکن کڑاہی ہاف، چار نان اور ایک رائتہ۔ ٹوٹل سولہ سو چالیس روپے۔ بیس منٹ میں تیار ہو جائے گا۔ کس نام سے؟",
        roman:
          "Ji. Chicken karahi half, chaar naan aur aik raita. Total solah sau chaalees rupay. Bees minute mein tayyar ho jaye ga. Kis naam se?",
      },
      { who: "caller", ur: "عمران کے نام سے۔", roman: "Imran ke naam se." },
    ],
    ticketTitle: "Takeaway order",
    rows: [
      { label: "1 × Chicken Karahi (Half)", value: "1,250" },
      { label: "4 × Naan", value: "240" },
      { label: "1 × Raita", value: "150" },
    ],
    total: "PKR 1,640",
    status: "Ready in 20 min · Imran",
  },
  {
    id: "deals",
    label: "Deals",
    title: "Every caller hears today's deal.",
    body: "Busy staff forget to mention the deal. Callen never does, and it offers the one that fits what the caller is ordering.",
    points: [
      "Add, change or pause a deal in seconds from your dashboard",
      "Suggests a drink or a side with the order, politely, once",
      "Says prices the way people say them: unnees sau ninanway",
    ],
    turns: [
      { who: "caller", ur: "آج کوئی ڈیل چل رہی ہے؟", roman: "Aaj koi deal chal rahi hai?" },
      {
        who: "agent",
        ur: "جی بالکل۔ آج فیملی ڈیل ہے: دو میڈیم پیزا اور ڈیڑھ لیٹر ڈرنک صرف انیس سو ننانوے روپے میں۔",
        roman:
          "Ji bilkul. Aaj family deal hai: do medium pizza aur dairh litre drink sirf unnees sau ninanway rupay mein.",
      },
      { who: "caller", ur: "ٹھیک ہے، یہی کر دیں۔", roman: "Theek hai, yehi kar dein." },
      {
        who: "agent",
        ur: "ہو گیا۔ ساتھ گارلک بریڈ صرف دو سو روپے میں لیں گے؟",
        roman: "Ho gaya. Saath garlic bread sirf do sau rupay mein lein ge?",
      },
    ],
    ticketTitle: "Order with deal",
    rows: [
      { label: "1 × Family Deal", value: "1,999", tag: "Deal" },
      { label: "2 medium pizzas, 1.5 L drink" },
      { label: "Garlic bread", value: "200", tag: "Offered" },
    ],
    total: "PKR 1,999",
    status: "Deal applied",
  },
  {
    id: "questions",
    label: "Questions and bookings",
    title: "Timings, areas and tables, without tying up staff.",
    body: "Half of all calls are the same few questions. Callen answers them from the restaurant info, policies and FAQs you give it.",
    points: [
      "Opening hours, branches, delivery areas and charges",
      "Takes table bookings with the day, time and number of guests",
      "Says so plainly when it does not know, and never makes things up",
    ],
    turns: [
      {
        who: "caller",
        ur: "آپ جی الیون میں ڈیلیوری کرتے ہیں؟ اور کب تک کھلے ہیں؟",
        roman: "Aap G-11 mein delivery karte hain? Aur kab tak khule hain?",
      },
      {
        who: "agent",
        ur: "جی، جی الیون میں ڈیلیوری ہوتی ہے، چارجز ایک سو روپے ہیں۔ ہم رات دو بجے تک کھلے ہیں۔",
        roman: "Ji, G-11 mein delivery hoti hai, charges aik sau rupay hain. Hum raat do bajay tak khule hain.",
      },
      {
        who: "caller",
        ur: "ہفتے کی رات آٹھ بجے چھ لوگوں کی ٹیبل مل جائے گی؟",
        roman: "Haftay ki raat aath bajay chhe logon ki table mil jaye gi?",
      },
      {
        who: "agent",
        ur: "جی، ہفتہ رات آٹھ بجے، چھ افراد۔ کس نام سے بکنگ کروں؟",
        roman: "Ji, hafta raat aath bajay, chhe afraad. Kis naam se booking karoon?",
      },
    ],
    ticketTitle: "Answered from your info",
    rows: [
      { label: "Delivery to G-11", value: "Yes · PKR 100" },
      { label: "Open until", value: "2:00 am" },
      { label: "Table request", value: "Sat 8 pm · 6 guests" },
    ],
    status: "Booking details taken",
  },
];

export function CallScenarios() {
  const [activeId, setActiveId] = useState(SCENARIOS[0].id);
  const [script, setScript] = useState<Script>("ur");
  const active = SCENARIOS.find((s) => s.id === activeId) ?? SCENARIOS[0];

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:gap-16">
      {/* Left: the three kinds of call */}
      <div className="space-y-3">
        {SCENARIOS.map((s, i) => {
          const open = s.id === active.id;
          return (
            <button
              key={s.id}
              type="button"
              aria-expanded={open}
              onClick={() => setActiveId(s.id)}
              className={cn(
                "block w-full rounded-3xl border p-6 text-left transition-all duration-300 lg:p-7",
                open
                  ? "border-brand-200 bg-white shadow-xl shadow-brand-950/5"
                  : "border-transparent hover:border-sand-300 hover:bg-white/60"
              )}
            >
              <div className="flex items-baseline gap-4">
                <span
                  className={cn(
                    "font-display text-2xl tabular-nums transition-colors",
                    open ? "text-saffron-600" : "text-neutral-400"
                  )}
                >
                  0{i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">{s.label}</p>
                  <h3 className="mt-1.5 font-display text-2xl leading-tight tracking-[-0.01em] text-neutral-950 lg:text-[1.7rem]">
                    {s.title}
                  </h3>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.2, 0.65, 0.3, 0.9] }}
                        className="overflow-hidden"
                      >
                        <p className="pt-3 text-[15px] leading-relaxed text-neutral-600">{s.body}</p>
                        <ul className="space-y-2 pt-4">
                          {s.points.map((point) => (
                            <li key={point} className="flex gap-2.5 text-[15px] leading-relaxed text-neutral-700">
                              <Check className="mt-1 size-4 shrink-0 text-brand-600" strokeWidth={2.5} />
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Right: the sample call */}
      <div className="lg:sticky lg:top-24">
        <div className="overflow-hidden rounded-3xl bg-white shadow-2xl shadow-brand-950/10 ring-1 ring-sand-200">
          <div className="flex items-center justify-between gap-3 border-b border-sand-200 px-5 py-3.5">
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <span className="size-1.5 animate-pulse rounded-full bg-brand-500" />
              <span className="font-medium text-neutral-800">Sample call</span>
              <span>· {active.label}</span>
            </div>
            <ScriptToggle value={script} onChange={setScript} />
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <div className="space-y-2.5 px-5 py-5">
                {active.turns.map((turn, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.08 + i * 0.1 }}
                  >
                    <Bubble turn={turn} script={script} agentName="Ayesha · AI agent" />
                  </motion.div>
                ))}
              </div>

              <div className="border-t border-sand-200 bg-sand-50 px-5 py-5">
                <div className="mb-3.5 flex items-center justify-between gap-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
                    {active.ticketTitle}
                  </p>
                  <StatusPill done>{active.status}</StatusPill>
                </div>
                <TicketRows rows={active.rows} />
                {active.total && (
                  <div className="mt-3.5 flex items-baseline justify-between border-t border-dashed border-sand-300 pt-3">
                    <span className="text-xs font-medium text-neutral-500">Total</span>
                    <span className="text-base font-semibold tabular-nums tracking-tight">{active.total}</span>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
