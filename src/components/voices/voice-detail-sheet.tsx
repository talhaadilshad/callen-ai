// Voice detail sheet — opens on card click.
// Big preview, sample script panel, voice settings sliders (visual only),
// "Assign to agent" picker, and a primary "Use this voice" CTA.

"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Sparkles, Copy, Check } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { VoicePreview } from "./voice-preview";
import type { Voice } from "@/lib/voice-library";
import { agentTemplates } from "@/lib/agent-templates";

const LANGUAGE_FLAG: Record<string, string> = {
  Urdu: "🇵🇰",
  English: "🇺🇸",
  "Urdu + English": "🇵🇰",
};

type Props = {
  voice: Voice | null;
  onOpenChange: (open: boolean) => void;
};

export function VoiceDetailSheet({ voice, onOpenChange }: Props) {
  const [stability, setStability] = useState(60);
  const [similarity, setSimilarity] = useState(75);
  const [style, setStyle] = useState(30);
  const [agentId, setAgentId] = useState<string>(agentTemplates[0]?.id ?? "");
  const [copied, setCopied] = useState(false);

  if (!voice) return null;

  const flag = LANGUAGE_FLAG[voice.language] ?? "🌐";

  function copySample() {
    if (!voice) return;
    navigator.clipboard.writeText(voice.sample);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  }

  function assign() {
    if (!voice) return;
    const template = agentTemplates.find((t) => t.id === agentId);
    toast.success(`${voice.name} assigned to ${template?.name ?? "agent"}`);
    onOpenChange(false);
  }

  return (
    <Sheet open={!!voice} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="!w-full sm:!max-w-md md:!max-w-lg flex flex-col p-0"
      >
        {/* Header band with big preview */}
        <div className="relative px-6 pt-7 pb-5 border-b border-neutral-200">
          <SheetHeader className="p-0 mb-4">
            <SheetTitle className="sr-only">{voice.name}</SheetTitle>
            <SheetDescription className="sr-only">
              {voice.tagline}
            </SheetDescription>
          </SheetHeader>

          <div className="flex items-start gap-4">
            <VoicePreview voice={voice} size="lg" />
            <div className="flex-1 min-w-0 pt-1">
              <div className="flex items-center gap-1.5">
                <h2 className="text-xl font-bold tracking-tight text-neutral-950 truncate">
                  {voice.name}
                </h2>
                {voice.premium && (
                  <Sparkles className="size-4 text-amber-500" />
                )}
              </div>
              <p className="text-[13px] text-neutral-600 mt-0.5 leading-snug">
                {voice.tagline}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-700">
                  <span aria-hidden>{flag}</span>
                  <span>{voice.language}</span>
                </span>
                <Pill>{voice.accent}</Pill>
                <Pill>{voice.gender}</Pill>
                <Pill>{voice.age}</Pill>
                <Pill>{voice.category}</Pill>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Sample script */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[11px] uppercase tracking-widest font-semibold text-neutral-500">
                Sample script
              </h3>
              <button
                type="button"
                onClick={copySample}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-600 hover:text-neutral-900"
              >
                {copied ? (
                  <>
                    <Check className="size-3" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="size-3" /> Copy
                  </>
                )}
              </button>
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
              <p
                dir="auto"
                lang="ur"
                className="text-[14px] leading-relaxed text-neutral-800 whitespace-pre-line"
              >
                {voice.sample}
              </p>
            </div>
          </section>

          {/* Use cases */}
          <section>
            <h3 className="text-[11px] uppercase tracking-widest font-semibold text-neutral-500 mb-2">
              Best for
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {voice.useCases.map((u) => (
                <Pill key={u}>{u}</Pill>
              ))}
            </div>
          </section>

          {/* Settings */}
          <section>
            <h3 className="text-[11px] uppercase tracking-widest font-semibold text-neutral-500 mb-3">
              Voice settings
            </h3>
            <div className="space-y-4">
              <Slider
                label="Stability"
                value={stability}
                onChange={setStability}
                hint="Higher is more consistent, lower is more expressive."
              />
              <Slider
                label="Similarity"
                value={similarity}
                onChange={setSimilarity}
                hint="How closely the model matches the original voice."
              />
              <Slider
                label="Style exaggeration"
                value={style}
                onChange={setStyle}
                hint="Push the persona harder. Keep low for utility calls."
              />
            </div>
          </section>

          {/* Assign to agent */}
          <section>
            <h3 className="text-[11px] uppercase tracking-widest font-semibold text-neutral-500 mb-2">
              Assign to
            </h3>
            <div className="relative">
              <select
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                className={cn(
                  "w-full appearance-none rounded-xl border border-neutral-200 bg-white",
                  "px-3 py-2.5 pr-9 text-[13px] text-neutral-900 font-medium",
                  "focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900"
                )}
              >
                {agentTemplates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-neutral-500 pointer-events-none" />
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-200 px-6 py-4 flex items-center justify-end gap-2">
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button className="rounded-full" onClick={assign}>
            Use this voice
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-700">
      {children}
    </span>
  );
}

function Slider({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  hint: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-[12px] font-medium text-neutral-800">
          {label}
        </label>
        <span className="text-[12px] tabular-nums text-neutral-500">
          {value}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1 appearance-none bg-neutral-200 rounded-full outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-neutral-950 [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-neutral-950 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
      />
      <p className="text-[11px] text-neutral-500 mt-1">{hint}</p>
    </div>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
