// Provision (or update) a real agent end to end without the dashboard:
// agents row in Supabase -> Retell LLM + agent -> ids persisted back.
// With --buy-number it also purchases a Retell-managed number ($2/mo),
// binds it to the agent, and records it in phone_numbers.
//
// Usage:
//   node scripts/provision-test-agent.mjs [--workspace <uuid>] [--buy-number] [--area-code 415]

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import Retell from "retell-sdk";
import { createClient } from "@supabase/supabase-js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// Minimal .env.local loader (no dotenv dependency).
for (const line of readFileSync(resolve(root, ".env.local"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const opt = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};

const AGENT_NAME = "Front Desk (test)";
const SYSTEM_PROMPT = `You are the friendly front-desk receptionist for a small US business using Callen.ai.
Greet callers warmly, answer questions briefly, and offer to take a message with a callback number if you cannot help.
Keep every answer under three sentences. Never make up business details you do not know; offer to take a message instead.`;
const GREETING = "Hi, thanks for calling! This is the Callen AI receptionist. How can I help you today?";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);
const retell = new Retell({ apiKey: process.env.RETELL_API_KEY });
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://callen-ai-pi.vercel.app";

// 1. Resolve target workspace (explicit flag, else first workspace).
let workspaceId = opt("--workspace", null);
if (!workspaceId) {
  const { data } = await supabase.from("workspaces").select("id, name").order("created_at").limit(1);
  if (!data?.length) throw new Error("no workspaces found");
  workspaceId = data[0].id;
  console.log(`workspace: ${data[0].name} (${workspaceId})`);
}

// 2. Ensure the agents row.
let { data: agent } = await supabase
  .from("agents")
  .select("*")
  .eq("workspace_id", workspaceId)
  .eq("name", AGENT_NAME)
  .maybeSingle();

if (!agent) {
  const { data: created, error } = await supabase
    .from("agents")
    .insert({
      workspace_id: workspaceId,
      name: AGENT_NAME,
      system_prompt: SYSTEM_PROMPT,
      greeting: GREETING,
      voice_id: "cartesia-Grace",
      language: "en-US",
      provider: "retell",
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  agent = created;
  console.log(`agents row created: ${agent.id}`);
} else {
  console.log(`agents row exists: ${agent.id}`);
}

// 3. Sync to Retell (same payload shapes as src/lib/retell/agent-sync.ts).
const llmPayload = {
  general_prompt: agent.system_prompt,
  begin_message: agent.greeting,
  model: "gemini-3.0-flash",
};
let llmId = agent.provider_llm_id ?? null;
if (llmId) {
  await retell.llm.update(llmId, llmPayload);
} else {
  llmId = (await retell.llm.create(llmPayload)).llm_id;
}

const agentPayload = {
  agent_name: agent.name,
  voice_id: agent.voice_id ?? "cartesia-Grace",
  language: "en-US",
  response_engine: { type: "retell-llm", llm_id: llmId },
  webhook_url: `${siteUrl}/api/webhooks/retell`,
};
let providerAgentId = agent.provider_agent_id;
if (providerAgentId) {
  await retell.agent.update(providerAgentId, agentPayload);
  console.log(`retell agent updated: ${providerAgentId}`);
} else {
  providerAgentId = (await retell.agent.create(agentPayload)).agent_id;
  console.log(`retell agent created: ${providerAgentId}`);
}

const { error: persistError } = await supabase
  .from("agents")
  .update({
    provider_agent_id: providerAgentId,
    provider_llm_id: llmId,
    status: "active",
  })
  .eq("id", agent.id);
if (persistError) throw new Error(persistError.message);
console.log("provider ids persisted to agents row");

// 4. Optionally buy and bind a number.
if (flag("--buy-number")) {
  const areaCode = Number(opt("--area-code", "415"));
  const purchased = await retell.phoneNumber.create({
    area_code: areaCode,
    nickname: `${AGENT_NAME} (Callen)`,
    inbound_agents: [{ agent_id: providerAgentId, weight: 1 }],
  });
  console.log(`number purchased: ${purchased.phone_number}`);
  const { error: numError } = await supabase.from("phone_numbers").insert({
    workspace_id: workspaceId,
    agent_id: agent.id,
    e164: purchased.phone_number,
    provider: "retell",
    provider_number_id: purchased.phone_number,
    status: "active",
    monthly_cost_cents: 200,
  });
  if (numError) {
    await retell.phoneNumber.delete(purchased.phone_number).catch(() => {});
    throw new Error(`number bought but not persisted (released it): ${numError.message}`);
  }
  console.log("phone_numbers row inserted");
  console.log(`\nCALL THIS NUMBER FROM YOUR PHONE: ${purchased.phone_number}`);
} else {
  console.log("\nskipped number purchase (run with --buy-number to buy + bind, $2/mo)");
}
