// Picks which voice runtime hosts an agent and dispatches to it.
// English agents run on Retell; Urdu agents run on Uplift AI. Routes
// only talk to this module, never to a provider directly.

import "server-only";
import { isRetellConfigured } from "@/lib/retell/client";
import { syncAgentToRetell, deleteRetellAgent } from "@/lib/retell/agent-sync";
import { isUpliftConfigured } from "@/lib/uplift/client";
import { syncAgentToUplift, deleteUpliftAgent } from "@/lib/uplift/agent-sync";

export type Runtime = "retell" | "uplift";

export type CallenAgentRow = {
  id: string;
  workspace_id: string;
  name: string;
  system_prompt: string;
  greeting: string | null;
  voice_id: string | null;
  language: string;
  provider: string;
  provider_agent_id: string | null;
  provider_llm_id: string | null;
  settings: Record<string, unknown>;
  // Restaurant details + menu, appended after system_prompt by the sync
  // route. Kept separate so the editable prompt never has to hold them.
  knowledge?: string;
};

export type AgentSyncResult = {
  providerAgentId: string;
  providerLlmId: string | null;
  // Which ids this call created (vs updated), so the caller can roll
  // them back if persisting them fails.
  createdAgent: boolean;
  createdLlm: boolean;
};

export type RuntimeIds = {
  providerAgentId?: string | null;
  providerLlmId?: string | null;
};

// Urdu (ur, ur-PK, ur-IN) goes to Uplift; everything else to Retell.
export function runtimeForLanguage(language: string | null | undefined): Runtime {
  return language?.toLowerCase().startsWith("ur") ? "uplift" : "retell";
}

export function isRuntime(value: string | null | undefined): value is Runtime {
  return value === "retell" || value === "uplift";
}

export function isRuntimeConfigured(runtime: Runtime): boolean {
  return runtime === "uplift" ? isUpliftConfigured() : isRetellConfigured();
}

export function runtimeEnvVar(runtime: Runtime): string {
  return runtime === "uplift" ? "UPLIFT_API_KEY" : "RETELL_API_KEY";
}

export function syncToRuntime(runtime: Runtime, agent: CallenAgentRow): Promise<AgentSyncResult> {
  return runtime === "uplift" ? syncAgentToUplift(agent) : syncAgentToRetell(agent);
}

// Best-effort: never throws.
export function deleteFromRuntime(runtime: Runtime, ids: RuntimeIds): Promise<void> {
  return runtime === "uplift"
    ? deleteUpliftAgent(ids.providerAgentId)
    : deleteRetellAgent(ids);
}
