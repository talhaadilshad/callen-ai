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
//      edges, a soft rim of light and a coloured shadow on the "floor"
//   4. while `active` (the agent is speaking) the colours swirl around the
//      middle like liquid being stirred: every blob circles the centre in
//      its own direction and at its own uneven pace, while the centre,
//      under the play button, stays calm. Nothing outside the orb moves.
//
// Sizes inside use container-query units (cqw), so the lighting and
// shadows scale with the orb, from a 12px dot to a 240px hero orb.

import { useId, type CSSProperties, type ReactNode } from "react";
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

const PALETTES: Record<OrbPalette, Palette> = {
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

function Texture({
  palette,
  className,
  soft = false,
  liquid = false,
}: {
  palette: OrbPalette;
  className?: string;
  // Softer, larger swirls for wide surfaces.
  soft?: boolean;
  // Blobs flow around (the speaking state).
  liquid?: boolean;
}) {
  const id = useId();
  const p = PALETTES[palette];
  const [light, deep, pale, vivid, dark] = p.blobs;
  return (
    <svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden focusable="false">
      <defs>
        <filter id={id} x="-30%" y="-30%" width="160%" height="160%" colorInterpolationFilters="sRGB">
          {/* 1. warp the blobs into organic shapes */}
          <feTurbulence type="fractalNoise" baseFrequency={soft ? 0.006 : 0.01} numOctaves={2} seed={p.seed} result="warpNoise" />
          <feDisplacementMap in="SourceGraphic" in2="warpNoise" scale={soft ? 110 : 84} xChannelSelector="R" yChannelSelector="G" result="warped" />
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
        {/* each blob sits in its own group so it can circle the centre on its own */}
        <g className={liquid ? "orb-flow-1" : undefined}>
          <circle cx="52" cy="50" r="64" fill={light} />
        </g>
        <g className={liquid ? "orb-flow-2" : undefined}>
          <circle cx="158" cy="62" r="60" fill={deep} />
        </g>
        <g className={liquid ? "orb-flow-3" : undefined}>
          <circle cx="84" cy="156" r="66" fill={vivid} />
        </g>
        <g className={liquid ? "orb-flow-4" : undefined}>
          <circle cx="166" cy="160" r="50" fill={dark} />
        </g>
        <g className={liquid ? "orb-flow-5" : undefined}>
          <ellipse cx="112" cy="96" rx="22" ry="40" fill={pale} transform="rotate(28 112 96)" />
        </g>
        <g className={liquid ? "orb-flow-2" : undefined}>
          <circle cx="30" cy="140" r="34" fill={deep} />
        </g>
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
  // True while this orb is "speaking".
  active?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const p = PALETTES[palette];
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
        {/* the gradient: turns slowly; while speaking the colours flow like liquid */}
        <Texture palette={palette} liquid={active} className="orb-drift absolute inset-0 size-full" />

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
    <div className={cn("relative overflow-hidden", className)} style={{ backgroundColor: PALETTES[palette].base }}>
      <Texture palette={palette} soft className="absolute inset-0 size-full scale-125" />
      <div aria-hidden className="grain-overlay absolute inset-0" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-black/5" />
      <div className="relative h-full">{children}</div>
    </div>
  );
}
