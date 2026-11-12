// Top of every marketing page: a slim announcement bar that scrolls away,
// then a sticky nav. The nav gains a hairline once the page scrolls.

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Orb } from "@/components/brand/orb";
import { Logo } from "@/components/logo";
import { MobileMenu } from "@/components/marketing/mobile-menu";
import { cn } from "@/lib/utils";

const NAV_LINKS: Array<{ href: string; label: string }> = [
  { href: "/#product", label: "Product" },
  { href: "/#value", label: "Why Callen" },
  { href: "/#how", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "Company" },
];

export function MarketingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div className="bg-shell">
        <div className="mx-auto flex max-w-6xl items-center justify-center gap-3 px-5 py-2.5 text-sm text-black">
          <Orb palette="ember" className="size-4" />
          <span>
            <span className="hidden sm:inline">Now in private beta. </span>Free 14-day pilot with 100 call minutes.
          </span>
          <Link
            href="/signup"
            className="rounded-full border border-hairline bg-white px-3 py-1 text-[13px] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:bg-paper"
          >
            Start
          </Link>
        </div>
      </div>

      <header
        className={cn(
          "sticky top-0 z-50 border-b bg-paper/90 backdrop-blur-md transition-colors duration-300",
          scrolled ? "border-hairline" : "border-transparent"
        )}
      >
        <nav className="relative mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8 lg:px-12">
          <div className="flex items-center gap-10">
            <Link href="/" aria-label="Callen.ai home">
              <Logo size="lg" />
            </Link>
            <div className="hidden items-center gap-7 whitespace-nowrap text-[15px] text-black lg:flex">
              {NAV_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className="transition-opacity hover:opacity-60">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden h-9 items-center rounded-full border border-hairline bg-white px-4 text-sm text-black shadow-[0_1px_2px_rgba(0,0,0,0.04)] whitespace-nowrap transition-colors hover:bg-shell lg:inline-flex"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="inline-flex h-9 items-center whitespace-nowrap rounded-full bg-black px-4 text-sm text-white transition-colors hover:bg-neutral-800"
            >
              Sign up
            </Link>
            <MobileMenu links={NAV_LINKS} />
          </div>
        </nav>
      </header>
    </>
  );
}
