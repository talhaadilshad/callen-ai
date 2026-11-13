// /docs/sdks — official SDK overview with install + first-call snippets.

import Link from "next/link";
import { Boxes, ArrowRight } from "lucide-react";
import {
  MarketingShell,
  MarketingHero,
  MarketingSection,
} from "@/components/marketing/marketing-shell";

export const metadata = {
  title: "SDKs",
  description:
    "Official Callen.ai SDKs for Node.js, Python, and Go. Type-safe, fully documented, with first-class TypeScript support.",
};

const SDKS = [
  {
    name: "Node.js",
    status: "Stable",
    install: "npm install @callen/sdk",
    sample: `import { Callen } from "@callen/sdk";

const callen = new Callen({
  apiKey: process.env.CALLEN_API_KEY,
});

const call = await callen.calls.create({
  agentId: "agent_2k7f3a",
  to: "+923214567890",
});

for await (const event of callen.calls.stream(call.id)) {
  if (event.type === "transcript") {
    console.log(\`[\${event.speaker}] \${event.text}\`);
  }
}`,
  },
  {
    name: "Python",
    status: "Stable",
    install: "pip install callen",
    sample: `from callen import Callen

callen = Callen(api_key=os.environ["CALLEN_API_KEY"])

call = callen.calls.create(
    agent_id="agent_2k7f3a",
    to="+923214567890",
)

for event in callen.calls.stream(call.id):
    if event.type == "transcript":
        print(f"[{event.speaker}] {event.text}")`,
  },
  {
    name: "Go",
    status: "Beta",
    install: "go get github.com/callen-ai/sdk-go",
    sample: `client := callen.NewClient(os.Getenv("CALLEN_API_KEY"))

call, err := client.Calls.Create(ctx, &callen.CallParams{
    AgentID: "agent_2k7f3a",
    To:      "+923214567890",
})
if err != nil { log.Fatal(err) }

stream, _ := client.Calls.Stream(ctx, call.ID)
for event := range stream {
    if event.Type == "transcript" {
        fmt.Printf("[%s] %s\\n", event.Speaker, event.Text)
    }
}`,
  },
];

const STATUS_STYLES: Record<string, string> = {
  Stable: "bg-neutral-950 text-white",
  Beta: "bg-shell text-black border border-hairline",
  Alpha: "bg-white text-black border border-neutral-300",
};

export default function SdksPage() {
  return (
    <MarketingShell>
      <MarketingHero orb="lilac"
        eyebrow="SDKs"
        title={
          <>
            Official SDKs for{" "}
            <span>every stack you ship in.</span>
          </>
        }
        lede="Idiomatic, type-safe, fully documented. Node and Python are stable. Go is in public beta. Java and Rust are on the roadmap."
      />

      <MarketingSection>
        <div className="space-y-6">
          {SDKS.map((sdk) => (
            <div
              key={sdk.name}
              className="rounded-3xl border border-hairline overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 lg:px-8 py-5 border-b border-hairline">
                <div className="flex items-center gap-3">
                  <Boxes className="size-5 text-black" />
                  <h3 className="text-lg font-normal tracking-tight">{sdk.name}</h3>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-normal uppercase tracking-wider ${STATUS_STYLES[sdk.status] ?? STATUS_STYLES.Stable}`}
                  >
                    {sdk.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr]">
                <div className="px-6 lg:px-8 py-6 border-r border-hairline">
                  <p className="text-[11px]  text-ink-soft font-normal mb-2">
                    Install
                  </p>
                  <code className="block bg-shell text-neutral-900 rounded-lg px-3 py-2 text-[12.5px] font-mono">
                    {sdk.install}
                  </code>
                </div>
                <div className="bg-neutral-950 text-neutral-100">
                  <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between">
                    <span className="text-[11px]  text-white/50 font-normal">
                      First call
                    </span>
                    <span className="text-[10.5px] font-mono text-white/40">
                      {sdk.name.toLowerCase().split(".")[0]}
                    </span>
                  </div>
                  <pre className="px-5 py-4 text-[12.5px] font-mono leading-relaxed overflow-x-auto thin-scrollbar">
                    <code>{sdk.sample}</code>
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      </MarketingSection>

      <MarketingSection>
        <div className="rounded-3xl bg-neutral-950 text-white p-10 lg:p-14 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 className="text-3xl font-normal tracking-tight mb-2">
              Need a language we don&apos;t ship?
            </h2>
            <p className="text-white/70 leading-relaxed max-w-xl">
              The REST API is OpenAPI 3.1 compliant. Generate clients in 30+
              languages with{" "}
              <code className="font-mono bg-white/10 px-1.5 py-0.5 rounded">
                openapi-generator
              </code>
              .
            </p>
          </div>
          <Link
            href="/docs/api"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white text-neutral-950 text-sm font-normal hover:bg-white/90 transition-colors shrink-0"
          >
            Read the spec <ArrowRight className="size-4" />
          </Link>
        </div>
      </MarketingSection>
    </MarketingShell>
  );
}
