create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  email text not null,
  team_size integer,
  total_current_spend numeric(10, 2) not null default 0,
  total_optimized_spend numeric(10, 2) not null default 0,
  total_savings numeric(10, 2) not null default 0,
  consultation_requested boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_tools (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  tool_name text not null,
  current_tier text,
  seats integer not null default 0,
  monthly_total numeric(10, 2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_recommendations (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  tool_name text not null,
  issue text not null,
  suggestion text not null,
  monthly_savings numeric(10, 2) not null default 0,
  created_at timestamptz not null default now()
);

alter table public.leads enable row level security;
alter table public.audit_tools enable row level security;
alter table public.audit_recommendations enable row level security;

create policy "Allow anonymous lead inserts"
on public.leads
for insert
to anon
with check (true);

create policy "Allow anonymous audit tool inserts"
on public.audit_tools
for insert
to anon
with check (true);

create policy "Allow anonymous recommendation inserts"
on public.audit_recommendations
for insert
to anon
with check (true);
