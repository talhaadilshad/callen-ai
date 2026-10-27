// Custom-agents store — now backed by Supabase (agents table) instead of
// localStorage. The interface is unchanged from the localStorage era so
// every consumer (wizard, list, editor) keeps working:
//   - addAgent returns the new id synchronously (uuid generated client
//     side; the insert runs in the background)
//   - updateAgent / removeAgent apply optimistically and persist async
//   - publishing (status -> "published") also syncs the agent to the
//     voice runtime via POST /api/agents/:id/sync
//   - removeAgent goes through DELETE /api/agents/:id so the runtime
//     agent is torn down and its numbers unbound
//
// DB mapping: name/system_prompt/greeting/voice_id/status live in their
// own columns; wizard-specific fields (type, industry, useCase, website,
// mainGoal, chatOnly, llm, languages, behaviorTraits, voice tuning) ride
// in the settings jsonb. Runtime ids (provider, provider_agent_id,
// provider_llm_id) are server-owned: members cannot write them.

import { create } from "zustand";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import {
  buildSystemPrompt,
  buildFirstMessage,
  DEFAULT_LLM_ID,
} from "./agent-meta";

export type CustomAgentType = "personal" | "business" | "blank";
export type CustomAgentStatus = "draft" | "published";

// Voice tuning ("mood") — passed through to the runtime on sync.
export type VoiceTuning = {
  voiceSpeed: number;              // 0.5 - 2, default 1
  voiceTemperature: number;        // 0 - 2, default 1 (expressiveness)
  responsiveness: number;          // 0 - 1, default 1 (how eagerly it replies)
  interruptionSensitivity: number; // 0 - 1, default 1 (barge-in eagerness)
  backchannel: boolean;            // "mm-hmm", "I see" while caller talks
};

export const DEFAULT_VOICE_TUNING: VoiceTuning = {
  voiceSpeed: 1,
  voiceTemperature: 1,
  responsiveness: 1,
  interruptionSensitivity: 1,
  backchannel: true,
};

export type CustomAgent = {
  id: string;
  name: string;
  type: CustomAgentType | null;
  industry: string | null;
  useCase: string | null;
  voiceId: string;             // -> Voice in voice-library (real Retell id)
  website: string;
  mainGoal: string;
  chatOnly: boolean;
  systemPrompt: string;
  firstMessage: string;
  llm: string;                 // LlmModel.id (real Retell model id)
  defaultLanguage: string;
  additionalLanguages: string[];
  behaviorTraits: string[];
  voiceTuning: VoiceTuning;
  createdAt: string;
  status: CustomAgentStatus;
};

type AddInput = {
  name: string;
  type: CustomAgentType | null;
  industry: string | null;
  useCase: string | null;
  voiceId: string;
  website: string;
  mainGoal: string;
  chatOnly: boolean;
  systemPrompt?: string;
  firstMessage?: string;
  llm?: string;
  defaultLanguage?: string;
  additionalLanguages?: string[];
  behaviorTraits?: string[];
};

type Store = {
  agents: CustomAgent[];
  loaded: boolean;
  syncingIds: string[];
  load: () => Promise<void>;
  addAgent: (a: AddInput) => string;       // returns new id
  updateAgent: (id: string, patch: Partial<CustomAgent>) => void;
  removeAgent: (id: string) => void;
  regeneratePromptForAgent: (id: string) => void;
  /** Push an agent's config to the voice runtime (Retell). */
  syncAgent: (id: string) => Promise<void>;
};

const supabase = createClient();

type AgentRow = {
  id: string;
  name: string;
  status: string;
  language: string;
  system_prompt: string;
  greeting: string | null;
  voice_id: string | null;
  settings: Record<string, unknown> | null;
  created_at: string;
};

function rowToAgent(row: AgentRow): CustomAgent {
  const s = (row.settings ?? {}) as Record<string, unknown>;
  return {
    id: row.id,
    name: row.name,
    type: (s.type as CustomAgentType) ?? null,
    industry: (s.industry as string) ?? null,
    useCase: (s.useCase as string) ?? null,
    voiceId: row.voice_id ?? "eryn",
    website: (s.website as string) ?? "",
    mainGoal: (s.mainGoal as string) ?? "",
    chatOnly: Boolean(s.chatOnly),
    systemPrompt: row.system_prompt,
    firstMessage: row.greeting ?? "",
    llm: (s.model as string) ?? DEFAULT_LLM_ID,
    defaultLanguage: languageFromCode(row.language),
    additionalLanguages: [],
    behaviorTraits: (s.behaviorTraits as string[]) ?? [],
    voiceTuning: { ...DEFAULT_VOICE_TUNING, ...((s.voiceTuning as VoiceTuning) ?? {}) },
    createdAt: row.created_at,
    status: row.status === "active" ? "published" : "draft",
  };
}

// agents.language <-> the editor's language label.
function languageFromCode(code: string | null): string {
  return code?.toLowerCase().startsWith("ur") ? "Urdu" : "English";
}
function languageToCode(label: string): string {
  return label === "Urdu" ? "ur-PK" : "en-US";
}

// Only the columns members may write (see the column grants in the
// harden_runtime_wiring migration). id is added on insert.
function agentToRow(a: CustomAgent) {
  return {
    name: a.name,
    status: a.status === "published" ? "active" : "draft",
    system_prompt: a.systemPrompt,
    greeting: a.firstMessage,
    voice_id: a.voiceId,
    // The server picks the runtime from this: ur-* runs on Uplift.
    language: languageToCode(a.defaultLanguage),
    settings: {
      type: a.type,
      industry: a.industry,
      useCase: a.useCase,
      website: a.website,
      mainGoal: a.mainGoal,
      chatOnly: a.chatOnly,
      model: a.llm,
      behaviorTraits: a.behaviorTraits,
      voiceTuning: a.voiceTuning,
    },
  };
}

// Resolve (and cache) the signed-in user's workspace id.
let workspaceIdPromise: Promise<string | null> | null = null;
function getWorkspaceId(): Promise<string | null> {
  workspaceIdPromise ??= (async () => {
    const { data } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .order("created_at")
      .limit(1);
    return data?.[0]?.workspace_id ?? null;
  })();
  return workspaceIdPromise;
}

const resyncQueued = new Set<string>();

function reportError(action: string, message: string) {
  console.error(`[agents] ${action} failed:`, message);
  toast.error(`Could not ${action}`, { description: message });
}

export const useCustomAgentsStore = create<Store>()((set, get) => ({
  agents: [],
  loaded: false,
  syncingIds: [],

  load: async () => {
    const { data, error } = await supabase
      .from("agents")
      .select("id, name, status, language, system_prompt, greeting, voice_id, settings, created_at")
      .order("created_at", { ascending: false });
    if (error) {
      reportError("load agents", error.message);
      set({ loaded: true });
      return;
    }
    set({ agents: (data as AgentRow[]).map(rowToAgent), loaded: true });
  },

  addAgent: (input) => {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const behaviorTraits = input.behaviorTraits ?? ["respectful", "patient", "warm"];

    const generated = buildSystemPrompt({
      name: input.name,
      industry: input.industry,
      useCase: input.useCase,
      website: input.website,
      mainGoal: input.mainGoal,
      defaultLanguage: "English",
      additionalLanguages: [],
      behaviorTraits,
    });

    const firstMessage =
      input.firstMessage ??
      buildFirstMessage({ name: input.name, useCase: input.useCase });

    const agent: CustomAgent = {
      id,
      name: input.name,
      type: input.type,
      industry: input.industry,
      useCase: input.useCase,
      voiceId: input.voiceId,
      website: input.website,
      mainGoal: input.mainGoal,
      chatOnly: input.chatOnly,
      systemPrompt: input.systemPrompt ?? generated,
      firstMessage,
      llm: input.llm ?? DEFAULT_LLM_ID,
      defaultLanguage: "English",
      additionalLanguages: [],
      behaviorTraits,
      voiceTuning: { ...DEFAULT_VOICE_TUNING },
      createdAt: now,
      status: "draft",
    };
    set((s) => ({ agents: [agent, ...s.agents] }));

    void (async () => {
      const workspaceId = await getWorkspaceId();
      if (!workspaceId) {
        reportError("create agent", "no workspace for this account");
        return;
      }
      const { error } = await supabase
        .from("agents")
        .insert({ ...agentToRow(agent), id, workspace_id: workspaceId });
      if (error) reportError("create agent", error.message);
    })();

    return id;
  },

  updateAgent: (id, patch) => {
    set((s) => ({
      agents: s.agents.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    }));
    const agent = get().agents.find((a) => a.id === id);
    if (!agent) return;

    void (async () => {
      const { error } = await supabase
        .from("agents")
        .update(agentToRow(agent))
        .eq("id", id);
      if (error) {
        reportError("save agent", error.message);
        return;
      }
      // Publishing (or editing a published agent) pushes to the runtime.
      if (agent.status === "published") void get().syncAgent(id);
    })();
  },

  removeAgent: (id) => {
    set((s) => ({ agents: s.agents.filter((a) => a.id !== id) }));
    void (async () => {
      const res = await fetch(`/api/agents/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        reportError("delete agent", body?.error ?? `delete failed (${res.status})`);
      }
    })();
  },

  regeneratePromptForAgent: (id) => {
    const agent = get().agents.find((a) => a.id === id);
    if (!agent) return;
    const systemPrompt = buildSystemPrompt({
      name: agent.name,
      industry: agent.industry,
      useCase: agent.useCase,
      website: agent.website,
      mainGoal: agent.mainGoal,
      defaultLanguage: "English",
      additionalLanguages: [],
      behaviorTraits: agent.behaviorTraits,
    });
    const firstMessage = buildFirstMessage({
      name: agent.name,
      useCase: agent.useCase,
    });
    get().updateAgent(id, { systemPrompt, firstMessage });
  },

  syncAgent: async (id) => {
    // A save while a sync is in flight must not be lost: queue one more
    // run, which picks up the latest saved row.
    if (get().syncingIds.includes(id)) {
      resyncQueued.add(id);
      return;
    }
    set((s) => ({ syncingIds: [...s.syncingIds, id] }));
    try {
      const res = await fetch(`/api/agents/${id}/sync`, { method: "POST" });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? `sync failed (${res.status})`);
      }
      toast.success("Agent is live", {
        description: "Config pushed to the voice runtime.",
      });
    } catch (err) {
      reportError("sync agent to runtime", err instanceof Error ? err.message : "unknown error");
    } finally {
      set((s) => ({ syncingIds: s.syncingIds.filter((x) => x !== id) }));
      if (resyncQueued.delete(id)) void get().syncAgent(id);
    }
  },
}));

// Same name + semantics as the old localStorage hydration hook: returns
// true once agents have been loaded from the database.
export function useCustomAgentsHydrated() {
  const loaded = useCustomAgentsStore((s) => s.loaded);
  useEffect(() => {
    if (!useCustomAgentsStore.getState().loaded) {
      void useCustomAgentsStore.getState().load();
    }
  }, []);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    if (loaded) setHydrated(true);
  }, [loaded]);
  return hydrated;
}
