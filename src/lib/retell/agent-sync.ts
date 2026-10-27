// Pushes a Callen agent row to Retell: one Retell LLM (the brain config)
// + one Retell Agent (voice + transport) per Callen agent. Stores the
// resulting ids back on the row so subsequent saves update in place.

import "server-only";
import { retell } from "@/lib/retell/client";
import { toRetellVoiceId } from "@/lib/retell/voice-map";
import { SITE_URL } from "@/lib/site-url";

// Cheapest strong tool-calling default; override per-agent via
// agents.settings.model.
const DEFAULT_MODEL = "gemini-3.0-flash" as const;

export type CallenAgentRow = {
  id: string;
  workspace_id: string;
  name: string;
  system_prompt: string;
  greeting: string | null;
  voice_id: string | null;
  language: string;
  provider_agent_id: string | null;
  provider_llm_id: string | null;
  settings: Record<string, unknown>;
};

export type AgentSyncResult = {
  providerAgentId: string;
  providerLlmId: string;
  // Which ids this call created (vs updated), so the caller can roll
  // them back if persisting them fails.
  createdAgent: boolean;
  createdLlm: boolean;
};

// Voice tuning saved by the dashboard's mood controls (settings.voiceTuning).
type VoiceTuning = {
  voiceSpeed?: number;
  voiceTemperature?: number;
  responsiveness?: number;
  interruptionSensitivity?: number;
  backchannel?: boolean;
};

export async function syncAgentToRetell(agent: CallenAgentRow): Promise<AgentSyncResult> {
  const client = retell();
  const model = (agent.settings?.model as typeof DEFAULT_MODEL) ?? DEFAULT_MODEL;
  const tuning = (agent.settings?.voiceTuning as VoiceTuning) ?? {};

  const llmPayload = {
    general_prompt: agent.system_prompt,
    begin_message: agent.greeting ?? null,
    model,
  };

  let llmId = agent.provider_llm_id;
  const createdLlm = !llmId;
  if (llmId) {
    await client.llm.update(llmId, llmPayload);
  } else {
    llmId = (await client.llm.create(llmPayload)).llm_id;
  }

  // Retell agents have no metadata field (metadata is per call), so the
  // webhook correlates calls back to us via provider_agent_id.
  const agentPayload = {
    agent_name: agent.name,
    voice_id: toRetellVoiceId(agent.voice_id),
    language: "en-US" as const,
    response_engine: { type: "retell-llm" as const, llm_id: llmId },
    webhook_url: `${SITE_URL}/api/webhooks/retell`,
    // Mood controls from the dashboard. Defaults match Retell's.
    voice_speed: tuning.voiceSpeed ?? 1,
    voice_temperature: tuning.voiceTemperature ?? 1,
    responsiveness: tuning.responsiveness ?? 1,
    interruption_sensitivity: tuning.interruptionSensitivity ?? 1,
    enable_backchannel: tuning.backchannel ?? true,
  };

  let providerAgentId = agent.provider_agent_id;
  const createdAgent = !providerAgentId;
  try {
    if (providerAgentId) {
      await client.agent.update(providerAgentId, agentPayload);
    } else {
      providerAgentId = (await client.agent.create(agentPayload)).agent_id;
    }
  } catch (err) {
    // Don't leave a brand-new LLM behind that nothing references.
    if (createdLlm) await client.llm.delete(llmId).catch(() => {});
    throw err;
  }

  return { providerAgentId, providerLlmId: llmId, createdAgent, createdLlm };
}

// Best-effort removal of runtime resources (rollback + agent deletion).
export async function deleteRetellAgent(ids: {
  providerAgentId?: string | null;
  providerLlmId?: string | null;
}) {
  const client = retell();
  if (ids.providerAgentId) await client.agent.delete(ids.providerAgentId).catch(() => {});
  if (ids.providerLlmId) await client.llm.delete(ids.providerLlmId).catch(() => {});
}
