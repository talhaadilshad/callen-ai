// Callen's brand visual: a textured, lit gradient orb. The site itself
// stays black, white and neutral grey; colour only ever appears inside
// these orbs and the grain surfaces below. Each agent voice has its own,
// and each section of the site that uses a surface has its own colour:
// ocean (order demo), ember (cost calculator), forest (two nights),
// plum (featured plan), ember (the brand orb).
//
// How it is drawn (all inline SVG and CSS, no image files):
//   1. saturated colour blobs, warped by a turbulence filter and melted
//      into one clouded gradient (each palette has its own seed)
//   2. fine film grain
//   3. lighting that makes it a sphere: a lit side, a shaded side, darker
//      edges, a soft rim of light and a neutral shadow on the "floor"
//
// Speaking (`active`): the liquid inside is moved by a small simulation,
// not a looping animation. It follows a voice level, from 0 (silence) to 1:
//   - the louder the voice, the faster the colours circle the centre and
//     the further they are pushed out, so every syllable shows
//   - the warp that shapes the liquid deepens and drifts with the level
//   - when the voice stops, the liquid coasts to rest where it is. Nothing
//     resets, so the orb never jumps back to a starting picture
// The level comes from `level()` (the real audio, when the caller has it)
// or, without one, from a built-in speech-like rhythm.
//
// Sizes inside use container-query units (cqw), so the lighting and
// shadows scale with the orb, from a 12px dot to a 240px hero orb.

"use client";

import { useEffect, useId, useRef, type CSSProperties, type ReactNode, type RefObject } from "react";
import { cn } from "@/lib/utils";

export type OrbPalette =
  | "ember" | "ocean" | "lilac" | "moss" | "rose" | "dusk" | "sun" | "mint"
  // deeper palettes, made for large surfaces with white text on top
  | "berry" | "forest" | "plum";

type Palette = {
  base: string;
  // light, deep, pale, vivid, dark
  blobs: [string, string, string, string, string];
  seed: number;
};

export const ORB_PALETTES: Record<OrbPalette, Palette> = {
  ember: { base: "#f2551c", blobs: ["#ffb347", "#b5170a", "#ffe6bf", "#ff7a1a", "#6f0d07"], seed: 3 },
  ocean: { base: "#2f7fc4", blobs: ["#8fe3ea", "#12409c", "#e2f6ee", "#3fb0d9", "#0a1f5c"], seed: 11 },
  lilac: { base: "#a48cff", blobs: ["#ffb3ec", "#5b54e6", "#ffe4f1", "#7fb6ff", "#3a2a9c"], seed: 7 },
  moss:  { base: "#5fa64a", blobs: ["#f0e36a", "#1d6b45", "#dff3c9", "#ffb347", "#0f3d2c"], seed: 19 },
  rose:  { base: "#f0607f", blobs: ["#ffc09a", "#c22a6c", "#ffe6da", "#ff8f6b", "#6b1f6e"], seed: 23 },
  dusk:  { base: "#8f8a94", blobs: ["#f2b59a", "#6f86c4", "#ece7e2", "#c98f8a", "#34323f"], seed: 5 },
  sun:   { base: "#f4a91f", blobs: ["#fff0a8", "#ee6f12", "#fff8dc", "#ffc94a", "#a8400c"], seed: 29 },
  mint:  { base: "#3fb99b", blobs: ["#c9f7d8", "#177f8f", "#f5fbc4", "#6fd6c1", "#0d4b55"], seed: 13 },
  berry:  { base: "#d6396a", blobs: ["#ff9a78", "#9a1650", "#ffd4c2", "#ff5a8c", "#560f48"], seed: 31 },
  forest: { base: "#1f8a6b", blobs: ["#7fe0ae", "#0d5a52", "#e2f5b4", "#2fb389", "#063a36"], seed: 17 },
  plum:   { base: "#6a40d2", blobs: ["#b58cff", "#3a1a9a", "#eec6ff", "#de55c6", "#1c0f5a"], seed: 37 },
};

// The six colour blobs, in the orb's own 200-unit drawing space.
//   spin: how fast, and which way, it circles the centre when the voice
//         is at full level (radians a second)
//   push: how far a loud syllable throws it outward (share of its radius)
//   swell: how much a loud syllable enlarges it
//   wobble: its own slow rhythm, so no two blobs keep step
const BLOBS = [
  { cx: 52, cy: 50, spin: 1.15, push: 0.16, swell: 0.14, wobble: 0.71 },
  { cx: 158, cy: 62, spin: -0.85, push: 0.22, swell: 0.1, wobble: 1.13 },
  { cx: 84, cy: 156, spin: 1.5, push: 0.12, swell: 0.2, wobble: 0.53 },
  { cx: 166, cy: 160, spin: -0.62, push: 0.2, swell: 0.12, wobble: 0.89 },
  // the pale highlight near the middle: it barely travels, it breathes
  { cx: 112, cy: 96, spin: 0.3, push: 0.06, swell: 0.75, wobble: 1.37 },
  { cx: 30, cy: 140, spin: -1.25, push: 0.18, swell: 0.16, wobble: 0.61 },
] as const;

const BASE_WARP = 84;
const BASE_FREQ = 0.01;

// A speech-like level for orbs that have no real audio to follow: quick
// syllables, grouped into phrases, with the odd short pause.
export function speechLike(t: number) {
  const syllable = Math.max(0, Math.sin(t * 27 + 1.7 * Math.sin(t * 1.9)));
  const phrase = 0.6 + 0.4 * Math.sin(t * 2.8 + 0.6);
  const breath = Math.sin(t * 1.95) > -0.84 ? 1 : 0.08;
  return Math.min(1, (0.22 + 0.78 * syllable) * phrase * breath);
}

type Sim = {
  angle: number[];   // where each blob has got to around the centre
  fast: number;      // the level, following each syllable
  slow: number;      // the level, averaged: how energetic the speech is
  drift: number;     // how far the warp field has travelled
  t: number;
  last: number;
  raf: number;
  running: boolean;
};

// Moves the liquid. Starts when `active` turns on and stops itself once
// the voice has gone quiet and the liquid has come to rest.
function useLiquid(
  svg: RefObject<SVGSVGElement | null>,
  active: boolean,
  level?: () => number | null
) {
  const sim = useRef<Sim>({ angle: BLOBS.map(() => 0), fast: 0, slow: 0, drift: 0, t: 0, last: 0, raf: 0, running: false });
  const live = useRef({ active, level });
  useEffect(() => {
    live.current = { active, level };
  });

  useEffect(() => {
    if (!active || sim.current.running) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = svg.current;
    if (!root) return;
    const groups = Array.from(root.querySelectorAll<SVGGElement>("[data-blob]"));
    const warp = root.querySelector("feDisplacementMap");
    const noise = root.querySelector("feTurbulence");
    const s = sim.current;
    s.running = true;
    s.last = performance.now();

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - s.last) / 1000);
      s.last = now;
      s.t += dt;

      const speaking = live.current.active;
      const measured = speaking ? live.current.level?.() : 0;
      const target = speaking ? (measured ?? speechLike(s.t)) : 0;

      // The fast level jumps up with a syllable and falls away after it;
      // the slow one is the overall energy and takes longer both ways.
      const follow = (value: number, to: number, up: number, down: number) =>
        value + (to - value) * (1 - Math.exp(-dt / (to > value ? up : down)));
      s.fast = follow(s.fast, target, 0.045, 0.2);
      s.slow = follow(s.slow, target, 0.3, 0.85);

      // Flow: speed comes from the energy, with a kick on each syllable.
      const flow = s.slow * 0.75 + s.fast * 0.6;
      s.drift += dt * flow;

      for (let i = 0; i < groups.length; i++) {
        const b = BLOBS[i];
        const own = 0.7 + 0.45 * Math.sin(s.t * b.wobble + i * 1.9);
        s.angle[i] += dt * b.spin * flow * own;
        const out = 1 + b.push * s.fast * (0.6 + 0.4 * Math.sin(s.t * 3.1 + i));
        const size = 1 + b.swell * s.fast;
        const deg = (s.angle[i] * 180) / Math.PI;
        const dx = (b.cx - 100) * (out - 1);
        const dy = (b.cy - 100) * (out - 1);
        groups[i].setAttribute(
          "transform",
          `rotate(${deg.toFixed(2)} 100 100) translate(${(b.cx + dx).toFixed(2)} ${(b.cy + dy).toFixed(2)}) scale(${size.toFixed(3)}) translate(${-b.cx} ${-b.cy})`
        );
      }

      // The warp that shapes the liquid deepens with the level and its
      // pattern slides along, which is what makes it read as fluid.
      warp?.setAttribute("scale", (BASE_WARP + 46 * s.fast + 14 * s.slow).toFixed(1));
      noise?.setAttribute("baseFrequency", (BASE_FREQ + 0.0022 * Math.sin(s.drift * 1.3)).toFixed(5));

      if (!speaking && s.fast < 0.002 && s.slow < 0.002) {
        // Quiet and at rest: stop here, leaving everything where it is.
        s.running = false;
        return;
      }
      s.raf = requestAnimationFrame(frame);
    };
    s.raf = requestAnimationFrame(frame);
  }, [active, svg]);

  useEffect(() => {
    const s = sim.current;
    return () => {
      cancelAnimationFrame(s.raf);
      s.running = false;
    };
  }, []);
}

function Texture({
  palette,
  className,
  soft = false,
  svgRef,
}: {
  palette: OrbPalette;
  className?: string;
  // Softer, larger swirls for wide surfaces.
  soft?: boolean;
  svgRef?: RefObject<SVGSVGElement | null>;
}) {
  const id = useId();
  const p = ORB_PALETTES[palette];
  const [light, deep, pale, vivid, dark] = p.blobs;
  const fill = [light, deep, vivid, dark, pale, deep];
  return (
    <svg ref={svgRef} viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden focusable="false">
      <defs>
        <filter id={id} x="-30%" y="-30%" width="160%" height="160%" colorInterpolationFilters="sRGB">
          {/* 1. warp the blobs into organic shapes */}
          <feTurbulence type="fractalNoise" baseFrequency={soft ? 0.006 : BASE_FREQ} numOctaves={2} seed={p.seed} result="warpNoise" />
          <feDisplacementMap in="SourceGraphic" in2="warpNoise" scale={soft ? 110 : BASE_WARP} xChannelSelector="R" yChannelSelector="G" result="warped" />
          {/* 2. melt them into one smooth gradient */}
          <feGaussianBlur in="warped" stdDeviation={soft ? 24 : 14} result="smooth" />
          {/* 3. cloud the gradient a little, so it is never flat */}
          <feTurbulence type="fractalNoise" baseFrequency={soft ? 0.012 : 0.022} numOctaves={3} seed={p.seed + 1} result="cloud" />
          <feColorMatrix
            in="cloud"
            type="matrix"
            values="0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 0 1"
            result="cloudGrey"
          />
          <feBlend in="cloudGrey" in2="smooth" mode="soft-light" />
        </filter>
      </defs>
      <g filter={`url(#${id})`}>
        <rect x="-60" y="-60" width="320" height="320" fill={p.base} />
        {/* each blob sits in its own group so the simulation can move it */}
        {BLOBS.map((b, i) => (
          <g key={i} data-blob>
            {i === 4 ? (
              <ellipse cx={b.cx} cy={b.cy} rx="22" ry="40" fill={fill[i]} transform={`rotate(28 ${b.cx} ${b.cy})`} />
            ) : (
              <circle cx={b.cx} cy={b.cy} r={[64, 60, 66, 50, 0, 34][i]} fill={fill[i]} />
            )}
          </g>
        ))}
      </g>
    </svg>
  );
}

export function Orb({
  palette = "ember",
  size,
  active = false,
  level,
  className,
  style,
}: {
  palette?: OrbPalette;
  // Pixel size. Leave out to size it with classes (e.g. "size-40").
  size?: number;
  // True while this orb is "speaking".
  active?: boolean;
  // The voice level right now, 0 to 1, read every frame while speaking.
  // Return null (or leave it out) to use the built-in speech-like rhythm.
  level?: () => number | null;
  className?: string;
  style?: CSSProperties;
}) {
  const p = ORB_PALETTES[palette];
  const svg = useRef<SVGSVGElement | null>(null);
  useLiquid(svg, active, level);

  // Built from <span>s (not <div>s) so an orb is valid HTML inside a <p>,
  // a <button> or another <span>.
  return (
    <span
      aria-hidden
      className={cn("relative block shrink-0 rounded-full [container-type:size]", className)}
      style={{ width: size, height: size, ...style }}
    >
      {/* soft neutral shadow on the "floor" under the sphere */}
      <span
        className="absolute rounded-[50%]"
        style={{
          left: "14cqw",
          right: "14cqw",
          bottom: "-9cqw",
          height: "22cqw",
          backgroundColor: "#000",
          filter: "blur(9cqw)",
          opacity: 0.16,
        }}
      />

      <span className="absolute inset-0 overflow-hidden rounded-full" style={{ backgroundColor: p.base }}>
        {/* the gradient: turns very slowly; while speaking the liquid flows */}
        <Texture palette={palette} svgRef={svg} className="orb-drift absolute inset-0 size-full" />

        <span className="grain-overlay absolute inset-0" />

        {/* fixed lighting: lit top left, shaded bottom right, darker edge */}
        <span
          className="absolute inset-0 rounded-full"
          style={{
            backgroundImage: [
              "radial-gradient(circle at 31% 24%, rgba(255,255,255,0.62) 0%, rgba(255,255,255,0.16) 26%, transparent 48%)",
              "radial-gradient(circle at 72% 80%, rgba(0,0,0,0.40) 0%, transparent 56%)",
              "radial-gradient(circle at 50% 50%, transparent 60%, rgba(0,0,0,0.26) 100%)",
            ].join(", "),
            boxShadow:
              "inset 2cqw 3cqw 7cqw rgba(255,255,255,0.28), inset -4cqw -6cqw 12cqw rgba(0,0,0,0.26), inset 0 0 0 0.5cqw rgba(255,255,255,0.14)",
          }}
        />
        {/* soft specular spot */}
        <span
          className="absolute rounded-[50%]"
          style={{
            left: "20cqw",
            top: "13cqw",
            width: "26cqw",
            height: "15cqw",
            backgroundColor: "rgba(255,255,255,0.55)",
            filter: "blur(5cqw)",
            transform: "rotate(-24deg)",
          }}
        />
        {/* bounce light on the lower rim */}
        <span
          className="absolute inset-0 rounded-full"
          style={{ backgroundImage: "radial-gradient(circle at 62% 104%, rgba(255,255,255,0.30), transparent 34%)" }}
        />
      </span>
    </span>
  );
}

// A card filled with the same textured gradient, for the few places where
// a whole surface carries colour (a sample call, the featured plan).
export function GrainSurface({
  palette = "ocean",
  className,
  children,
}: {
  palette?: OrbPalette;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={cn("relative overflow-hidden", className)} style={{ backgroundColor: ORB_PALETTES[palette].base }}>
      <Texture palette={palette} soft className="absolute inset-0 size-full scale-125" />
      <div aria-hidden className="grain-overlay absolute inset-0" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-black/5" />
      <div className="relative h-full">{children}</div>
    </div>
  );
}
