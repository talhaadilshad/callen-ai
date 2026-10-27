-- Hardening for the Retell wiring.

-- 1. The Retell LLM id gets its own column. It used to live in
--    settings.provider_llm_id, which the dashboard overwrote on every
--    save, so each sync created a fresh (orphaned) Retell LLM.
alter table public.agents add column provider_llm_id text;

update public.agents
set provider_llm_id = settings->>'provider_llm_id',
    settings = settings - 'provider_llm_id'
where settings ? 'provider_llm_id';

-- 2. Runtime ids are server-only. Members keep full CRUD on the agent's
--    own config, but can no longer point a row at an arbitrary Retell
--    agent/LLM (the sync route would then edit it with the platform key).
--    Column-level grants: anything not listed is denied to authenticated.
revoke insert, update on public.agents from authenticated;
grant insert (id, workspace_id, name, status, system_prompt, greeting, voice_id, language, settings)
  on public.agents to authenticated;
grant update (name, status, system_prompt, greeting, voice_id, language, settings)
  on public.agents to authenticated;

-- 3. One Callen agent per runtime agent: the webhook resolves the
--    workspace from provider_agent_id. NULLs stay distinct (unsynced rows).
create unique index agents_provider_agent_key on public.agents (provider, provider_agent_id);

-- 4. Usage is metered once per call, so a replayed webhook cannot
--    double-bill. NULL call_id rows (sms, rentals) stay distinct.
create unique index usage_events_call_kind_key on public.usage_events (call_id, kind);
