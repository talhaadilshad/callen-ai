// Callen.ai signature visual: animated voice waveform.
// Used in hero sections, loading states, and the dashboard live call console.

"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type WaveformProps = {
  bars?: number;
  className?: string;
  // Animation intensity: 0 = static, 1 = subtle, 2 = active speaking
  intensity?: 0 | 1 | 2;
  // Gradient: paint with Callen accent gradient
  gradient?: boolean;
  // Bar width in pixels
  barWidth?: number;
  // Max bar height in pixels
  maxHeight?: number;
};

export function Waveform({
  bars = 48,
  className,
  intensity = 1,
  gradient = false,
  barWidth = 3,
  maxHeight = 64,
}: WaveformProps) {
  // Generate heights that look organic (mix of mid + tall + short).
  // Values are rounded to whole pixels at render time so the server and
  // client serialize the exact same style strings (hydration-safe).
  const heights = Array.from({ length: bars }, (_, i) => {
    const phase = (i / bars) * Math.PI * 4;
    return 0.3 + 0.7 * Math.abs(Math.sin(phase) + Math.cos(phase * 1.7) * 0.4);
  });
  const px = (n: number) => Math.round(n);

  const animDuration = intensity === 0 ? 0 : intensity === 1 ? 1.2 : 0.6;

  return (
    <div
      className={cn("flex items-center justify-center gap-[2px]", className)}
      style={{ height: maxHeight }}
      aria-hidden="true"
    >
      {heights.map((h, i) => (
        <motion.div
          key={i}
          className={cn(
            "rounded-full",
            gradient
              ? "bg-gradient-to-t from-neutral-900 via-neutral-700 to-neutral-400"
              : "bg-foreground/80"
          )}
          style={{ width: `${barWidth}px` }}
          initial={{ height: px(h * maxHeight * 0.4) }}
          animate={
            intensity === 0
              ? { height: px(h * maxHeight) }
              : {
                  height: [
                    px(h * maxHeight * 0.35),
                    px(h * maxHeight),
                    px(h * maxHeight * 0.5),
                    px(h * maxHeight * 0.8),
                    px(h * maxHeight * 0.4),
                  ],
                }
          }
          transition={
            intensity === 0
              ? {}
              : {
                  duration: animDuration,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: (i / bars) * 0.4,
                }
          }
        />
      ))}
    </div>
  );
}
