# Urdu voice agents on Uplift AI

Status: Phases 1 and 2 done (2026-10-28). Replaces the earlier LiveKit plan.

Decision (2026-10-28): Uplift runs the whole Urdu stack. Soniox is used *inside* Uplift for STT (Uplift's default for Urdu), and is available as a TTS choice per agent (`soniox:<Voice>`). We are not self-hosting a LiveKit/Pipecat pipeline; revisit only if cost, limits or Uplift itself become a problem.

## The idea in one line

Uplift AI runs Urdu agents for us the same way Retell runs English ones. Callen.ai stays the dashboard; each agent is sent to whichever provider fits its language.

| | English agents | Urdu agents |
|---|---|---|
| Runtime | Retell | **Uplift AI Voice Agents** |
| Ears (STT) | Retell | Uplift (Soniox, default language `ur`) |
| Brain (LLM) | Retell (Gemini/GPT) | Uplift (Google or OpenAI model we pick) |
| Mouth (TTS) | Retell voices | **Uplift Urdu voices** |
| Phone numbers | US, bought by API | Pakistani, requested from Uplift by email (self-serve "in the works") |
| Browser test calls | Not yet | Uplift web session token |
| After-call report | Retell webhook | Uplift webhook + session detail API |
| Price | Retell per-minute | $0.03/min web, $0.04/min phone, flat |

No Python worker and no extra hosting: Uplift hosts the pipeline.

## How each flow works

**Saving an Urdu agent**
1. User saves an agent with language Urdu in the editor.
2. Our server calls Uplift `POST /v1/realtime-assistants` (or the update endpoint) with the prompt, greeting, Uplift voice id, STT and LLM choice.
3. We store the returned `realtimeAssistantId` in `agents.provider_agent_id`, with `provider = 'uplift'`.

**Talking to it in the browser**
1. User clicks "Talk live".
2. Our server calls `POST /v1/realtime-assistants/{id}/session` with our secret key and gets back `{ token, wsUrl }`.
3. The browser joins with the LiveKit client library (`livekit-client`). Uplift's agent joins the same room on their side.
4. The Uplift key never reaches the browser. `variables` and `additionalInstructions` are readable in the token, so never put secrets there.

**A phone call**
1. A customer dials the Pakistani number Uplift assigned to the agent.
2. Uplift answers with that agent and handles the whole call.

**After any call (web or phone)**
1. Uplift sends `call.completed` to `/api/webhooks/uplift`. One webhook per Uplift project covers every agent, so we match tenants by `assistantId`.
2. The payload has no transcript, so we fetch `GET /realtime-assistants/sessions/{sessionId}/detail`.
3. We save `calls`, `call_turns` and `usage_events`, the same way the Retell webhook does.

## Phases

### Phase 0: try it in the Uplift portal (half a day)
Build one Urdu agent by hand in the Uplift Calling portal and talk to it in the browser.
- Judge Urdu quality, how well it understands mixed Urdu/English, and reply speed.
- Pick a starting STT, LLM and 3 or 4 voices.
- **Done when:** you decide go or no-go.

### Phase 1: sync agents to Uplift ✅ done
- `src/lib/voice-runtime.ts` picks the runtime from `agents.language` (`ur*` -> Uplift, else Retell) and dispatches; routes never call a provider directly.
- `src/lib/uplift/`: `client.ts` (fetch wrapper, `UPLIFT_API_KEY`), `voice-map.ts` (voice + model mapping), `agent-sync.ts` (create or full-replace update, then publish the draft every sync; a new assistant is deleted if publish fails).
- Sync route sets `provider` server-side and tears down the old runtime agent if the language switches runtimes (blocked while a number is bound).
- Delete route deletes the Uplift assistant. Numbers route refuses Urdu agents (Uplift assigns those numbers).
- No migration needed: `agents.provider` has no check constraint.
- Not yet reachable from the UI: the store still saves every agent as `en-US` until Phase 4.
- Voice ids: `uplift:<id>` or `soniox:<Voice>`; default `helpdesk-agent` (the only id in Uplift's docs, swap after the portal test). Mood controls are not mapped to Uplift yet.

### Phase 2: "Talk live" in the editor ✅ done
- `POST /api/agents/[id]/voice-session` (`src/lib/uplift/sessions.ts`): checks login, loads the agent under RLS, requires a published Uplift agent, mints `{ token, wsUrl }` from Uplift (retries Uplift's 503 right after a publish), maps Uplift's 402 to "out of credits".
- Rate limits via the new `voice_sessions` table (migration `20261028000002`): one start per user per 30 seconds, 30 per workspace per day.
- `src/components/agent/live-call-panel.tsx`: replaces the browser-TTS preview for Urdu agents. Joins with `livekit-client` 2.22.4, plays the agent's audio, mic mute, live captions from the `lk.transcription` text stream (if Uplift publishes them), hangs up after 10 minutes.
- The agent store now keeps `agents.language` (it used to force `en-US`), so an Urdu agent survives saves.
- Tested live on 2026-10-28: publish created the Uplift assistant, Talk live connected, the Urdu greeting played, the agent understood spoken Urdu and replied in Urdu, captions showed both sides (duplicate interim captions fixed in 7fc6f61).
- Until Phase 4, make an agent Urdu by setting `language = 'ur-PK'` in Supabase, then Publish it in the editor.

### Phase 3: Uplift webhook (about 1 day)
- `/api/webhooks/uplift`: verify `x-uplift-ai-signature` (`t=<seconds>,v1=<hex>`, HMAC-SHA256 of `${t}.${rawBody}` with the signing secret, reject if older than 5 minutes). Answer `ping` with 204.
- Dedupe on `eventId`, fetch session detail, map `speaker` agent/caller and `atSec` into `call_turns`, save the summary headline.
- Same failure rules as the Retell webhook: return 5xx to get a retry (Uplift retries after 30 s, 5 min and 30 min).
- Migration: `calls.channel` (`phone` | `web`), since Uplift reports web sessions as `inbound`.
- **Done when:** a finished Urdu conversation appears on the Calls page with its transcript and summary.

### Phase 4: Urdu in the agent builder (1 to 2 days)
- Add Urdu to `LANGUAGES`; choosing it switches the provider to Uplift.
- Urdu voice section with Uplift voices and preview clips generated once through Uplift's TTS API.
- Urdu prompt templates that ask for Nastaliq script (Uplift's own advice), short turns, and numbers written as words.
- **Done when:** a new user can create an Urdu agent and talk to it without touching the database.

### Phase 5: a Pakistani phone number (depends on Uplift)
- Email founders@upliftai.org for a number on the assistant. Record it in `phone_numbers` (from an admin script until Uplift has a numbers API).
- **Done when:** calling the number reaches the Urdu agent and the call shows on the Calls page.

**Total: roughly 5 to 7 working days**, plus however long Uplift takes to assign a number.

## Things to know

- **One Uplift account serves every Callen customer**, the same as Retell. Webhooks arrive for all agents, so the `assistantId` lookup must be correct.
- **No cost field** in Uplift's session detail. We compute cost from duration × the flat rate.
- **Numbers are manual for now.** A customer can't buy an Urdu number from the dashboard until Uplift releases self-serve numbers.
- **Young vendor.** Keep everything behind `src/lib/uplift/` so the provider can be swapped later.
- **Free tier:** 10 call minutes, enough for Phase 0.

## Accounts and keys
- Uplift project API key (`sk_api_...`) as `UPLIFT_API_KEY`
- Uplift webhook signing secret (generated in the portal) as `UPLIFT_WEBHOOK_SECRET`
- Nothing else new: no LiveKit account, no OpenAI key, no worker host
