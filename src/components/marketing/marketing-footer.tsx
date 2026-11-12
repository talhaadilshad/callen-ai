// Shared footer for every marketing page. Real hrefs so every link
// lands on a real page.

import Link from "next/link";
import { Logo } from "@/components/logo";
import { Rail } from "@/components/marketing/kit";

type FooterColumn = {
  title: string;
  links: Array<{ label: string; href: string }>;
};

const COLUMNS: FooterColumn[] = [
  {
    title: "Product",
    links: [
      { label: "What it does", href: "/#product" },
      { label: "Urdu voices",  href: "/#voices" },
      { label: "How it works", href: "/#how" },
      { label: "Pricing",      href: "/pricing" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Use cases", href: "/use-cases" },
      { label: "API docs",  href: "/docs/api" },
      { label: "Changelog", href: "/changelog" },
      { label: "Status",    href: "/status" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About",   href: "/about" },
      { label: "Trust",   href: "/trust" },
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

const LEGAL_LINKS: Array<{ label: string; href: string }> = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms",   href: "/terms" },
  { label: "Cookies", href: "/cookies" },
];

export function MarketingFooter() {
  return (
    <footer className="border-t border-hairline">
      <Rail className="py-16">
        <div className="mb-14 grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-5">
          <div className="col-span-2">
            <Logo size="lg" />
            <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-ink-soft">
              Urdu AI phone agents for Pakistani restaurants. Every call answered, every order taken.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 text-sm font-normal text-ink-soft">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link href={link.href} className="text-[15px] text-black transition-opacity hover:opacity-60">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col items-center justify-between gap-4 border-t border-hairline pt-7 text-sm text-ink-soft md:flex-row">
          <p>© 2026 Callen.ai · Made in Pakistan</p>
          <div className="flex items-center gap-6">
            {LEGAL_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="transition-colors hover:text-black">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </Rail>
    </footer>
  );
}
