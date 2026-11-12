// Callen's brand visual: a soft, grainy gradient orb. The site itself stays
// black, white and warm grey; colour only ever appears inside these orbs
// and the grain surfaces below. Each agent voice has its own orb.
//
// Pure CSS (layered radial gradients + an SVG noise overlay), so there are
// no image files to load and it stays sharp at any size.

import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type OrbPalette = "ember" | "ocean" | "lilac" | "moss" | "rose" | "dusk" | "sun" | "mint";

// base colour, then four blobs that drift over it
const PALETTES: Record<OrbPalette, [string, string, string, string, string]> = {
  ember: ["#ee6a27", "#ffb46e", "#dc3a12", "#ffdcae", "#a8200f"],
  ocean: ["#3f8db6", "#a4e2e6", "#1c5ca6", "#dcf3e6", "#143b7c"],
  lilac: ["#b6a2ff", "#f6b9ef", "#8c8aff", "#ffd8ea", "#7db1ff"],
  moss:  ["#7dab59", "#e7e18c", "#2e7b4e", "#cbedc2", "#efb45b"],
  rose:  ["#ec7b91", "#ffc3aa", "#d7497a", "#ffe1d4", "#9e378e"],
  dusk:  ["#9b948e", "#eab8a1", "#8a9fc7", "#dad4ce", "#5e5b67"],
  sun:   ["#f1b534", "#ffe59c", "#ef8926", "#fff4d1", "#d7641c"],
  mint:  ["#57c0a5", "#c9f3de", "#2a8d99", "#f1f7ba", "#1f6e6a"],
};

function gradient(p: OrbPalette): string {
  const [, a, b, c, d] = PALETTES[p];
  return [
    `radial-gradient(circle at 28% 30%, ${a} 0%, transparent 46%)`,
    `radial-gradient(circle at 74% 32%, ${b} 0%, transparent 50%)`,
    `radial-gradient(circle at 42% 78%, ${c} 0%, transparent 52%)`,
    `radial-gradient(circle at 82% 82%, ${d} 0%, transparent 46%)`,
  ].join(", ");
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
  // True while this orb is "speaking": it breathes a little faster.
  active?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      aria-hidden
      className={cn("relative shrink-0 overflow-hidden rounded-full", active && "orb-breathe", className)}
      style={{ width: size, height: size, backgroundColor: PALETTES[palette][0], ...style }}
    >
      <div
        className="orb-drift absolute -inset-[18%]"
        style={{ backgroundImage: gradient(palette), filter: "blur(10px)" }}
      />
      <div className="grain-overlay absolute inset-0" />
      {/* soft light from the top left, shade at the bottom right */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 22%, rgba(255,255,255,0.45), transparent 42%), radial-gradient(circle at 75% 85%, rgba(0,0,0,0.16), transparent 50%)",
        }}
      />
    </div>
  );
}

// A card filled with the same grainy gradient, for the few places where a
// whole surface carries colour (a sample call, the featured plan).
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
    <div
      className={cn("relative overflow-hidden", className)}
      style={{ backgroundColor: PALETTES[palette][0] }}
    >
      <div
        aria-hidden
        className="orb-drift-slow absolute -inset-[25%]"
        style={{ backgroundImage: gradient(palette), filter: "blur(40px)" }}
      />
      <div aria-hidden className="grain-overlay absolute inset-0" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-black/5" />
      <div className="relative h-full">{children}</div>
    </div>
  );
}
