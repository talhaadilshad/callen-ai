// /privacy — privacy policy. Plain language. No dark patterns.

import {
  MarketingShell,
  MarketingHero,
  MarketingSection,
} from "@/components/marketing/marketing-shell";

export const metadata = {
  title: "Privacy",
  description:
    "Callen.ai's privacy policy. What data we collect, how we use it, and the controls you have over it.",
};

const SECTIONS: Array<{ heading: string; body: string[] }> = [
  {
    heading: "1. What we collect",
    body: [
      "When you sign up: your name, work email, business name, and (if you choose to provide it) your phone number.",
      "When you take a call: the audio of the call, a transcript, intent detection results, and any tool calls the agent made. We store these so you can review them in the workspace.",
      "When you visit our marketing site: standard server logs (IP address, user agent, timestamp). We do not load third-party analytics, advertising trackers, or session replay tools.",
    ],
  },
  {
    heading: "2. How we use it",
    body: [
      "To operate the service. Recordings and transcripts are stored so you can play them back, search them, and export them.",
      "To improve the service. We aggregate anonymised metrics (call duration, language mix, latency) to find regressions. We do NOT train models on customer audio, transcripts, or prompts.",
      "To communicate with you about the service. Account emails, billing, and incident notifications.",
    ],
  },
  {
    heading: "3. What we never do",
    body: [
      "We never sell your data.",
      "We never train models on your calls.",
      "We never share recordings with other Callen customers.",
      "We never read your recordings unless you grant a time-bound support session.",
    ],
  },
  {
    heading: "4. Where it lives",
    body: [
      "Customer audio and transcripts are stored in Pakistani regions by default (Karachi primary, Islamabad secondary).",
      "Enterprise customers may request EU or US residency under a signed DPA.",
      "Backups age out at 90 days. When you delete an agent or cancel an account, primary data is hard-deleted within 30 days.",
    ],
  },
  {
    heading: "5. Your controls",
    body: [
      "Export everything via the REST API.",
      "Delete any call or agent from the dashboard.",
      "Configure PII redaction patterns per tenant.",
      "Opt out of any optional telemetry from /settings.",
    ],
  },
  {
    heading: "6. Cookies",
    body: [
      "We default to declining non-essential cookies. We only set the cookies required to keep you logged in. See our cookie policy for the full list.",
    ],
  },
  {
    heading: "7. Children",
    body: [
      "Callen.ai is for businesses. We do not knowingly collect personal information from anyone under 18.",
    ],
  },
  {
    heading: "8. Contact",
    body: [
      "Email privacy@callen.ai with any question or to exercise a data subject right (access, correction, deletion, portability). We reply within one business day.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <MarketingShell>
      <MarketingHero
        eyebrow="Privacy policy"
        title={
          <>
            Your data,{" "}
            <span>your terms.</span>
          </>
        }
        lede="Last updated 25 May 2026. Written in plain language. Effective for everyone using Callen.ai today."
      />

      <MarketingSection>
        <div className="max-w-3xl space-y-10">
          {SECTIONS.map((s) => (
            <section key={s.heading}>
              <h2 className="text-xl md:text-2xl font-normal tracking-tight mb-4">{s.heading}</h2>
              <div className="space-y-3 text-[15px] text-black leading-relaxed">
                {s.body.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </MarketingSection>
    </MarketingShell>
  );
}
