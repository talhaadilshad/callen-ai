// /contact — contact form + email + phone routes.

"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Mail, Phone, MapPin, Briefcase, ShieldCheck, MessageCircle, ArrowRight } from "lucide-react";
import {
  MarketingShell,
  MarketingHero,
  MarketingSection,
} from "@/components/marketing/marketing-shell";

type Reason = "sales" | "support" | "security" | "press" | "general";

const REASONS: Array<{ id: Reason; label: string; description: string }> = [
  { id: "sales",    label: "Sales",    description: "Pricing, demo, procurement" },
  { id: "support",  label: "Support",  description: "Help with your live agent" },
  { id: "security", label: "Security", description: "Vulnerability or DPA request" },
  { id: "press",    label: "Press",    description: "Media inquiries" },
  { id: "general",  label: "General",  description: "Anything else" },
];

const CHANNELS = [
  {
    icon: Mail,
    label: "Email",
    value: "hello@callen.ai",
    href: "mailto:hello@callen.ai",
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "+92 333 555 22 11",
    href: "https://wa.me/923335552211",
  },
  {
    icon: Phone,
    label: "Sales line",
    value: "+92 51 111 22 255",
    href: "tel:+925111122255",
  },
  {
    icon: MapPin,
    label: "Office",
    value: "F-7 Markaz, Islamabad",
    href: "https://maps.google.com/?q=F-7+Markaz+Islamabad",
  },
];

const ROUTES = [
  { icon: Briefcase, label: "Sales", email: "sales@callen.ai", note: "Replies within 1 business day" },
  { icon: ShieldCheck, label: "Security", email: "security@callen.ai", note: "PGP key available on request" },
];

export default function ContactPage() {
  const [reason, setReason] = useState<Reason>("sales");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [business, setBusiness] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in the required fields");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success("Message received", {
        description: `We'll reply within one business day. Reference #C-${Math.floor(Math.random() * 90000) + 10000}.`,
      });
      setName("");
      setEmail("");
      setBusiness("");
      setMessage("");
    }, 700);
  }

  return (
    <MarketingShell>
      <MarketingHero
        eyebrow="Contact"
        title={
          <>
            Talk to a{" "}
            <span>human.</span>
          </>
        }
        lede="We answer every message within one business day. For urgent production issues, WhatsApp the sales line and someone will route you to on-call."
      />

      <MarketingSection>
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8">
          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-hairline p-7 lg:p-9 bg-white"
          >
            <h2 className="text-2xl font-normal tracking-tight mb-1">Send a message</h2>
            <p className="text-[14px] text-ink-soft mb-7">
              Pick the closest topic so we can route your message to the right
              person.
            </p>

            {/* Reason chips */}
            <div className="mb-7">
              <p className="text-[11px]  text-ink-soft font-normal mb-3">
                Reason
              </p>
              <div className="flex flex-wrap gap-2">
                {REASONS.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setReason(r.id)}
                    className={
                      reason === r.id
                        ? "inline-flex flex-col items-start gap-0.5 px-4 py-2.5 rounded-2xl border border-neutral-900 bg-shell text-left transition-all"
                        : "inline-flex flex-col items-start gap-0.5 px-4 py-2.5 rounded-2xl border border-hairline hover:border-neutral-400 text-left transition-all"
                    }
                  >
                    <span className="text-[13px] font-normal tracking-tight">{r.label}</span>
                    <span className="text-[11px] text-ink-soft">{r.description}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <Field label="Name" required>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Talha Dilshad"
                  className="w-full h-11 px-3.5 rounded-xl border border-neutral-300 bg-white text-[14px] outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200"
                  required
                />
              </Field>
              <Field label="Work email" required>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@business.pk"
                  className="w-full h-11 px-3.5 rounded-xl border border-neutral-300 bg-white text-[14px] outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200"
                  required
                />
              </Field>
            </div>
            <div className="mb-4">
              <Field label="Business" optional>
                <input
                  value={business}
                  onChange={(e) => setBusiness(e.target.value)}
                  placeholder="Cheezious"
                  className="w-full h-11 px-3.5 rounded-xl border border-neutral-300 bg-white text-[14px] outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200"
                />
              </Field>
            </div>
            <div className="mb-6">
              <Field label="Message" required>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  placeholder="Tell us about your business, your call volume, and what you want the agent to do."
                  className="w-full px-3.5 py-3 rounded-xl border border-neutral-300 bg-white text-[14px] outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200 resize-none leading-relaxed"
                  required
                />
              </Field>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-full bg-neutral-950 text-white text-sm font-normal hover:bg-neutral-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? "Sending..." : (
                <>Send message <ArrowRight className="size-4" /></>
              )}
            </button>
          </form>

          {/* Channels */}
          <div className="space-y-5">
            <div className="rounded-3xl border border-hairline p-7">
              <h3 className="text-base font-normal tracking-tight mb-5">Direct channels</h3>
              <div className="space-y-4">
                {CHANNELS.map((c) => (
                  <a
                    key={c.label}
                    href={c.href}
                    target={c.href.startsWith("http") ? "_blank" : undefined}
                    rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="flex items-start gap-3 group"
                  >
                    <div className="size-9 rounded-xl bg-shell flex items-center justify-center shrink-0">
                      <c.icon className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px]  text-ink-soft font-normal">
                        {c.label}
                      </p>
                      <p className="text-[14px] font-medium text-neutral-900 group-hover:underline truncate">
                        {c.value}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-neutral-950 text-white p-7">
              <h3 className="text-base font-normal tracking-tight mb-4">Routed inboxes</h3>
              <div className="space-y-4">
                {ROUTES.map((r) => (
                  <div key={r.label} className="border-t border-white/10 pt-4 first:border-0 first:pt-0">
                    <div className="flex items-center gap-2 mb-1">
                      <r.icon className="size-3.5 text-white/70" />
                      <p className="text-[11px]  text-white/60 font-normal">
                        {r.label}
                      </p>
                    </div>
                    <a
                      href={`mailto:${r.email}`}
                      className="text-sm font-medium hover:underline"
                    >
                      {r.email}
                    </a>
                    <p className="text-[11.5px] text-white/50 mt-0.5">{r.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </MarketingSection>
    </MarketingShell>
  );
}

function Field({
  label,
  required,
  optional,
  children,
}: {
  label: string;
  required?: boolean;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-[13px] font-medium text-neutral-900 mb-1.5 block">
        {label}
        {required && <span className="text-rose-500 ml-0.5">*</span>}
        {optional && <span className="text-neutral-400 font-normal ml-1.5">(optional)</span>}
      </label>
      {children}
    </div>
  );
}
