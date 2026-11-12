// Fixed top nav shared by every marketing page (landing + all footer
// destinations). Scroll-aware: transparent at the top, white-blurred
// with a hairline border once the user scrolls.

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

export function MarketingNav() {
  const [scrolled, setScrolled] = useState(false);

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
        <Link href="/" className="text-neutral-950">
          <Logo />
        </Link>
        <div className="hidden md:flex items-center gap-7 text-sm font-medium text-neutral-600">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-neutral-950 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <Link
            href="/login"
            className="hidden md:block text-sm font-medium px-3 py-2 text-neutral-700 hover:text-neutral-950 transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="text-sm font-semibold px-4 py-2 rounded-full bg-white border border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50 transition-all"
          >
            Sign up
          </Link>
          <MobileMenu links={NAV_LINKS} />
        </div>
      </nav>
    </header>
  );
}
