// Fixed top nav shared by every marketing page (landing + all footer
// destinations). Scroll-aware: transparent at the top, white-blurred
// with a hairline border once the user scrolls. `overDark` is for pages
// that open on a dark hero: until the user scrolls, the nav is light text
// on that hero.

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "@/components/logo";
import { MobileMenu } from "@/components/marketing/mobile-menu";
import { cn } from "@/lib/utils";

const NAV_LINKS: Array<{ href: string; label: string }> = [
  { href: "/use-cases",  label: "Use cases" },
  { href: "/pricing",    label: "Pricing" },
  { href: "/docs/api",   label: "Docs" },
  { href: "/about",      label: "Company" },
  { href: "/status",     label: "Status" },
];

export function MarketingNav({
  links = NAV_LINKS,
  overDark = false,
}: {
  links?: Array<{ href: string; label: string }>;
  overDark?: boolean;
}) {
  const [scrolled, setScrolled] = useState(false);
  const dark = overDark && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/90 backdrop-blur-md border-b border-neutral-200/60"
          : "bg-transparent"
      )}
    >
      <nav className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" aria-label="Callen.ai home">
          <Logo size="lg" inverse={dark} />
        </Link>
        <div
          className={cn(
            "hidden md:flex items-center gap-7 text-sm font-medium transition-colors",
            dark ? "text-white/75" : "text-neutral-600"
          )}
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn("transition-colors", dark ? "hover:text-white" : "hover:text-brand-700")}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <Link
            href="/login"
            className={cn(
              "hidden md:block text-sm font-medium px-3 py-2 transition-colors",
              dark ? "text-white/80 hover:text-white" : "text-neutral-700 hover:text-neutral-950"
            )}
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className={cn(
              "text-sm font-semibold px-4 py-2 rounded-full transition-colors",
              dark
                ? "bg-saffron-400 text-neutral-950 hover:bg-saffron-300"
                : "bg-brand-700 text-white hover:bg-brand-800"
            )}
          >
            Start free pilot
          </Link>
          <MobileMenu links={links} inverse={dark} />
        </div>
      </nav>
    </header>
  );
}
