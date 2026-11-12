// Shared footer for every marketing page. Real hrefs so every link
// lands on a real page. Used by the landing page and every page
// reached from it.

import Link from "next/link";
import { Logo } from "@/components/logo";

type FooterColumn = {
  title: string;
  links: Array<{ label: string; href: string }>;
};

const COLUMNS: FooterColumn[] = [
  {
    title: "Product",
    links: [
      { label: "Use cases",    href: "/use-cases" },
      { label: "Integrations", href: "/#integrations" },
      { label: "Pricing",      href: "/pricing" },
      { label: "Changelog",    href: "/changelog" },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "API docs",    href: "/docs/api" },
      { label: "SDKs",        href: "/docs/sdks" },
      { label: "MCP support", href: "/docs/mcp" },
      { label: "Status",      href: "/status" },
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
    <footer className="border-t border-neutral-200 py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12 mb-12">
          <div className="col-span-2">
            <Logo />
            <p className="text-sm text-neutral-600 mt-4 max-w-xs leading-relaxed">
              Multilingual AI voice agents for Pakistani businesses. Voice and chat. Live in 10 minutes.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold mb-4 tracking-tight">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-neutral-600 hover:text-neutral-950 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-8 border-t border-neutral-200 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>© 2026 Callen.ai · Built for Pakistani SMBs.</p>
          <div className="flex items-center gap-5">
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-neutral-950 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
