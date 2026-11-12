// Mobile nav menu for MarketingNav. Hamburger toggle (below md) that drops
// a panel with the page links stacked above Log in / Sign up.

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
    <div className="lg:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex size-9 items-center justify-center rounded-full text-black transition-colors hover:bg-shell"
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
            className="absolute left-0 right-0 top-16 border-b border-hairline bg-paper shadow-[0_16px_40px_-24px_rgba(0,0,0,0.25)]"
          >
            <nav className="mx-auto flex max-w-6xl flex-col px-5 py-3">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={close}
                  className="border-b border-hairline py-3.5 text-lg font-light text-black last:border-b-0"
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex items-center gap-2.5 pb-2 pt-4">
                <Link
                  href="/login"
                  onClick={close}
                  className="flex h-11 flex-1 items-center justify-center rounded-full border border-hairline bg-white text-[15px] text-black"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  onClick={close}
                  className="flex h-11 flex-1 items-center justify-center rounded-full bg-black text-[15px] text-white"
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
