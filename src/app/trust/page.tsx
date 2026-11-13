// /trust — security and compliance overview, the page enterprise procurement
// asks for first.

import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Eye,
  FileText,
  Database,
  Globe,
  Mail,
} from "lucide-react";
import {
  MarketingShell,
  MarketingHero,
  MarketingSection,
} from "@/components/marketing/marketing-shell";

export const metadata = {
  title: "Trust",
  description:
    "Security, privacy, and compliance at Callen.ai. SOC 2 (in progress), GDPR, PII redaction, encrypted-at-rest, per-tenant isolation.",
};

const CONTROLS = [
  {
    icon: Database,
    title: "Encrypted at rest + in transit",
    body:
      "Every call recording, transcript, and KB document is AES-256 encrypted at rest. TLS 1.3 in transit. Keys rotated quarterly via AWS KMS.",
  },
  {
    icon: Lock,
    title: "Per-tenant isolation",
    body:
      "tenant_id is enforced at the storage layer, not the policy layer. Cross-tenant queries are physically impossible. We test this with adversarial fuzzing on every deploy.",
  },
  {
    icon: Eye,
    title: "PII redaction by default",
    body:
      "CNICs, credit card numbers, phone numbers, and addresses are auto-redacted in transcripts unless your workspace explicitly opts in. Configurable patterns per tenant.",
  },
  {
    icon: FileText,
    title: "Consent + audit logs",
    body:
      "Every call starts with a configurable consent prompt. Every admin action is logged with actor, timestamp, and target. Logs exportable to your SIEM.",
  },
  {
    icon: Globe,
    title: "Pakistan data residency",
    body:
      "Customer audio + transcripts are stored in Pakistan-based regions (Karachi primary, Islamabad secondary). No data crosses borders without an opt-in DPA.",
  },
  {
    icon: ShieldCheck,
    title: "Independent audits",
    body:
      "SOC 2 Type 1 audit in progress (Q3 2026). Annual third-party penetration test. Quarterly internal red-team exercises.",
  },
];

const COMPLIANCE = [
  { code: "SOC 2 Type 1", status: "In progress · Q3 2026" },
  { code: "GDPR",          status: "Compliant" },
  { code: "ISO 27001",     status: "On roadmap" },
  { code: "HIPAA",         status: "Available on enterprise tier" },
];

const FAQS = [
  {
    q: "Where is customer data stored?",
    a: "By default in Pakistani regions (Karachi primary, Islamabad secondary). Enterprise customers may request EU or US residency with a signed DPA.",
  },
  {
    q: "Who can access my call recordings?",
    a: "Only members of your workspace with the recordings:read permission. Callen.ai support engineers have no read access to customer audio unless you explicitly grant a time-bound support session.",
  },
  {
    q: "What happens to my data if I cancel?",
    a: "30-day soft-delete window during which you can export everything via the API. After day 30 we hard-delete from primary storage. Backups age out at 90 days.",
  },
  {
    q: "Do you train models on my data?",
    a: "No. We never train models on customer audio, transcripts, or prompts. Our LLM, STT, and TTS providers contract with us under no-train terms.",
  },
];

export default function TrustPage() {
  return (
    <MarketingShell>
      <MarketingHero orb="moss"
        eyebrow="Trust"
        title={
          <>
            Procurement-proof from day{" "}
            <span>one.</span>
          </>
        }
        lede="Security and privacy aren't features we tacked on. They're baked into the storage layer, the consent flows, and the audit trails."
      />

      <MarketingSection>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {CONTROLS.map((c) => (
            <div key={c.title} className="rounded-3xl border border-hairline p-7">
              <div className="size-10 rounded-xl bg-shell flex items-center justify-center mb-4">
                <c.icon className="size-5" />
              </div>
              <h3 className="text-base font-normal tracking-tight mb-2">{c.title}</h3>
              <p className="text-[14px] text-ink-soft leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>
      </MarketingSection>

      <MarketingSection
        eyebrow="Compliance"
        title={
          <>
            Frameworks we{" "}
            <span>align to.</span>
          </>
        }
      >
        <div className="rounded-2xl border border-hairline overflow-hidden">
          {COMPLIANCE.map((c, i) => (
            <div
              key={c.code}
              className={`flex items-center justify-between px-6 py-5 ${
                i > 0 ? "border-t border-hairline" : ""
              }`}
            >
              <p className="text-base font-normal tracking-tight">{c.code}</p>
              <p className="text-sm text-ink-soft">{c.status}</p>
            </div>
          ))}
        </div>
      </MarketingSection>

      <MarketingSection
        eyebrow="Common questions"
        title={
          <>
            What we{" "}
            <span>get asked most.</span>
          </>
        }
      >
        <div className="space-y-4">
          {FAQS.map((f) => (
            <div key={f.q} className="rounded-2xl border border-hairline p-6">
              <h4 className="text-base font-normal tracking-tight mb-2">{f.q}</h4>
              <p className="text-[14.5px] text-ink-soft leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </MarketingSection>

      <MarketingSection>
        <div className="rounded-3xl bg-neutral-950 text-white p-10 lg:p-14">
          <Mail className="size-7 mb-5 text-white/70" />
          <h2 className="text-3xl md:text-4xl font-normal tracking-tight mb-3">
            Security questionnaire?
          </h2>
          <p className="text-white/70 leading-relaxed mb-7 max-w-xl">
            We&apos;ll fill it out. Reach our security team at{" "}
            <a href="mailto:security@callen.ai" className="text-white underline">
              security@callen.ai
            </a>{" "}
            or request our full trust report.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white text-neutral-950 text-sm font-normal hover:bg-white/90 transition-colors"
          >
            Request the trust report
          </Link>
        </div>
      </MarketingSection>
    </MarketingShell>
  );
}
