// /terms — terms of service. Pakistani jurisdiction, clear sections.

import {
  MarketingShell,
  MarketingHero,
  MarketingSection,
} from "@/components/marketing/marketing-shell";

export const metadata = {
  title: "Terms of Service",
  description:
    "Callen.ai terms of service. The agreement between Callen.ai and customers using the platform.",
};

const SECTIONS: Array<{ heading: string; body: string[] }> = [
  {
    heading: "1. Agreement",
    body: [
      "These Terms of Service form an agreement between Callen.ai (Private) Limited, a company incorporated in Pakistan, and the entity or individual accessing or using Callen.ai (\"you\").",
      "By creating an account or using the service, you agree to these terms.",
    ],
  },
  {
    heading: "2. The service",
    body: [
      "Callen.ai is a multi-tenant voice AI platform that lets businesses deploy AI agents to handle inbound and outbound phone calls.",
      "We provide the platform; you configure your agents, knowledge base, integrations, and call routing.",
    ],
  },
  {
    heading: "3. Your responsibilities",
    body: [
      "Use the service only for lawful purposes and in compliance with Pakistani telecommunications regulations.",
      "Obtain consent from callers as required by applicable law (e.g. recording consent under PTA guidelines).",
      "Keep your API keys and account credentials confidential. You are responsible for activity under your account.",
      "Pay any fees due under your subscription. Invoices are billed monthly (Starter, Pro) or annually (Enterprise).",
    ],
  },
  {
    heading: "4. Acceptable use",
    body: [
      "You may not use Callen.ai to run robocalls, mass-marketing campaigns to numbers on a do-not-call list, scams, harassment, or any activity prohibited by Pakistani law.",
      "We reserve the right to suspend or terminate accounts that violate these rules.",
    ],
  },
  {
    heading: "5. Service availability",
    body: [
      "We commit to a 99.9% monthly uptime for the Pro tier and 99.95% for Enterprise. Service credits apply if we miss the SLA; see your subscription document for details.",
      "Scheduled maintenance is announced at least 48 hours in advance via the status page.",
    ],
  },
  {
    heading: "6. Fees and refunds",
    body: [
      "All fees are in Pakistani Rupees (or USD for Enterprise annual contracts).",
      "Starter is free with usage limits. Pro and Enterprise are paid subscriptions billed in advance.",
      "Refunds: 30-day money-back guarantee on the first month of Pro. After that, fees are non-refundable except as required by law.",
    ],
  },
  {
    heading: "7. Confidentiality",
    body: [
      "Each party will treat the other's non-public information as confidential and use it only to provide or use the service.",
      "We never share your data with other customers or with third parties except as required by law.",
    ],
  },
  {
    heading: "8. Warranties + limits",
    body: [
      "We provide the service \"as is\" without express warranties beyond what is required by Pakistani consumer protection law.",
      "Our aggregate liability under these terms is capped at the fees you paid in the 12 months before the claim.",
    ],
  },
  {
    heading: "9. Termination",
    body: [
      "Either party may terminate the agreement at any time. Subscriptions cancel at the end of the current billing period.",
      "On termination, you have 30 days to export your data via the API. After that we hard-delete per our privacy policy.",
    ],
  },
  {
    heading: "10. Governing law",
    body: [
      "These terms are governed by the laws of the Islamic Republic of Pakistan. Disputes are subject to the exclusive jurisdiction of courts in Islamabad.",
    ],
  },
  {
    heading: "11. Changes",
    body: [
      "We may update these terms when the service changes. Material changes will be announced at least 30 days in advance via email to the workspace owner.",
    ],
  },
];

export default function TermsPage() {
  return (
    <MarketingShell>
      <MarketingHero
        eyebrow="Terms of service"
        title={
          <>
            The{" "}
            <span>agreement.</span>
          </>
        }
        lede="Last updated 25 May 2026. Pakistani jurisdiction. Plain-language version below; the full PDF is available on request."
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
