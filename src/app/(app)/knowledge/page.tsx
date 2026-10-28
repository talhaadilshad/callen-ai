// Knowledge Base — everything the Urdu agents know about the restaurant:
// Menu, Deals (menu_items) and documents for restaurant info, policies and
// FAQs (knowledge_docs). Agents only answer from what is here. "Update
// live agents" re-syncs each published agent; the sync route appends the
// enabled content to the agent's instructions.

"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import {
  useCustomAgentsStore,
  useCustomAgentsHydrated,
  getWorkspaceId,
} from "@/lib/custom-agents-store";
import { menuSection, type MenuItem } from "@/lib/menu";
import {
  DOC_KINDS,
  KNOWLEDGE_CHAR_BUDGET,
  knowledgeSection,
  type DocKind,
  type KnowledgeDoc,
} from "@/lib/knowledge";
import { MenuManager } from "@/components/knowledge/menu-manager";
import { DocsManager } from "@/components/knowledge/docs-manager";

const supabase = createClient();

type Tab = "item" | "deal" | DocKind;

const TABS: { id: Tab; label: string }[] = [
  { id: "item", label: "Menu" },
  { id: "deal", label: "Deals" },
  ...DOC_KINDS.map((k) => ({ id: k.kind as Tab, label: k.label })),
];

type Stats = {
  items: number;
  deals: number;
  docs: number;
  chars: number;
};

export default function KnowledgePage() {
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("item");
  const [stats, setStats] = useState<Stats | null>(null);
  const [version, setVersion] = useState(0);
  const [changed, setChanged] = useState(false);
  const [updating, setUpdating] = useState(false);

  const agents = useCustomAgentsStore((s) => s.agents);
  const syncAgent = useCustomAgentsStore((s) => s.syncAgent);
  useCustomAgentsHydrated();
  const liveAgents = agents.filter((a) => a.status === "published" && a.defaultLanguage === "Urdu");

  useEffect(() => {
    void getWorkspaceId().then(setWorkspaceId);
  }, []);

  // Counts + the size of what agents receive, refreshed after every change.
  useEffect(() => {
    if (!workspaceId) return;
    void (async () => {
      const [menu, docs] = await Promise.all([
        supabase
          .from("menu_items")
          .select("kind, category, name, description, price_pkr, available, sort")
          .eq("workspace_id", workspaceId),
        supabase
          .from("knowledge_docs")
          .select("kind, title, content, enabled, sort")
          .eq("workspace_id", workspaceId),
      ]);
      const menuRows = (menu.data ?? []) as Pick<MenuItem, "kind" | "category" | "name" | "description" | "price_pkr" | "available" | "sort">[];
      const docRows = (docs.data ?? []) as Pick<KnowledgeDoc, "kind" | "title" | "content" | "enabled" | "sort">[];
      setStats({
        items: menuRows.filter((r) => r.kind === "item").length,
        deals: menuRows.filter((r) => r.kind === "deal").length,
        docs: docRows.length,
        chars: menuSection(menuRows).length + knowledgeSection(docRows).length,
      });
    })();
  }, [workspaceId, version]);

  function onChanged() {
    setChanged(true);
    setVersion((v) => v + 1);
  }

  async function updateLiveAgents() {
    setUpdating(true);
    for (const a of liveAgents) await syncAgent(a.id);
    setUpdating(false);
    setChanged(false);
  }

  const usage = stats ? Math.min(1, stats.chars / KNOWLEDGE_CHAR_BUDGET) : 0;

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Knowledge Base</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Everything your agents know. They only answer from what is here.
          </p>
        </div>
        <button
          onClick={updateLiveAgents}
          disabled={updating || liveAgents.length === 0}
          title={liveAgents.length === 0 ? "Publish an agent first" : undefined}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-neutral-950 text-white text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-40"
        >
          {updating ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
          Update live agents
        </button>
      </div>

      {changed && liveAgents.length > 0 && (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-900">
          <span>
            {liveAgents.length === 1 ? "Your live agent doesn't know" : `Your ${liveAgents.length} live agents don't know`} about
            these changes yet.
          </span>
          <button onClick={updateLiveAgents} disabled={updating} className="font-semibold underline underline-offset-2">
            Update now
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <SummaryTile label="Menu items" value={stats ? `${stats.items}` : "–"} />
        <SummaryTile label="Deals" value={stats ? `${stats.deals}` : "–"} />
        <SummaryTile label="Documents" value={stats ? `${stats.docs}` : "–"} />
        <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-3.5">
          <p className="text-[11px] uppercase tracking-widest font-semibold text-neutral-500">Agent knowledge</p>
          <p className="text-2xl font-bold tracking-tight mt-1 tabular-nums">{Math.round(usage * 100)}%</p>
          <div className="mt-2 h-1.5 rounded-full bg-neutral-100 overflow-hidden">
            <div
              className={cn("h-full rounded-full", usage > 0.9 ? "bg-red-500" : usage > 0.7 ? "bg-amber-500" : "bg-neutral-900")}
              style={{ width: `${usage * 100}%` }}
            />
          </div>
          <p className="text-[10.5px] text-neutral-500 mt-1 tabular-nums">
            {stats ? stats.chars.toLocaleString() : "–"} of {KNOWLEDGE_CHAR_BUDGET.toLocaleString()} characters
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 rounded-full bg-neutral-100 p-0.5 text-[13px] font-medium mb-5 w-fit">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "px-4 py-1.5 rounded-full transition-colors",
              tab === t.id ? "bg-white text-neutral-950 shadow-sm" : "text-neutral-600 hover:text-neutral-900"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {!workspaceId ? (
        <p className="py-12 text-center text-sm text-neutral-500">Loading...</p>
      ) : tab === "item" || tab === "deal" ? (
        <MenuManager key={tab} kind={tab} workspaceId={workspaceId} onChanged={onChanged} />
      ) : (
        <DocsManager key={tab} kind={tab} workspaceId={workspaceId} onChanged={onChanged} />
      )}
    </div>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-3.5">
      <p className="text-[11px] uppercase tracking-widest font-semibold text-neutral-500">{label}</p>
      <p className="text-2xl font-bold tracking-tight mt-1 tabular-nums">{value}</p>
    </div>
  );
}
