// MarketingShell wraps a marketing page in the shared chrome: announcement
// bar and sticky nav on top, closing band and footer at the bottom.
// MarketingHero and MarketingSection give every inner page the same
// structure as the landing page: light headlines, hairline rules, and one
// gradient orb in the hero as the page's only colour.

import type { ReactNode } from "react";
import { Orb, type OrbPalette } from "@/components/brand/orb";
import { ClosingBand, H1, H2, Rail } from "./kit";
import { MarketingNav } from "./marketing-nav";
import { MarketingFooter } from "./marketing-footer";

export function MarketingShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-paper text-black">
      <MarketingNav />
      <main className="flex-1">{children}</main>
      <ClosingBand />
      <MarketingFooter />
    </div>
  );
}

// Page opener. Each page can pick its own orb colour.
export function MarketingHero({
  eyebrow,
  title,
  lede,
  orb = "dusk",
}: {
  eyebrow?: string;
  title: ReactNode;
  lede?: ReactNode;
  orb?: OrbPalette;
}) {
  return (
    <section>
      <Rail className="flex items-end justify-between gap-10 pb-14 pt-16 lg:pb-20 lg:pt-24">
        <div className="max-w-3xl">
          {eyebrow && <p className="mb-5 text-sm text-ink-soft">{eyebrow}</p>}
          <h1 className={`${H1} mb-6 [&_span]:not-italic`}>{title}</h1>
          {lede && <p className="max-w-2xl text-lg leading-relaxed text-ink-soft">{lede}</p>}
        </div>
        <Orb palette={orb} className="hidden size-36 md:block lg:size-44" />
      </Rail>
    </section>
  );
}

// Body section with an optional label and headline.
export function MarketingSection({
  eyebrow,
  title,
  children,
  className,
}: {
  eyebrow?: string;
  title?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`border-t border-hairline ${className ?? ""}`}>
      <Rail className="py-14 lg:py-20">
        {(eyebrow || title) && (
          <div className="mb-9 max-w-2xl">
            {eyebrow && <p className="mb-4 text-sm text-ink-soft">{eyebrow}</p>}
            {title && <h2 className={`${H2} [&_span]:not-italic`}>{title}</h2>}
          </div>
        )}
        {children}
      </Rail>
    </section>
  );
}
