// Marketing fonts. Put `marketingFonts` on a page's root element, then use
// the `font-display` and `font-urdu` classes (wired up in globals.css).
// They are loaded only by the pages that import this file, so the
// dashboard does not download them.

import { Fraunces, Noto_Nastaliq_Urdu } from "next/font/google";

// Display serif for marketing headlines.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  display: "swap",
});

// Nastaliq is how Urdu is written in Pakistan (Naskh reads as Arabic).
// The file is large, so it is not preloaded; it arrives after first paint.
const nastaliq = Noto_Nastaliq_Urdu({
  variable: "--font-nastaliq",
  subsets: ["arabic"],
  display: "swap",
  preload: false,
});

export const marketingFonts = `${fraunces.variable} ${nastaliq.variable}`;
