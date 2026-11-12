// Nastaliq is how Urdu is written in Pakistan (Naskh reads as Arabic).
// Put `urduFont` on a page's root element, then use the `font-urdu` class
// (wired up in globals.css). The file is large, so it is not preloaded and
// only pages that import this module download it.

import { Noto_Nastaliq_Urdu } from "next/font/google";

const nastaliq = Noto_Nastaliq_Urdu({
  variable: "--font-nastaliq",
  subsets: ["arabic"],
  display: "swap",
  preload: false,
});

export const urduFont = nastaliq.variable;
