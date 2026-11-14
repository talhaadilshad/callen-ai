// The hero's voice orbs. The drawing and the motion live in orb-gl.ts
// (see there for what the orb does and why); this component only puts
// that on the page: it sizes the canvas, feeds in the voice level every
// frame, and stops working when the orb is off screen. With reduced motion
// turned on, the orb is drawn once and stays still.
//
// If WebGL is not available the ordinary SVG orb is shown instead.

"use client";

import { useEffect, useRef, useState } from "react";
import { Orb, speechLike, type OrbPalette } from "@/components/brand/orb";
import { createOrbGl, newOrbSim, orbSeed, stepOrbSim } from "@/components/brand/orb-gl";
import { cn } from "@/lib/utils";

export function LiveOrb({
  palette = "ember",
  active = false,
  level,
  className,
}: {
  palette?: OrbPalette;
  // True while this orb's voice is speaking.
  active?: boolean;
  // The voice level right now, 0 to 1. Return null (or leave it out) to
  // use a built-in speech-like rhythm.
  level?: () => number | null;
  className?: string;
}) {
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const [noGl, setNoGl] = useState(false);
  const live = useRef({ active, level });
  useEffect(() => {
    live.current = { active, level };
  });

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const orb = createOrbGl(el, palette);
    if (!orb) {
      setNoGl(true);
      return;
    }

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let onScreen = true;
    const seen = new IntersectionObserver(([entry]) => (onScreen = entry.isIntersecting));
    seen.observe(el);

    const sim = newOrbSim(orbSeed(palette));
    let raf = 0;
    let last = performance.now();
    let clock = 0;
    let drawn = false;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!onScreen) return;
      clock += dt;

      const speaking = live.current.active && !still;
      const measured = speaking ? live.current.level?.() : 0;
      stepOrbSim(sim, still ? 0 : dt, speaking ? (measured ?? speechLike(clock)) : 0);

      // keep the drawing buffer in step with the element's size
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const size = Math.max(2, Math.round(el.clientWidth * dpr));
      const resized = el.width !== size || el.height !== size;
      if (resized) {
        el.width = size;
        el.height = size;
      }

      // The orb is always turning, so it is drawn every frame while it is on
      // screen. With reduced motion nothing moves: draw it once, and again
      // only if its size changes.
      if (still && drawn && !resized) return;
      orb.draw(sim);
      drawn = true;
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      seen.disconnect();
      orb.dispose();
    };
  }, [palette]);

  if (noGl) return <Orb palette={palette} active={active} level={level} className={className} />;

  return (
    <span aria-hidden className={cn("relative block shrink-0 rounded-full [container-type:size]", className)}>
      {/* soft neutral shadow on the "floor" under the sphere */}
      <span
        className="absolute rounded-[50%]"
        style={{ left: "14cqw", right: "14cqw", bottom: "-9cqw", height: "22cqw", backgroundColor: "#000", filter: "blur(9cqw)", opacity: 0.16 }}
      />
      <canvas ref={canvas} className="absolute inset-0 size-full rounded-full" />
    </span>
  );
}
