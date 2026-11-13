// /docs/api — public API reference with example requests and code snippets.

import Link from "next/link";
import { Terminal, Webhook, Zap, KeyRound } from "lucide-react";
import {
  MarketingShell,
  MarketingHero,
  MarketingSection,
} from "@/components/marketing/marketing-shell";

export const metadata = {
  title: "API docs",
  description:
    "Programmatic access to Callen.ai voice agents. REST + WebSocket reference for agents, calls, knowledge base, tools, and analytics.",
};

const ENDPOINTS = [
  {
    method: "POST",
    path: "/v1/agents",
    summary: "Create an agent",
  },
  {
    method: "GET",
    path: "/v1/agents/:id",
    summary: "Fetch an agent",
  },
  {
    method: "POST",
    path: "/v1/calls",
    summary: "Place an outbound call",
  },
  {
    method: "GET",
    path: "/v1/calls/:id",
    summary: "Get call details + transcript",
  },
  {
    method: "POST",
    path: "/v1/knowledge",
    summary: "Upload a KB document",
  },
  {
    method: "POST",
    path: "/v1/tools",
    summary: "Register an MCP tool",
  },
  {
    method: "GET",
    path: "/v1/analytics/calls",
    summary: "Aggregated call metrics",
  },
];

const METHOD_STYLES: Record<string, string> = {
  GET:    "bg-shell text-neutral-900",
  POST:   "bg-neutral-950 text-white",
  PATCH:  "bg-shell text-neutral-900",
  DELETE: "bg-white text-neutral-900 border border-neutral-300",
};

const CURL_EXAMPLE = `curl https://api.callen.ai/v1/calls \\
  -H "Authorization: Bearer $CALLEN_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "agent_id": "agent_2k7f3a",
    "to": "+923214567890",
    "metadata": {
      "tenant": "cheezious",
      "channel": "outbound"
    }
  }'`;

const RESPONSE_EXAMPLE = `{
  "id": "call_a92xkq",
  "status": "queued",
  "agent_id": "agent_2k7f3a",
  "to": "+923214567890",
  "created_at": "2026-05-25T18:34:12Z",
  "stream_url": "wss://api.callen.ai/v1/calls/call_a92xkq/stream"
}`;

const WEBHOOK_EXAMPLE = `// POST to your configured webhook on every meaningful call event.
{
  "event": "call.escalated",
  "call_id": "call_a92xkq",
  "reason": "complaint",
  "transcript_url": "https://api.callen.ai/v1/calls/call_a92xkq/transcript",
  "sentiment": -0.42,
  "occurred_at": "2026-05-25T18:36:08Z"
}`;

export default function ApiDocsPage() {
  return (
    <MarketingShell>
      <MarketingHero orb="lilac"
        eyebrow="API"
        title={
          <>
            Programmatic access to{" "}
            <span>every Callen agent.</span>
          </>
        }
        lede="REST for control, WebSocket for streams. Authenticate with a workspace API key. SDKs available for Node, Python, and Go."
      />

      <MarketingSection>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {[
            { icon: KeyRound, title: "Auth", body: "Bearer-token API keys per workspace. Rotate from /settings any time." },
            { icon: Zap, title: "Latency", body: "p99 under 80ms for REST. Real-time event stream pushes within 60ms of speech-end." },
            { icon: Webhook, title: "Webhooks", body: "Signed payloads on call.start, call.end, call.escalated, tool.error." },
          ].map((c) => (
            <div key={c.title} className="rounded-2xl border border-hairline p-6">
              <div className="size-9 rounded-xl bg-shell flex items-center justify-center mb-4">
                <c.icon className="size-4" />
              </div>
              <h3 className="text-base font-normal tracking-tight mb-1.5">{c.title}</h3>
              <p className="text-[13.5px] text-ink-soft leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>
      </MarketingSection>

      <MarketingSection
        eyebrow="Endpoints"
        title={
          <>
            The REST surface.{" "}
            <span>No surprises.</span>
          </>
        }
      >
        <div className="rounded-2xl border border-hairline overflow-hidden">
          {ENDPOINTS.map((e, i) => (
            <div
              key={e.path}
              className={`flex items-center gap-4 px-5 py-4 ${i > 0 ? "border-t border-hairline" : ""}`}
            >
              <span
                className={`inline-flex items-center justify-center w-16 py-1 rounded-md text-[10.5px] font-normal tracking-wider ${METHOD_STYLES[e.method] ?? METHOD_STYLES.GET}`}
              >
                {e.method}
              </span>
              <code className="text-[13px] font-mono text-neutral-900 flex-1 min-w-0 truncate">{e.path}</code>
              <span className="text-[13px] text-ink-soft text-right hidden sm:block">{e.summary}</span>
            </div>
          ))}
        </div>
      </MarketingSection>

      <MarketingSection
        eyebrow="Example"
        title={
          <>
            Place an outbound call in{" "}
            <span>one request.</span>
          </>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <CodeBlock label="Request" lang="bash" code={CURL_EXAMPLE} />
          <CodeBlock label="Response" lang="json" code={RESPONSE_EXAMPLE} />
        </div>

        <p className="text-[14.5px] text-ink-soft leading-relaxed mt-6 max-w-2xl">
          Subscribe to{" "}
          <code className="text-[13px] font-mono bg-shell px-1.5 py-0.5 rounded">
            stream_url
          </code>{" "}
          to receive transcript, intent, and tool events in real time. Or set a
          webhook in your workspace settings to receive lifecycle events:
        </p>
        <div className="mt-4">
          <CodeBlock label="Webhook payload" lang="json" code={WEBHOOK_EXAMPLE} />
        </div>
      </MarketingSection>

      <MarketingSection>
        <div className="rounded-3xl bg-neutral-950 text-white p-10 lg:p-12">
          <Terminal className="size-7 mb-5 text-white/70" />
          <h2 className="text-3xl md:text-4xl font-normal tracking-tight mb-3">
            Ready to integrate?
          </h2>
          <p className="text-white/70 leading-relaxed mb-7 max-w-xl">
            Provision an API key in seconds from your workspace settings. Full
            OpenAPI 3.1 spec available in our SDKs.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white text-neutral-950 text-sm font-normal hover:bg-white/90 transition-colors"
            >
              Get an API key
            </Link>
            <Link
              href="/docs/sdks"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-transparent text-white text-sm font-normal hover:bg-white/10 border border-white/20 transition-colors"
            >
              Browse SDKs
            </Link>
          </div>
        </div>
      </MarketingSection>
    </MarketingShell>
  );
}

function CodeBlock({ label, lang, code }: { label: string; lang: string; code: string }) {
  return (
    <div className="rounded-2xl bg-neutral-950 text-neutral-100 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
        <span className="text-[11px]  text-white/50 font-normal">{label}</span>
        <span className="text-[10.5px] font-mono text-white/40">{lang}</span>
      </div>
      <pre className="px-5 py-4 text-[12.5px] font-mono leading-relaxed overflow-x-auto thin-scrollbar">
        <code>{code}</code>
      </pre>
    </div>
  );
}
