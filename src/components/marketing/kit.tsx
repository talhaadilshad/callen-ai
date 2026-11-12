// The marketing design kit: the few pieces every public page is built
// from. The look: warm off-white paper, black type set light and large,
// hairline rules, pill buttons, and no brand colour outside the orbs.

import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const BTN_PRIMARY =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full bg-black px-5 text-[15px] text-white transition-colors hover:bg-neutral-800";
export const BTN_SECONDARY =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full border border-hairline bg-white px-5 text-[15px] text-black shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:bg-shell";

// Headline scale. Light weight, tight tracking.
export const H1 = "text-[2.6rem] font-light leading-[1.06] tracking-[-0.025em] sm:text-5xl lg:text-[3.5rem]";
export const H2 = "text-3xl font-light leading-[1.12] tracking-[-0.02em] sm:text-4xl lg:text-[2.6rem]";

// The content column with its two vertical hairlines.
export function Rail({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("mx-auto max-w-6xl border-x border-hairline px-5 sm:px-8 lg:px-12", className)}>
      {children}
    </div>
  );
}

// A full-width band: hairline on top, content inside the rail.
export function Band({
  id,
  children,
  className,
  railClassName,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  railClassName?: string;
}) {
  return (
    <section id={id} className={cn("scroll-mt-16 border-t border-hairline", className)}>
      <Rail className={cn("py-20 lg:py-28", railClassName)}>{children}</Rail>
    </section>
  );
}

// Section opener: small label, headline on the left, supporting text and
// an optional button on the right.
export function SectionHead({
  label,
  title,
  body,
  cta,
  className,
}: {
  label?: string;
  title: ReactNode;
  body?: ReactNode;
  cta?: { href: string; label: string };
  className?: string;
}) {
  return (
    <div className={cn("mb-10 grid gap-x-12 gap-y-5 lg:mb-14 lg:grid-cols-2", className)}>
      <div>
        {label && <p className="mb-4 text-sm text-ink-soft">{label}</p>}
        <h2 className={H2}>{title}</h2>
        {cta && (
          <Link href={cta.href} className={cn(BTN_PRIMARY, "mt-7")}>
            {cta.label}
          </Link>
        )}
      </div>
      {body && <p className="max-w-md text-base leading-relaxed text-black lg:pt-9">{body}</p>}
    </div>
  );
}

// A quiet card: title in grey, the point in black, both at the bottom.
export function InfoCard({
  icon,
  title,
  body,
  className,
  children,
}: {
  icon?: ReactNode;
  title: string;
  body: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={cn("flex flex-col rounded-3xl border border-hairline bg-shell p-6", className)}>
      {icon && (
        <div className="flex size-10 items-center justify-center rounded-xl border border-hairline bg-paper text-black">
          {icon}
        </div>
      )}
      {children}
      <div className="mt-auto pt-10">
        <h3 className="text-[15px] text-ink-soft">{title}</h3>
        <p className="mt-1.5 text-[15px] leading-relaxed text-black">{body}</p>
      </div>
    </div>
  );
}

// Closing band used at the bottom of every page: one line, two buttons.
export function ClosingBand({ title = "The AI phone agent for Pakistani restaurants" }: { title?: string }) {
  return (
    <section className="border-t border-hairline">
      <Rail className="flex flex-col items-start justify-between gap-6 py-16 md:flex-row md:items-center lg:py-20">
        <p className="max-w-xl text-3xl font-light leading-tight tracking-[-0.02em] lg:text-4xl">{title}</p>
        <div className="flex shrink-0 items-center gap-2.5">
          <Link href="/contact" className={BTN_SECONDARY}>
            Talk to us
          </Link>
          <Link href="/signup" className={BTN_PRIMARY}>
            Start free pilot
          </Link>
        </div>
      </Rail>
    </section>
  );
}
