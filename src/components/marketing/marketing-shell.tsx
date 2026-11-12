// MarketingShell — wraps a marketing-page body in the fixed nav at top
// + footer at the bottom. Children render the main content; the shell
// handles the consistent chrome.

import type { ReactNode } from "react";
import { MarketingNav } from "./marketing-nav";
import { MarketingFooter } from "./marketing-footer";

export function MarketingShell({ children }: { children: ReactNode }) {
  return (
    <div className="bg-white text-neutral-950 selection:bg-neutral-950 selection:text-white min-h-screen flex flex-col">
      <MarketingNav />
      <main className="flex-1 pt-16">{children}</main>
      <MarketingFooter />
    </div>
  );
}

// Common hero block reused across every page so titles look consistent.
export function MarketingHero({
  eyebrow,
  title,
  lede,
}: {
  eyebrow?: string;
  title: ReactNode;
  lede?: ReactNode;
}) {
  return (
    <section className="pt-20 lg:pt-24 pb-12 lg:pb-16">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        {eyebrow && (
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 font-medium mb-4">
            {eyebrow}
          </p>
        )}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-[-0.03em] leading-[1.05] mb-5">
          {title}
        </h1>
        {lede && (
          <p className="text-lg md:text-xl text-neutral-600 leading-relaxed max-w-2xl">
            {lede}
          </p>
        )}
      </div>
    </section>
  );
}

// Section container with optional eyebrow + title used inside body content.
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
    <section className={`py-12 lg:py-16 ${className ?? ""}`}>
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        {(eyebrow || title) && (
          <div className="mb-8 max-w-2xl">
            {eyebrow && (
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 font-medium mb-3">
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className="text-3xl md:text-4xl font-bold tracking-[-0.03em] leading-[1.1]">
                {title}
              </h2>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
