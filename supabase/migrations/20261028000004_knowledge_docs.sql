-- Knowledge Base documents: restaurant info (about, mission), policies
-- (order, delivery, refund, payment) and FAQs. Plain text a member types,
-- pastes or uploads. The runtime sync appends the enabled documents to
-- each Urdu agent's instructions, next to the menu and deals.

create table public.knowledge_docs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  kind text not null default 'info' check (kind in ('info', 'policy', 'faq')),
  title text not null check (char_length(title) between 1 and 120),
  content text not null default '' check (char_length(content) <= 20000),
  enabled boolean not null default true,
  sort integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index knowledge_docs_workspace_idx on public.knowledge_docs (workspace_id, kind, sort);
create trigger knowledge_docs_updated_at before update on public.knowledge_docs
for each row execute function public.tg_set_updated_at();

alter table public.knowledge_docs enable row level security;

create policy "members read knowledge" on public.knowledge_docs
  for select to authenticated using (private.is_workspace_member(workspace_id));
create policy "members add knowledge" on public.knowledge_docs
  for insert to authenticated with check (private.is_workspace_member(workspace_id));
create policy "members edit knowledge" on public.knowledge_docs
  for update to authenticated
  using (private.is_workspace_member(workspace_id))
  with check (private.is_workspace_member(workspace_id));
create policy "members remove knowledge" on public.knowledge_docs
  for delete to authenticated using (private.is_workspace_member(workspace_id));

grant select, insert, update, delete on public.knowledge_docs to authenticated;
grant all on public.knowledge_docs to service_role;
