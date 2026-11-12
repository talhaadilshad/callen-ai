-- Phone number requests for Urdu (Uplift) agents.
-- Uplift has no API to buy numbers: a dedicated Pakistani number is
-- assigned on request (within about a day) and routed to the assistant
-- on their side. So a customer's request is stored here as a
-- 'provisioning' row with no number yet; a platform admin fills in the
-- assigned number, which makes it 'active'.

alter table public.phone_numbers alter column e164 drop not null;

alter table public.phone_numbers
  add column requested_by uuid references auth.users(id) on delete set null,
  add column preferred_city text,
  add column note text,
  add column activated_at timestamptz;

-- Only a pending request may lack a number.
alter table public.phone_numbers
  add constraint phone_numbers_number_when_live
  check (status = 'provisioning' or e164 is not null);

-- One open request per agent.
create unique index phone_numbers_one_pending_per_agent
  on public.phone_numbers (agent_id) where status = 'provisioning';
