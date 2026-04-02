-- ============================================================
-- Insurance OS — initial schema
-- Model: Households → People → Policies → Revenue
-- ============================================================

-- ------------------------------------------------------------
-- Shared updated_at trigger function
-- ------------------------------------------------------------
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ------------------------------------------------------------
-- households
-- ------------------------------------------------------------
create table households (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  address_line1  text,
  address_line2  text,
  city           text,
  state          text,
  zip            text,
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create trigger set_updated_at
  before update on households
  for each row execute function set_updated_at();


-- ------------------------------------------------------------
-- people
-- ------------------------------------------------------------
create table people (
  id             uuid primary key default gen_random_uuid(),
  household_id   uuid not null references households(id) on delete cascade,
  first_name     text not null,
  last_name      text not null,
  date_of_birth  date,
  relationship   text,   -- head | spouse | dependent
  email          text,
  phone          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create trigger set_updated_at
  before update on people
  for each row execute function set_updated_at();


-- ------------------------------------------------------------
-- policies
-- product_type: medicare_advantage | medicare_supplement | pdp | life | health
-- status:       active | pending | lapsed | terminated
-- ------------------------------------------------------------
create table policies (
  id                         uuid primary key default gen_random_uuid(),
  household_id               uuid not null references households(id) on delete cascade,
  person_id                  uuid not null references people(id) on delete cascade,
  carrier                    text not null,
  plan_name                  text,
  product_type               text not null,
  status                     text not null default 'active',
  effective_date             date,
  termination_date           date,
  renewal_date               date,
  premium_amount             numeric(10, 2),
  expected_commission_amount numeric(10, 2),
  created_at                 timestamptz not null default now(),
  updated_at                 timestamptz not null default now()
);

create trigger set_updated_at
  before update on policies
  for each row execute function set_updated_at();


-- ------------------------------------------------------------
-- review_sessions  (scaffold — no data yet)
-- status: pending | complete | cancelled
-- ------------------------------------------------------------
create table review_sessions (
  id             uuid primary key default gen_random_uuid(),
  household_id   uuid not null references households(id) on delete cascade,
  scheduled_at   timestamptz,
  status         text not null default 'pending',
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create trigger set_updated_at
  before update on review_sessions
  for each row execute function set_updated_at();


-- ------------------------------------------------------------
-- alerts  (scaffold — no data yet)
-- ------------------------------------------------------------
create table alerts (
  id             uuid primary key default gen_random_uuid(),
  household_id   uuid references households(id) on delete cascade,
  policy_id      uuid references policies(id) on delete cascade,
  alert_type     text,
  message        text,
  status         text not null default 'open',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create trigger set_updated_at
  before update on alerts
  for each row execute function set_updated_at();


-- ------------------------------------------------------------
-- opportunities  (scaffold — no data yet)
-- ------------------------------------------------------------
create table opportunities (
  id                uuid primary key default gen_random_uuid(),
  household_id      uuid references households(id) on delete cascade,
  person_id         uuid references people(id) on delete set null,
  opportunity_type  text,
  status            text not null default 'open',
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create trigger set_updated_at
  before update on opportunities
  for each row execute function set_updated_at();


-- ------------------------------------------------------------
-- notes  (scaffold — no data yet)
-- ------------------------------------------------------------
create table notes (
  id             uuid primary key default gen_random_uuid(),
  household_id   uuid references households(id) on delete cascade,
  person_id      uuid references people(id) on delete set null,
  policy_id      uuid references policies(id) on delete set null,
  body           text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create trigger set_updated_at
  before update on notes
  for each row execute function set_updated_at();


-- ------------------------------------------------------------
-- activity_events  (scaffold — no data yet, append-only)
-- ------------------------------------------------------------
create table activity_events (
  id             uuid primary key default gen_random_uuid(),
  household_id   uuid references households(id) on delete cascade,
  person_id      uuid references people(id) on delete set null,
  policy_id      uuid references policies(id) on delete set null,
  event_type     text not null,
  payload        jsonb,
  created_at     timestamptz not null default now()
);
