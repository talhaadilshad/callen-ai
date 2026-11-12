// Phone Numbers — Pakistani numbers for Urdu agents.
// Uplift (the voice runtime) has no API to buy numbers: it assigns a
// dedicated number on request and routes it to the agent. So a restaurant
// requests a number here (POST /api/numbers stores a 'provisioning' row),
// the Callen team arranges it with Uplift, then records it in the admin
// panel at the bottom of this page (platform admins only), which makes it
// active. Lists this workspace's numbers from Supabase.

"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  Phone,
  Search,
  CheckCircle2,
  Loader2,
  Clock,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useCustomAgentsStore, useCustomAgentsHydrated } from "@/lib/custom-agents-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type NumberRow = {
  id: string;
  e164: string | null;
  agent_id: string | null;
  status: "provisioning" | "active" | "released";
  preferred_city: string | null;
  created_at: string;
};

type AdminRequest = {
  id: string;
  workspace: string;
  agent: string;
  upliftAssistantId: string | null;
  preferredCity: string | null;
  note: string | null;
  requestedBy: string | null;
  createdAt: string;
};

const supabase = createClient();

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export default function PhoneNumbersPage() {
  const [numbers, setNumbers] = useState<NumberRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [requestOpen, setRequestOpen] = useState(false);
  const [adminRequests, setAdminRequests] = useState<AdminRequest[] | null>(null);

  const agents = useCustomAgentsStore((s) => s.agents);
  useCustomAgentsHydrated();

  const agentName = (id: string | null) =>
    agents.find((a) => a.id === id)?.name ?? "Unassigned";

  async function refresh() {
    const { data, error } = await supabase
      .from("phone_numbers")
      .select("id, e164, agent_id, status, preferred_city, created_at")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Could not load numbers", { description: error.message });
    } else {
      setNumbers((data as NumberRow[]) ?? []);
    }
    setLoaded(true);
  }

  // Only the Callen team gets a list back; everyone else gets admin: false.
  async function refreshAdmin() {
    const res = await fetch("/api/admin/numbers").catch(() => null);
    const body = (await res?.json().catch(() => null)) as
      | { admin?: boolean; requests?: AdminRequest[] }
      | null;
    setAdminRequests(body?.admin ? body.requests ?? [] : null);
  }

  useEffect(() => {
    void refresh();
    void refreshAdmin();
  }, []);

  async function cancelRequest(id: string) {
    const res = await fetch(`/api/numbers/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      toast.error("Could not cancel", { description: body?.error });
      return;
    }
    toast.success("Request cancelled");
    void refresh();
    void refreshAdmin();
  }

  const filtered = useMemo(() => {
    if (!search) return numbers;
    const q = search.toLowerCase();
    return numbers.filter(
      (n) =>
        (n.e164 ?? "").toLowerCase().includes(q) ||
        agentName(n.agent_id).toLowerCase().includes(q)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numbers, search, agents]);

  const activeCount = numbers.filter((n) => n.status === "active").length;
  const pendingCount = numbers.filter((n) => n.status === "provisioning").length;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Phone numbers</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Get a Pakistani number for an agent. Callers dial it and your agent answers in Urdu.
          </p>
        </div>
        <button
          onClick={() => setRequestOpen(true)}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-neutral-950 text-white text-sm font-medium hover:bg-neutral-800 transition-colors"
        >
          <Plus className="size-3.5" />
          Get a number
        </button>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <SummaryTile label="Active numbers" value={`${activeCount}`} sub="taking calls" />
        <SummaryTile
          label="Connected agents"
          value={`${new Set(numbers.filter((n) => n.status === "active").map((n) => n.agent_id).filter(Boolean)).size}`}
          sub="reachable by phone"
        />
        <SummaryTile label="Being set up" value={`${pendingCount}`} sub="usually one business day" />
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-neutral-400 pointer-events-none" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by number or agent..."
          className="pl-9 h-11 bg-white border-neutral-200"
        />
      </div>

      {/* Numbers table */}
      <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden">
        <div className="grid grid-cols-12 px-4 py-2.5 bg-neutral-50/50 border-b border-neutral-200 text-[10px] uppercase tracking-widest font-semibold text-neutral-500">
          <div className="col-span-5">Number</div>
          <div className="col-span-3">Agent</div>
          <div className="col-span-2">Requested</div>
          <div className="col-span-2">Status</div>
        </div>
        {!loaded ? (
          <p className="px-4 py-12 text-center text-sm text-neutral-500">Loading numbers...</p>
        ) : filtered.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="text-sm font-semibold tracking-tight">
              {numbers.length === 0 ? "No numbers yet" : "No numbers match that search"}
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              {numbers.length === 0
                ? "Get a number to put a published agent on a real phone line."
                : "Try a different search."}
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {filtered.map((n) => (
              <motion.div
                key={n.id}
                layout
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="grid grid-cols-12 px-4 py-3 border-b border-neutral-100 last:border-b-0 items-center"
              >
                <div className="col-span-5 flex items-center gap-2.5 min-w-0">
                  <span className="size-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-700 shrink-0">
                    <Phone className="size-3.5" />
                  </span>
                  {n.e164 ? (
                    <p className="text-sm font-semibold tracking-tight tabular-nums truncate">{n.e164}</p>
                  ) : (
                    <div className="min-w-0">
                      <p className="text-sm font-semibold tracking-tight text-neutral-500">Number being set up</p>
                      {n.preferred_city && (
                        <p className="text-[11px] text-neutral-500 truncate">Preferred: {n.preferred_city}</p>
                      )}
                    </div>
                  )}
                </div>
                <div className="col-span-3 text-[12px] text-neutral-700 truncate">{agentName(n.agent_id)}</div>
                <div className="col-span-2 text-[12px] text-neutral-500 tabular-nums">{formatDate(n.created_at)}</div>
                <div className="col-span-2 flex items-center gap-2">
                  {n.status === "active" ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                      <CheckCircle2 className="size-3" /> Active
                    </span>
                  ) : n.status === "provisioning" ? (
                    <>
                      <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 font-medium">
                        <Clock className="size-3" /> Setting up
                      </span>
                      <button
                        onClick={() => cancelRequest(n.id)}
                        className="text-[11px] text-neutral-500 underline underline-offset-2 hover:text-neutral-900"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <span className="text-[11px] text-neutral-500 font-medium">Released</span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      <p className="text-[12px] text-neutral-500 mt-3">
        Numbers are issued by our telephony partner. You can also keep your current restaurant number and
        forward its calls to the new one.
      </p>

      {adminRequests && (
        <AdminRequestsPanel
          requests={adminRequests}
          onFulfilled={() => {
            void refresh();
            void refreshAdmin();
          }}
        />
      )}

      <RequestNumberDialog
        open={requestOpen}
        onClose={() => setRequestOpen(false)}
        onRequested={() => {
          setRequestOpen(false);
          void refresh();
          void refreshAdmin();
        }}
      />
    </div>
  );
}

function SummaryTile({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4">
      <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-semibold mb-1">{label}</p>
      <p className="text-2xl font-bold tracking-tight tabular-nums">{value}</p>
      <p className="text-[11px] text-neutral-500 mt-0.5">{sub}</p>
    </div>
  );
}

// =============================================================
// Request a number
// =============================================================

function RequestNumberDialog({
  open,
  onClose,
  onRequested,
}: {
  open: boolean;
  onClose: () => void;
  onRequested: () => void;
}) {
  const agents = useCustomAgentsStore((s) => s.agents);
  const publishedAgents = agents.filter((a) => a.status === "published");
  const [agentId, setAgentId] = useState("");
  const [preferredCity, setPreferredCity] = useState("");
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (open && !agentId && publishedAgents[0]) setAgentId(publishedAgents[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, publishedAgents.length]);

  async function submit() {
    if (!agentId) {
      toast.error("Pick an agent first");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/numbers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId, preferredCity, note }),
      });
      const body = (await res.json().catch(() => null)) as
        | { number?: { e164: string | null }; requested?: boolean; error?: string }
        | null;
      if (!res.ok) {
        throw new Error(body?.error ?? `Request failed (${res.status})`);
      }
      if (body?.requested) {
        toast.success("Number requested", {
          description: "We'll set it up and it will appear here, usually within one business day.",
        });
      } else {
        toast.success("Number ready", { description: `${body?.number?.e164 ?? "Your number"} is live.` });
      }
      setPreferredCity("");
      setNote("");
      onRequested();
    } catch (err) {
      toast.error("Could not request a number", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <div className="flex items-center gap-2 mb-1">
          <span className="size-7 rounded-md bg-neutral-100 flex items-center justify-center">
            <Phone className="size-4 text-neutral-700" />
          </span>
          <DialogTitle>Get a phone number</DialogTitle>
        </div>
        <DialogDescription>
          A dedicated Pakistani number for this agent. We arrange it with our telephony partner and connect
          it for you, usually within one business day.
        </DialogDescription>

        <div className="space-y-4 mt-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Agent that answers</Label>
            {publishedAgents.length === 0 ? (
              <p className="text-[12px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                You need a published agent first. Create one and hit Publish, then come back here.
              </p>
            ) : (
              <select
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                className="h-10 w-full rounded-md border border-neutral-200 bg-white px-2.5 text-sm"
              >
                {publishedAgents.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Preferred city (optional)</Label>
            <Input
              value={preferredCity}
              onChange={(e) => setPreferredCity(e.target.value.slice(0, 80))}
              placeholder="e.g. Islamabad"
              className="h-10 bg-white border-neutral-200"
            />
            <p className="text-[11px] text-neutral-500">
              We ask for a number from this city where one is available. It can&apos;t be guaranteed.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Anything we should know? (optional)</Label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, 500))}
              rows={2}
              placeholder="e.g. We want to forward our existing line 051-1234567 to it."
              className="w-full rounded-md border border-neutral-200 bg-white px-2.5 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>
        </div>

        <div className="-mx-4 -mb-4 mt-4 flex items-center justify-end gap-2 px-4 py-3 bg-neutral-50/60 border-t border-neutral-100 rounded-b-xl">
          <button
            onClick={onClose}
            className="h-8 px-3 rounded-full text-sm font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={sending || publishedAgents.length === 0}
            className="inline-flex items-center gap-2 h-8 px-4 rounded-full bg-neutral-950 text-white text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-40"
          >
            {sending && <Loader2 className="size-3.5 animate-spin" />}
            {sending ? "Sending..." : "Request number"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// =============================================================
// Callen team: fulfil requests (platform admins only)
// =============================================================

function upliftMailto(r: AdminRequest): string {
  const subject = `Dedicated number request for assistant ${r.upliftAssistantId ?? ""}`.trim();
  const body = [
    "Assalam o Alaikum Uplift team,",
    "",
    "Please assign a dedicated Pakistani number with inbound calls to this assistant:",
    "",
    `Assistant ID: ${r.upliftAssistantId ?? "(not published)"}`,
    `Restaurant: ${r.workspace} / ${r.agent}`,
    `Preferred city: ${r.preferredCity ?? "any"}`,
    ...(r.note ? [`Note: ${r.note}`] : []),
    "",
    "Thank you,",
    "Callen.ai",
  ].join("\n");
  return `mailto:founders@upliftai.org?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function AdminRequestsPanel({
  requests,
  onFulfilled,
}: {
  requests: AdminRequest[];
  onFulfilled: () => void;
}) {
  return (
    <div className="mt-10 rounded-2xl border border-neutral-300 bg-neutral-50/70 p-5">
      <div className="flex items-center gap-2 mb-1">
        <ShieldCheck className="size-4 text-neutral-700" />
        <h2 className="text-sm font-bold tracking-tight">Callen team: number requests</h2>
        <span className="text-[11px] text-neutral-500">({requests.length} open, all workspaces)</span>
      </div>
      <p className="text-[12px] text-neutral-500 mb-4">
        Only platform admins see this. Email Uplift for each request, then enter the number they assign.
      </p>
      {requests.length === 0 ? (
        <p className="text-[13px] text-neutral-500">No open requests.</p>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <AdminRequestRow key={r.id} request={r} onFulfilled={onFulfilled} />
          ))}
        </div>
      )}
    </div>
  );
}

function AdminRequestRow({
  request: r,
  onFulfilled,
}: {
  request: AdminRequest;
  onFulfilled: () => void;
}) {
  const [e164, setE164] = useState("");
  const [saving, setSaving] = useState(false);

  async function activate() {
    setSaving(true);
    const res = await fetch(`/api/admin/numbers/${r.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ e164 }),
    });
    setSaving(false);
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    if (!res.ok) {
      toast.error("Could not activate", { description: body?.error });
      return;
    }
    toast.success(`${e164} is now active for ${r.agent}`);
    onFulfilled();
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[14px] font-semibold tracking-tight">
            {r.workspace} <span className="text-neutral-400">/</span> {r.agent}
          </p>
          <p className="text-[12px] text-neutral-500">
            Requested {formatDate(r.createdAt)}
            {r.requestedBy ? ` by ${r.requestedBy}` : ""} · City: {r.preferredCity ?? "any"}
          </p>
          <p className="text-[11px] text-neutral-500 font-mono mt-1 break-all">
            Uplift assistant: {r.upliftAssistantId ?? "not published"}
          </p>
          {r.note && <p className="text-[12px] text-neutral-700 mt-1">Note: {r.note}</p>}
        </div>
        <a
          href={upliftMailto(r)}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full border border-neutral-200 hover:border-neutral-300 text-[12px] font-medium"
        >
          <Mail className="size-3.5" />
          Email Uplift
        </a>
      </div>
      <div className="flex items-center gap-2 mt-3">
        <Input
          value={e164}
          onChange={(e) => setE164(e.target.value)}
          placeholder="Number Uplift assigned, e.g. +92511234567"
          className="h-9 bg-white border-neutral-200 text-[13px] max-w-xs"
        />
        <button
          onClick={activate}
          disabled={saving || !e164.trim()}
          className="inline-flex items-center gap-2 h-9 px-4 rounded-full bg-neutral-950 text-white text-[13px] font-medium disabled:opacity-40"
        >
          {saving && <Loader2 className="size-3.5 animate-spin" />}
          Activate
        </button>
      </div>
    </div>
  );
}
