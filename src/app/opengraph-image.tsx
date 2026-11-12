// Open Graph card for link previews (WhatsApp, LinkedIn, X, iMessage).
// Generated at build time via ImageResponse: deep green canvas, the Callen
// logo mark, bold wordmark, tagline, and a waveform motif.

import { ImageResponse } from "next/og";

export const alt = "Callen.ai · Urdu AI phone agents for Pakistani restaurants";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Deterministic waveform bar heights (same organic sin/cos mix as the
// in-app Waveform component).
const BARS = Array.from({ length: 48 }, (_, i) => {
  const phase = (i / 48) * Math.PI * 4;
  return Math.round(
    14 + 50 * Math.abs(Math.sin(phase) + Math.cos(phase * 1.7) * 0.4)
  );
});

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#011c11",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Logo mark + wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              backgroundColor: "#fafafa",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#065f3d",
              fontSize: 40,
              fontWeight: 800,
            }}
          >
            C
          </div>
          <div style={{ display: "flex", fontSize: 44, fontWeight: 700, color: "#fafafa", letterSpacing: "-0.02em" }}>
            Callen
            <span style={{ color: "#fbd26b" }}>.ai</span>
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 84,
              fontWeight: 800,
              color: "#fafafa",
              letterSpacing: "-0.04em",
              lineHeight: 1.02,
            }}
          >
            Every call answered. Every order taken, in Urdu.
          </div>
          <div style={{ fontSize: 32, color: "#b3eacb", letterSpacing: "-0.01em" }}>
            The AI phone agent for Pakistani restaurants.
          </div>
        </div>

        {/* Waveform motif */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, height: 70 }}>
          {BARS.map((h, i) => (
            <div
              key={i}
              style={{
                width: 6,
                height: h,
                borderRadius: 3,
                backgroundColor: i % 5 === 0 ? "#f9bc38" : "#065f3d",
              }}
            />
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
