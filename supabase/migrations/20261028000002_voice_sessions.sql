-- Browser "Talk live" sessions. One row per session token we mint, so
-- the voice-session route can rate-limit (every session costs runtime
-- minutes) and later webhooks can tie a web session back to its user.
-- Written by the server only (service role); members read.

create table public.voice_sessions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  agent_id uuid references public.agents(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  provider text not null,
  room_name text,
  created_at timestamptz not null default now()
);
create index voice_sessions_user_created_idx on public.voice_sessions (user_id, created_at desc);
create index voice_sessions_workspace_created_idx on public.voice_sessions (workspace_id, created_at desc);

alter table public.voice_sessions enable row level security;

create policy "members read voice sessions" on public.voice_sessions
  for select to authenticated using (private.is_workspace_member(workspace_id));

grant select on public.voice_sessions to authenticated;
grant all on public.voice_sessions to service_role;
