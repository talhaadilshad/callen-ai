// /cookies — cookie policy. Short, specific, no dark patterns.

import {
  MarketingShell,
  MarketingHero,
  MarketingSection,
} from "@/components/marketing/marketing-shell";

export const metadata = {
  title: "Cookie policy",
  description:
    "What cookies Callen.ai uses and why. Default-decline approach with no third-party tracking.",
};

type CookieRow = {
  name: string;
  purpose: string;
  duration: string;
  type: "Essential" | "Functional" | "Analytics";
};

const COOKIES: CookieRow[] = [
  {
    name: "callen_session",
    purpose: "Keeps you logged into your workspace.",
    duration: "30 days, sliding",
    type: "Essential",
  },
  {
    name: "callen_csrf",
    purpose: "Prevents cross-site request forgery on POST endpoints.",
    duration: "Session",
    type: "Essential",
  },
  {
    name: "callen_tenant",
    purpose: "Remembers which workspace you last viewed across browser tabs.",
    duration: "30 days",
    type: "Functional",
  },
  {
    name: "callen_consent",
    purpose: "Records your cookie preferences so we don't keep asking.",
    duration: "365 days",
    type: "Essential",
  },
];

const TYPE_STYLES: Record<CookieRow["type"], string> = {
  Essential:  "bg-neutral-950 text-white",
  Functional: "bg-shell text-black border border-hairline",
  Analytics:  "bg-white text-black border border-neutral-300",
};

export default function CookiesPage() {
  return (
    <MarketingShell>
      <MarketingHero
        eyebrow="Cookie policy"
        title={
          <>
            Only the cookies{" "}
            <span>we actually need.</span>
          </>
        }
        lede="Last updated 25 May 2026. We default to declining everything optional. No third-party tracking, no advertising cookies, no session replay."
      />

      <MarketingSection>
        <div className="max-w-3xl space-y-6 text-[15px] text-black leading-relaxed mb-12">
          <p>
            Cookies are small text files that websites store on your device.
            We use them sparingly and only to make Callen.ai work.
          </p>
          <p>
            We never load third-party advertising, analytics, or session
            replay scripts. The marketing site loads no cookies until you log
            in.
          </p>
        </div>
      </MarketingSection>

      <MarketingSection
        eyebrow="Active cookies"
        title={
          <>
            The full list.{" "}
            <span>All of them.</span>
          </>
        }
      >
        <div className="rounded-2xl border border-hairline overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-hairline bg-shell">
                <th className="text-[10px]  text-ink-soft font-normal px-5 py-3">
                  Name
                </th>
                <th className="text-[10px]  text-ink-soft font-normal px-5 py-3">
                  Purpose
                </th>
                <th className="text-[10px]  text-ink-soft font-normal px-5 py-3 hidden md:table-cell">
                  Duration
                </th>
                <th className="text-[10px]  text-ink-soft font-normal px-5 py-3">
                  Type
                </th>
              </tr>
            </thead>
            <tbody>
              {COOKIES.map((c, i) => (
                <tr key={c.name} className={i > 0 ? "border-t border-hairline" : ""}>
                  <td className="px-5 py-4 align-top">
                    <code className="text-[12.5px] font-mono">{c.name}</code>
                  </td>
                  <td className="px-5 py-4 text-[13.5px] text-black">{c.purpose}</td>
                  <td className="px-5 py-4 text-[13px] text-ink-soft hidden md:table-cell">
                    {c.duration}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-normal uppercase tracking-wider ${TYPE_STYLES[c.type]}`}
                    >
                      {c.type}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </MarketingSection>

      <MarketingSection
        eyebrow="Your controls"
        title={<>How to <span>manage them.</span></>}
      >
        <div className="space-y-4 text-[15px] text-black leading-relaxed max-w-3xl">
          <p>
            <strong className="font-normal text-neutral-950">In Callen:</strong>{" "}
            Visit your workspace settings → Privacy. You can clear stored
            preferences or revoke functional cookies at any time.
          </p>
          <p>
            <strong className="font-normal text-neutral-950">In your browser:</strong>{" "}
            You can disable cookies entirely. Essential cookies are required
            for the dashboard to function; blocking them will sign you out.
          </p>
          <p>
            Questions? Email{" "}
            <a href="mailto:privacy@callen.ai" className="text-neutral-950 font-normal underline">
              privacy@callen.ai
            </a>
            .
          </p>
        </div>
      </MarketingSection>
    </MarketingShell>
  );
}
