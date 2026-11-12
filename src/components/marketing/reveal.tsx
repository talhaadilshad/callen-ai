// Scroll and load motion shared by the marketing pages.
//   <Reveal>       fades a block up as it scrolls into view
//   <WordsReveal>  brings a headline in word by word, from a soft blur

"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";

const EASE = [0.2, 0.65, 0.3, 0.9] as [number, number, number, number];

export function Reveal({
  children,
  delay = 0,
  y = 18,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.65, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function WordsReveal({
  text,
  className,
  delay = 0,
  onView = true,
}: {
  // Use "\n" for a line break.
  text: string;
  className?: string;
  delay?: number;
  // false = animate on page load (for the hero).
  onView?: boolean;
}) {
  const lines = text.split("\n");
  let index = 0;
  return (
    <span className={className} aria-label={text.replace(/\n/g, " ")}>
      {lines.map((line, li) => (
        <span key={li} className="block" aria-hidden>
          {line.split(" ").map((word) => {
            const i = index++;
            const animateTo = { opacity: 1, y: 0, filter: "blur(0px)" };
            return (
              <motion.span
                key={i}
                className="inline-block whitespace-pre"
                initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
                {...(onView
                  ? { whileInView: animateTo, viewport: { once: true, margin: "-70px" } }
                  : { animate: animateTo })}
                transition={{ duration: 0.6, delay: delay + i * 0.055, ease: EASE }}
              >
                {word + " "}
              </motion.span>
            );
          })}
        </span>
      ))}
    </span>
  );
}
