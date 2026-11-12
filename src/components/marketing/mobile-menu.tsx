// Mobile nav menu shared by the landing header and MarketingNav.
// Hamburger toggle (visible below md) that drops a white panel with the
// page links stacked above Log in / Sign up. Monochrome, hairline borders.

"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

type MobileMenuLink = { href: string; label: string };

export function MobileMenu({ links }: { links: MobileMenuLink[] }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center justify-center size-9 rounded-full text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100 transition-colors"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute top-16 left-0 right-0 bg-white border-b border-neutral-200 shadow-[0_16px_40px_-24px_rgba(0,0,0,0.25)]"
          >
            <nav className="max-w-7xl mx-auto px-6 py-4 flex flex-col">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={close}
                  className="py-3 text-base font-medium text-neutral-700 hover:text-neutral-950 transition-colors border-b border-neutral-100 last:border-b-0"
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex items-center gap-3 pt-4 pb-1">
                <Link
                  href="/login"
                  onClick={close}
                  className="flex-1 text-center text-sm font-semibold px-4 py-2.5 rounded-full bg-white border border-neutral-300 hover:bg-neutral-50 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  onClick={close}
                  className="flex-1 text-center text-sm font-semibold px-4 py-2.5 rounded-full bg-neutral-950 text-white hover:bg-neutral-800 transition-colors"
                >
                  Sign up
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
