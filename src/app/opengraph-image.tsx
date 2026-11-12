// Open Graph card for link previews (WhatsApp, LinkedIn, X, iMessage).
// Generated at build time via ImageResponse: black canvas, the Callen
// logo mark, bold wordmark, tagline, and a waveform motif.

import { ImageResponse } from "next/og";

export const alt = "Callen.ai · AI voice agents for every business call";
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
          backgroundColor: "#0a0a0a",
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
              color: "#0a0a0a",
              fontSize: 40,
              fontWeight: 800,
            }}
          >
            C
          </div>
          <div style={{ display: "flex", fontSize: 44, fontWeight: 700, color: "#fafafa", letterSpacing: "-0.02em" }}>
            Callen
            <span style={{ color: "#737373" }}>.ai</span>
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
            AI voice agents for every business call.
          </div>
          <div style={{ fontSize: 32, color: "#a3a3a3", letterSpacing: "-0.01em" }}>
            Urdu + English customer calls, answered 24/7. Live in 10 minutes.
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
                backgroundColor: i % 5 === 0 ? "#fafafa" : "#404040",
              }}
            />
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
