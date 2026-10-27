-- Menu & Deals: what a restaurant sells. The runtime sync turns the
-- available rows into the "Menu" section of each Urdu agent's
-- instructions, so agents only ever quote real items and prices.

create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  kind text not null default 'item' check (kind in ('item', 'deal')),
  category text not null default '',
  name text not null check (char_length(name) between 1 and 120),
  description text not null default '',
  -- Whole rupees. Null = "price on request" (e.g. sizes listed in description).
  price_pkr integer check (price_pkr is null or price_pkr >= 0),
  available boolean not null default true,
  sort integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index menu_items_workspace_idx on public.menu_items (workspace_id, kind, category, sort);
create trigger menu_items_updated_at before update on public.menu_items
for each row execute function public.tg_set_updated_at();

alter table public.menu_items enable row level security;

create policy "members read menu" on public.menu_items
  for select to authenticated using (private.is_workspace_member(workspace_id));
create policy "members add menu items" on public.menu_items
  for insert to authenticated with check (private.is_workspace_member(workspace_id));
create policy "members edit menu items" on public.menu_items
  for update to authenticated
  using (private.is_workspace_member(workspace_id))
  with check (private.is_workspace_member(workspace_id));
create policy "members remove menu items" on public.menu_items
  for delete to authenticated using (private.is_workspace_member(workspace_id));

grant select, insert, update, delete on public.menu_items to authenticated;
grant all on public.menu_items to service_role;
