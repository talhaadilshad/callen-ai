// Shared pieces for the sample calls on the landing page: a chat bubble
// that can show a line in Urdu script or Roman Urdu, the switch between
// the two, and the small "ticket" that shows what the call produced.

"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type Script = "ur" | "roman";

export type Turn = {
  who: "agent" | "caller";
  ur: string;
  roman: string;
};

export type TicketRow = {
  label: string;
  value?: string;
  tag?: string;
};

export function ScriptToggle({
  value,
  onChange,
  className,
}: {
  value: Script;
  onChange: (next: Script) => void;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label="Show the call in Urdu script or Roman Urdu"
      className={cn("inline-flex items-center rounded-full bg-sand-100 p-0.5 text-xs font-medium", className)}
    >
      <button
        type="button"
        aria-pressed={value === "ur"}
        onClick={() => onChange("ur")}
        className={cn(
          "rounded-full px-3 pb-1.5 pt-0.5 font-urdu text-[13px] leading-[1.9] transition-colors",
          value === "ur" ? "bg-white text-brand-800 shadow-sm" : "text-neutral-500 hover:text-neutral-800"
        )}
      >
        اردو
      </button>
      <button
        type="button"
        aria-pressed={value === "roman"}
        onClick={() => onChange("roman")}
        className={cn(
          "rounded-full px-3 py-1.5 transition-colors",
          value === "roman" ? "bg-white text-brand-800 shadow-sm" : "text-neutral-500 hover:text-neutral-800"
        )}
      >
        Roman
      </button>
    </div>
  );
}

export function Bubble({
  turn,
  script,
  agentName,
}: {
  turn: Turn;
  script: Script;
  agentName: string;
}) {
  const agent = turn.who === "agent";
  return (
    <div className={cn("flex", agent ? "justify-start" : "justify-end")}>
      <div
        className={cn(
          "max-w-[86%] rounded-2xl px-3.5 py-2 text-left",
          agent ? "rounded-bl-md bg-sand-100 text-neutral-900" : "rounded-br-md bg-brand-700 text-white"
        )}
      >
        <p
          className={cn(
            "mb-0.5 text-[9px] font-semibold uppercase tracking-widest",
            agent ? "text-brand-700" : "text-white/60"
          )}
        >
          {agent ? agentName : "Caller"}
        </p>
        {script === "ur" ? (
          <p dir="rtl" lang="ur" className="font-urdu text-[15px] leading-[2.15]">
            {turn.ur}
          </p>
        ) : (
          <p className="text-[13px] leading-snug">{turn.roman}</p>
        )}
      </div>
    </div>
  );
}

export function TicketRows({ rows }: { rows: TicketRow[] }) {
  return (
    <ul className="space-y-2.5">
      {rows.map((row) => (
        <li key={row.label} className="flex items-start justify-between gap-3 text-[13px] leading-snug">
          <span className="text-neutral-800">
            {row.label}
            {row.tag && (
              <span className="ml-1.5 inline-block rounded-full bg-saffron-200 px-1.5 py-px align-middle text-[9px] font-semibold uppercase tracking-wider text-neutral-900">
                {row.tag}
              </span>
            )}
          </span>
          {row.value && <span className="shrink-0 tabular-nums text-neutral-600">{row.value}</span>}
        </li>
      ))}
    </ul>
  );
}

export function StatusPill({ done, children }: { done: boolean; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors",
        done ? "bg-brand-100 text-brand-800" : "bg-saffron-100 text-neutral-800"
      )}
    >
      {done ? (
        <Check className="size-3" strokeWidth={3} />
      ) : (
        <span className="size-1.5 animate-pulse rounded-full bg-saffron-500" />
      )}
      {children}
    </span>
  );
}
