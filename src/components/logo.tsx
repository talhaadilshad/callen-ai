// Callen.ai logo.
// Black rounded square + bold white C arc + single centre dot inside.
// The C is drawn as a true SVG arc so it's geometrically perfect at any
// size. The centre dot reads as the "listening" signal. The mark works
// from 16px (sidebar) up to 64px+ (hero) without visual breakdown.

import { cn } from "@/lib/utils";

type Size = "sm" | "default" | "lg" | "xl";

const MARK_SIZE: Record<Size, string> = {
  sm: "size-4",       // 16px — compact, favicon-ish
  default: "size-6",  // 24px — standard
  lg: "size-8",       // 32px — prominent navs (sidebar top, landing nav)
  xl: "size-11",      // 44px — hero placements
};

const TEXT_SIZE: Record<Size, string> = {
  sm: "text-sm",
  default: "text-base",
  lg: "text-lg",
  xl: "text-2xl",
};

const GAP: Record<Size, string> = {
  sm: "gap-1.5",
  default: "gap-2",
  lg: "gap-2",
  xl: "gap-2.5",
};

export function Logo({
  className,
  withWordmark = true,
  size = "default",
  inverse = false,
}: {
  className?: string;
  withWordmark?: boolean;
  size?: Size;
  // Set true on dark backgrounds. Tile becomes white, mark inside flips
  // to near-black so the C and dot stay legible.
  inverse?: boolean;
}) {
  const tile = inverse ? "#ffffff" : "#0a0a0a";
  const ink  = inverse ? "#0a0a0a" : "#ffffff";
  const wordmark       = inverse ? "text-white"     : "text-neutral-950";
  const wordmarkAccent = inverse ? "text-white/55"  : "text-neutral-500";

  return (
    <div className={cn("inline-flex items-center", GAP[size], className)}>
      <svg
        viewBox="0 0 40 40"
        className={cn("shrink-0", MARK_SIZE[size])}
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Callen.ai logo"
        role="img"
      >
        {/* Brand tile */}
        <rect width="40" height="40" rx="9" fill={tile} />

        {/* Bold C arc — opens to the right. True 270° arc with rounded
            caps for clean geometry at any scale. */}
        <path
          d="M 28 12.5 A 11 11 0 1 0 28 27.5"
          stroke={ink}
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
        />

        {/* Centre listening dot */}
        <circle cx="20" cy="20" r="3.5" fill={ink} />
      </svg>

      {withWordmark && (
        <span
          className={cn(
            "font-semibold tracking-tight",
            TEXT_SIZE[size],
            wordmark
          )}
        >
          Callen
          <span className={cn("font-normal", wordmarkAccent)}>.ai</span>
        </span>
      )}
    </div>
  );
}
