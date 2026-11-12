// Callen's brand visual: a textured gradient orb. The site itself stays
// black, white and neutral grey; colour only ever appears inside these
// orbs and the grain surfaces below. Each agent voice has its own orb.
//
// How it is drawn (all inline SVG, no image files):
//   1. a handful of saturated colour blobs on a base colour
//   2. a turbulence + displacement filter that warps the blobs into liquid,
//      marbled swirls (each palette has its own seed, so no two match)
//   3. fine film grain on top
//   4. a fixed highlight and edge shade, so it reads as a lit sphere while
//      the texture underneath turns slowly

import { useId, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type OrbPalette = "ember" | "ocean" | "lilac" | "moss" | "rose" | "dusk" | "sun" | "mint";

type Palette = {
  base: string;
  // light, deep, pale, vivid, dark
  blobs: [string, string, string, string, string];
  seed: number;
};

const PALETTES: Record<OrbPalette, Palette> = {
  ember: { base: "#f2551c", blobs: ["#ffb347", "#b5170a", "#ffe6bf", "#ff7a1a", "#6f0d07"], seed: 3 },
  ocean: { base: "#2f7fc4", blobs: ["#8fe3ea", "#12409c", "#e2f6ee", "#3fb0d9", "#0a1f5c"], seed: 11 },
  lilac: { base: "#a48cff", blobs: ["#ffb3ec", "#5b54e6", "#ffe4f1", "#7fb6ff", "#3a2a9c"], seed: 7 },
  moss:  { base: "#5fa64a", blobs: ["#f0e36a", "#1d6b45", "#dff3c9", "#ffb347", "#0f3d2c"], seed: 19 },
  rose:  { base: "#f0607f", blobs: ["#ffc09a", "#c22a6c", "#ffe6da", "#ff8f6b", "#6b1f6e"], seed: 23 },
  dusk:  { base: "#8f8a94", blobs: ["#f2b59a", "#6f86c4", "#ece7e2", "#c98f8a", "#34323f"], seed: 5 },
  sun:   { base: "#f4a91f", blobs: ["#fff0a8", "#ee6f12", "#fff8dc", "#ffc94a", "#a8400c"], seed: 29 },
  mint:  { base: "#3fb99b", blobs: ["#c9f7d8", "#177f8f", "#f5fbc4", "#6fd6c1", "#0d4b55"], seed: 13 },
};

function Texture({
  palette,
  className,
  soft = false,
}: {
  palette: OrbPalette;
  className?: string;
  // Softer, larger swirls for wide surfaces.
  soft?: boolean;
}) {
  const id = useId();
  const p = PALETTES[palette];
  const [light, deep, pale, vivid, dark] = p.blobs;
  return (
    <svg
      viewBox="0 0 200 200"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden
      focusable="false"
    >
      <defs>
        <filter id={id} x="-30%" y="-30%" width="160%" height="160%" colorInterpolationFilters="sRGB">
          {/* 1. warp the blobs into organic shapes */}
          <feTurbulence type="fractalNoise" baseFrequency={soft ? 0.006 : 0.01} numOctaves={2} seed={p.seed} result="warpNoise" />
          <feDisplacementMap in="SourceGraphic" in2="warpNoise" scale={soft ? 110 : 84} xChannelSelector="R" yChannelSelector="G" result="warped" />
          {/* 2. melt them into one smooth gradient */}
          <feGaussianBlur in="warped" stdDeviation={soft ? 24 : 15} result="smooth" />
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
        <circle cx="52" cy="50" r="64" fill={light} />
        <circle cx="158" cy="62" r="60" fill={deep} />
        <circle cx="84" cy="156" r="66" fill={vivid} />
        <circle cx="166" cy="160" r="50" fill={dark} />
        <ellipse cx="112" cy="96" rx="22" ry="40" fill={pale} transform="rotate(28 112 96)" />
        <circle cx="30" cy="140" r="34" fill={deep} />
      </g>
    </svg>
  );
}

export function Orb({
  palette = "ember",
  size,
  active = false,
  className,
  style,
}: {
  palette?: OrbPalette;
  // Pixel size. Leave out to size it with classes (e.g. "size-40").
  size?: number;
  // True while this orb is "speaking": it breathes.
  active?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      aria-hidden
      className={cn("relative shrink-0 overflow-hidden rounded-full", active && "orb-breathe", className)}
      style={{ width: size, height: size, backgroundColor: PALETTES[palette].base, ...style }}
    >
      <Texture palette={palette} className="orb-drift absolute inset-0 size-full" />
      <div className="grain-overlay absolute inset-0" />
      {/* fixed light: highlight top left, soft shade round the edge */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 24%, rgba(255,255,255,0.42), transparent 44%), radial-gradient(circle at 50% 50%, transparent 58%, rgba(0,0,0,0.20) 100%)",
          boxShadow: "inset 0 -6px 18px rgba(0,0,0,0.10), inset 0 0 0 1px rgba(255,255,255,0.10)",
        }}
      />
    </div>
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
    <div className={cn("relative overflow-hidden", className)} style={{ backgroundColor: PALETTES[palette].base }}>
      <Texture palette={palette} soft className="absolute inset-0 size-full scale-125" />
      <div aria-hidden className="grain-overlay absolute inset-0" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-black/5" />
      <div className="relative h-full">{children}</div>
    </div>
  );
}
