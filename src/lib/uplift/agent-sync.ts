// Pushes a Callen agent row to Uplift AI as one "realtime assistant"
// (Uplift hosts the whole STT -> LLM -> TTS pipeline). Used for Urdu
// agents; English agents go to Retell.
//
// Two Uplift rules shape this:
// - Update replaces the whole assistant, so Callen is the source of
//   truth: edits made in the Uplift portal are overwritten on save.
// - Once published, saves only change the draft. We publish on every
//   sync so calls always run what the dashboard shows.

import "server-only";
import { uplift } from "@/lib/uplift/client";
import { toUpliftLlm, toUpliftTts, voiceGender, speakingAsSection } from "@/lib/uplift/voice-map";
import type { CallenAgentRow, AgentSyncResult } from "@/lib/voice-runtime";

type UpliftAssistant = { realtimeAssistantId: string; version: number };

function assistantBody(agent: CallenAgentRow) {
  const greeting = agent.greeting?.trim();
  return {
    name: agent.name,
    description: `Callen.ai agent ${agent.id}`,
    public: false,
    config: {
      agent: {
        // Prompt, then the grammar rule for the voice's gender (so a woman's
        // voice never says "sakta"), then restaurant knowledge.
        instructions: [agent.system_prompt, speakingAsSection(voiceGender(agent.voice_id)), agent.knowledge]
          .filter(Boolean)
          .join("\n\n"),
        initialGreeting: Boolean(greeting),
        ...(greeting
          ? { greetingInstructions: `Open the call by saying exactly this greeting: "${greeting}"` }
          : {}),
      },
      // Soniox is Uplift's recommended Urdu STT (language defaults to ur).
      stt: {
        default: { provider: "soniox", model: "stt-rt-v5", endpointLatencyAdjustmentLevel: 1 },
      },
      tts: { default: toUpliftTts(agent.voice_id) },
      llm: { default: toUpliftLlm(agent.settings?.model) },
    },
  };
}

export async function syncAgentToUplift(agent: CallenAgentRow): Promise<AgentSyncResult> {
  const body = assistantBody(agent);

  let assistantId = agent.provider_agent_id;
  const createdAgent = !assistantId;
  if (assistantId) {
    await uplift<UpliftAssistant>("POST", `/realtime-assistants/${encodeURIComponent(assistantId)}`, body);
  } else {
    assistantId = (await uplift<UpliftAssistant>("POST", "/realtime-assistants", body)).realtimeAssistantId;
  }

  try {
    await uplift("POST", `/realtime-assistants/${encodeURIComponent(assistantId)}/publish`, {
      version: "draft",
      message: "Saved from Callen.ai",
    });
  } catch (err) {
    // A brand-new assistant nobody can call is just clutter.
    if (createdAgent) await deleteUpliftAgent(assistantId);
    throw err;
  }

  return { providerAgentId: assistantId, providerLlmId: null, createdAgent, createdLlm: false };
}

// Best-effort; Uplift answers 204 even for unknown ids.
export async function deleteUpliftAgent(assistantId: string | null | undefined) {
  if (!assistantId) return;
  await uplift("DELETE", `/realtime-assistants/${encodeURIComponent(assistantId)}`).catch(() => {});
}
