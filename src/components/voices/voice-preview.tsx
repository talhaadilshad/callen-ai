// VoicePreview — rounded-square grey tile with a centered SiriOrb avatar
// that doubles as the play button. Holds its own <audio> element and
// coordinates with other previews via the voice-playback store so only
// one preview is audible at a time.
// While playing the orb spins faster; when idle it drifts slowly to keep
// the page from feeling busy with 14 spinning orbs.

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, Check } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useVoicePlayback } from "@/lib/voice-playback";
import type { Voice } from "@/lib/voice-library";
import { VoiceOrb, type VoiceOrbColors } from "./voice-orb";

type Size = "sm" | "md" | "lg";

// Outer tile size (the grey square).
const TILE_PX: Record<Size, number> = {
  sm: 56,
  md: 64,
  lg: 112,
};

// Inner orb diameter (sits centered inside the tile). About 70% of the
// tile, matching the reference proportions.
const ORB_PX: Record<Size, number> = {
  sm: 40,
  md: 46,
  lg: 78,
};

const ICON_PX: Record<Size, number> = {
  sm: 18,
  md: 20,
  lg: 30,
};

const BADGE_PX: Record<Size, number> = {
  sm: 14,
  md: 18,
  lg: 24,
};

// Curated planet palettes — each one a coherent single-hue family from deep
// base through bright cloud highlights, plus an atmospheric halo tint.
const ORB_PALETTES: VoiceOrbColors[] = [
  // ocean — deep blue planet
  {
    base: "oklch(28% 0.10 240)",
    c1:   "oklch(45% 0.18 230)",
    c2:   "oklch(65% 0.18 210)",
    c3:   "oklch(82% 0.16 200)",
    atmo: "oklch(75% 0.18 220)",
  },
  // sunset — warm coral planet
  {
    base: "oklch(30% 0.13 30)",
    c1:   "oklch(55% 0.18 35)",
    c2:   "oklch(72% 0.17 55)",
    c3:   "oklch(85% 0.13 75)",
    atmo: "oklch(78% 0.18 40)",
  },
  // violet — purple gas giant
  {
    base: "oklch(28% 0.13 290)",
    c1:   "oklch(48% 0.18 285)",
    c2:   "oklch(65% 0.18 270)",
    c3:   "oklch(82% 0.14 310)",
    atmo: "oklch(75% 0.18 290)",
  },
  // forest — verdant world
  {
    base: "oklch(26% 0.10 155)",
    c1:   "oklch(48% 0.17 150)",
    c2:   "oklch(68% 0.17 160)",
    c3:   "oklch(85% 0.13 140)",
    atmo: "oklch(74% 0.18 150)",
  },
  // magenta — rose nebula
  {
    base: "oklch(28% 0.14 350)",
    c1:   "oklch(50% 0.20 340)",
    c2:   "oklch(68% 0.20 330)",
    c3:   "oklch(85% 0.14 350)",
    atmo: "oklch(76% 0.20 340)",
  },
  // teal — turquoise ocean planet
  {
    base: "oklch(28% 0.10 195)",
    c1:   "oklch(50% 0.15 195)",
    c2:   "oklch(70% 0.14 205)",
    c3:   "oklch(86% 0.12 195)",
    atmo: "oklch(78% 0.15 200)",
  },
  // amber — desert world
  {
    base: "oklch(30% 0.10 60)",
    c1:   "oklch(55% 0.16 65)",
    c2:   "oklch(75% 0.17 75)",
    c3:   "oklch(88% 0.14 90)",
    atmo: "oklch(80% 0.16 70)",
  },
  // rose — pink dwarf
  {
    base: "oklch(30% 0.13 15)",
    c1:   "oklch(55% 0.18 15)",
    c2:   "oklch(72% 0.16 5)",
    c3:   "oklch(86% 0.12 20)",
    atmo: "oklch(78% 0.17 10)",
  },
  // sky — pale blue
  {
    base: "oklch(32% 0.10 250)",
    c1:   "oklch(55% 0.15 240)",
    c2:   "oklch(74% 0.13 235)",
    c3:   "oklch(88% 0.10 235)",
    atmo: "oklch(80% 0.14 235)",
  },
  // emerald — jade world
  {
    base: "oklch(26% 0.10 170)",
    c1:   "oklch(48% 0.16 165)",
    c2:   "oklch(68% 0.17 155)",
    c3:   "oklch(86% 0.14 150)",
    atmo: "oklch(75% 0.17 160)",
  },
  // crimson — molten planet
  {
    base: "oklch(28% 0.16 25)",
    c1:   "oklch(48% 0.22 25)",
    c2:   "oklch(65% 0.21 15)",
    c3:   "oklch(82% 0.14 35)",
    atmo: "oklch(72% 0.22 20)",
  },
  // indigo — deep night world
  {
    base: "oklch(24% 0.13 275)",
    c1:   "oklch(46% 0.18 275)",
    c2:   "oklch(65% 0.16 260)",
    c3:   "oklch(85% 0.13 285)",
    atmo: "oklch(72% 0.18 275)",
  },
];

// An <audio> element can't read an error body, so when playback fails we
// ask the preview route once more and surface its message instead of
// failing silently.
async function reportPreviewError(voice: Voice) {
  let reason = "The preview could not be loaded.";
  try {
    const res = await fetch(voice.audioSrc);
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      if (body?.error) reason = body.error;
    } else {
      reason = "Your browser blocked playback. Click the voice again.";
    }
  } catch {
    // keep the generic reason
  }
  toast.error(`Can't play ${voice.name}`, { description: reason });
}

function hashSeed(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

type VoicePreviewProps = {
  voice: Voice;
  size?: Size;
  showBadge?: boolean;
  className?: string;
};

export function VoicePreview({
  voice,
  size = "md",
  showBadge = true,
  className,
}: VoicePreviewProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [loading, setLoading] = useState(false);
  const { currentId, setCurrent } = useVoicePlayback();
  const playing = currentId === voice.id;

  const palette = useMemo(
    () => ORB_PALETTES[hashSeed(voice.id) % ORB_PALETTES.length],
    [voice.id]
  );

  // When another voice claims the playback slot, stop ours.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!playing) {
      audio.pause();
      audio.currentTime = 0;
      setLoading(false);
    }
  }, [playing]);

  const tilePx = TILE_PX[size];
  const orbPx = ORB_PX[size];
  const iconPx = ICON_PX[size];
  const badgePx = BADGE_PX[size];
  // Slow drift while idle, lively spin while playing.
  const orbDuration = playing ? 6 : 40;

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
      audio.currentTime = 0;
      setCurrent(null);
      return;
    }

    setLoading(true);
    setCurrent(voice.id);
    audio.currentTime = 0;
    audio
      .play()
      .then(() => setLoading(false))
      .catch(() => {
        setLoading(false);
        setCurrent(null);
        void reportPreviewError(voice);
      });
  }

  // div + role/keyboard handler instead of <button>. The whole point of
  // VoicePreview is to be embedded inside other clickable surfaces (voice
  // picker rows, agent voice cards, voice library cards) — those wrappers
  // are themselves clickable so wrapping a real <button> here would produce
  // "<button> cannot be a descendant of <button>" hydration errors. The
  // role + keyboard handler give the same a11y story without the nesting.
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation();
        handleClick(e);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          handleClick(e as unknown as React.MouseEvent);
        }
      }}
      aria-label={playing ? `Stop ${voice.name}` : `Play ${voice.name}`}
      className={cn(
        "relative shrink-0 rounded-2xl overflow-hidden group/preview cursor-pointer",
        "bg-neutral-100 ring-1 ring-inset ring-neutral-200/70",
        "outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        "transition-transform duration-150 active:scale-[0.97]",
        className
      )}
      style={{ width: tilePx, height: tilePx }}
    >
      <audio
        ref={audioRef}
        src={voice.audioSrc}
        preload="none"
        onEnded={() => {
          setCurrent(null);
        }}
      />

      {/* Centered planet orb */}
      <span className="absolute inset-0 flex items-center justify-center">
        <VoiceOrb
          size={`${orbPx}px`}
          colors={palette}
          animationDuration={orbDuration}
        />
      </span>

      {/* Hover / playing dim layer — covers the whole tile */}
      <span
        className={cn(
          "absolute inset-0 transition-colors",
          playing
            ? "bg-black/30"
            : "bg-black/0 group-hover/preview:bg-black/25"
        )}
      />

      {/* Play / Pause icon — fades in on hover or while playing */}
      <span
        className={cn(
          "absolute inset-0 flex items-center justify-center text-white drop-shadow-sm transition-opacity",
          playing
            ? "opacity-100"
            : "opacity-0 group-hover/preview:opacity-100"
        )}
      >
        {playing ? (
          <Pause
            width={iconPx}
            height={iconPx}
            strokeWidth={2.5}
            fill="currentColor"
          />
        ) : (
          <Play
            width={iconPx}
            height={iconPx}
            strokeWidth={2.5}
            fill="currentColor"
          />
        )}
      </span>

      {/* Mini waveform while playing — under the icon on md/lg */}
      {playing && size !== "sm" && (
        <span className="absolute inset-x-0 bottom-1.5 flex items-end justify-center gap-[2px] h-3 px-3 pointer-events-none">
          {Array.from({ length: 7 }).map((_, i) => (
            <motion.span
              key={i}
              className="w-[2px] bg-white/85 rounded-full"
              animate={{
                height: ["20%", "100%", "40%", "85%", "30%"],
              }}
              transition={{
                duration: 0.9,
                repeat: Infinity,
                delay: i * 0.08,
                ease: "easeInOut",
              }}
            />
          ))}
        </span>
      )}

      {/* Playing pulse ring — same rounding as the tile */}
      {playing && (
        <motion.span
          className="absolute inset-0 rounded-2xl ring-2 ring-neutral-900/30 pointer-events-none"
          initial={{ opacity: 0.7, scale: 1 }}
          animate={{ opacity: [0.7, 0, 0.7], scale: [1, 1.03, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
        />
      )}

      {/* Loading dot */}
      {loading && !playing && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="size-1.5 rounded-full bg-white/90 animate-pulse" />
        </span>
      )}

      {/* Verified badge — sits at the top-right inside the tile so the
          rounded-2xl corner clips it slightly, matching the reference. */}
      {showBadge && (
        <span
          className="absolute right-1 top-1 rounded-full bg-neutral-950 text-white flex items-center justify-center ring-1 ring-white"
          style={{ width: badgePx, height: badgePx }}
          aria-hidden
        >
          <Check
            width={badgePx - 6}
            height={badgePx - 6}
            strokeWidth={3.5}
          />
        </span>
      )}
    </div>
  );
}
