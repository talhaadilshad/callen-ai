// /docs/mcp — Model Context Protocol support explainer + integration guide.

import Link from "next/link";
import { Boxes, Plug, ShieldCheck, ArrowRight, ServerCog } from "lucide-react";
import {
  MarketingShell,
  MarketingHero,
  MarketingSection,
} from "@/components/marketing/marketing-shell";

export const metadata = {
  title: "MCP support",
  description:
    "Callen.ai natively speaks Model Context Protocol. Plug any MCP server into your agent for tool calls, real-time data, and side effects.",
};

const REGISTER_EXAMPLE = `// Register an MCP server from your code, the dashboard, or the API.
await callen.tools.register({
  agentId: "agent_2k7f3a",
  type: "mcp",
  name: "shopify-orders",
  url: "https://mcp.example.com/shopify",
  auth: { type: "bearer", token: process.env.SHOPIFY_MCP_TOKEN },
});`;

const SCHEMA_EXAMPLE = `// The agent's runtime auto-discovers tools from the MCP server.
// You don't write JSON schemas by hand. Each tool's input is enforced
// before the LLM ever sees it.

{
  "tools": [
    {
      "name": "lookupOrder",
      "description": "Get the status of a customer's order by order id.",
      "input_schema": {
        "type": "object",
        "properties": {
          "orderId": { "type": "string", "pattern": "^[A-Z]{2,3}-\\\\d{4,}$" }
        },
        "required": ["orderId"]
      }
    },
    {
      "name": "refund",
      "description": "Initiate a refund on an order.",
      "input_schema": {
        "type": "object",
        "properties": {
          "orderId": { "type": "string" },
          "reason": { "enum": ["damaged", "wrong-item", "late"] },
          "amount": { "type": "number", "minimum": 0 }
        },
        "required": ["orderId", "reason"]
      }
    }
  ]
}`;

export default function McpPage() {
  return (
    <MarketingShell>
      <MarketingHero orb="lilac"
        eyebrow="MCP support"
        title={
          <>
            Plug any MCP server into your{" "}
            <span>Callen agent.</span>
          </>
        }
        lede="The Model Context Protocol is the open standard for connecting LLMs to tools and data. Callen is a native MCP host: register a server, the agent's tool catalog updates instantly."
      />

      <MarketingSection>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: Plug,
              title: "Auto discovery",
              body:
                "Register an MCP server URL once. Callen pulls the tool list, descriptions, and JSON schemas at runtime. New tools show up without redeploying the agent.",
            },
            {
              icon: ShieldCheck,
              title: "Type-safe invocations",
              body:
                "Every tool call is schema-validated before it reaches the LLM and again before it leaves Callen. Malformed inputs are rejected, not retried.",
            },
            {
              icon: ServerCog,
              title: "Bring your own server",
              body:
                "Use any MCP-compliant server: official integrations (Stripe, Shopify, HubSpot, Notion) or your own internal services. Callen treats them identically.",
            },
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
        eyebrow="Registration"
        title={
          <>
            Register a server in{" "}
            <span>three lines.</span>
          </>
        }
      >
        <CodeBlock label="Register" lang="ts" code={REGISTER_EXAMPLE} />
        <p className="text-[14.5px] text-ink-soft leading-relaxed mt-6 max-w-2xl">
          Or do it from the dashboard:{" "}
          <Link href="/signup" className="text-neutral-950 font-normal underline">
            sign up
          </Link>{" "}
          → Tools → Add tool → pick MCP. Same result, no code.
        </p>
      </MarketingSection>

      <MarketingSection
        eyebrow="Tool catalog"
        title={
          <>
            Discovery happens{" "}
            <span>automatically.</span>
          </>
        }
      >
        <CodeBlock label="Tools auto-discovered from MCP server" lang="json" code={SCHEMA_EXAMPLE} />
      </MarketingSection>

      <MarketingSection>
        <div className="rounded-3xl bg-neutral-950 text-white p-10 lg:p-12">
          <Boxes className="size-7 mb-5 text-white/70" />
          <h2 className="text-3xl md:text-4xl font-normal tracking-tight mb-3">
            Need a tool we don&apos;t have?
          </h2>
          <p className="text-white/70 leading-relaxed mb-7 max-w-xl">
            Write an MCP server in any language. We&apos;ll host it for you on
            Pro and Enterprise plans, or you can self-host and point Callen at
            it.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white text-neutral-950 text-sm font-normal hover:bg-white/90 transition-colors"
          >
            Talk to engineering <ArrowRight className="size-4" />
          </Link>
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
