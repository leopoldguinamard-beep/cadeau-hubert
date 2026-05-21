-- =============================================
-- SCHEMA "Un cadeau pour Hubert"
-- Coller dans Supabase > SQL Editor > New Query
-- =============================================

-- Projects table
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  admin_token uuid not null default gen_random_uuid(),
  recipient_name text not null,
  message text,
  admin_email text not null,
  admin_phone text not null,
  round1_end timestamp with time zone not null,
  round2_end timestamp with time zone not null,
  payment_deadline timestamp with time zone not null,
  selected_suggestion_id uuid,
  final_cost numeric(10,2),
  status text not null default 'round1' check (status in ('round1','round2','payment','done')),
  created_at timestamp with time zone default now()
);

-- Participants table
create table if not exists participants (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  email text not null,
  token uuid not null default gen_random_uuid(),
  round1_done boolean not null default false,
  round2_done boolean not null default false,
  created_at timestamp with time zone default now(),
  unique(project_id, email)
);

-- Suggestions table
create table if not exists suggestions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  participant_id uuid not null references participants(id) on delete cascade,
  title text not null,
  description text,
  reason text,
  photo_url text,
  approved boolean not null default false,
  created_at timestamp with time zone default now()
);

-- Budgets table (individual amounts never exposed except as total)
create table if not exists budgets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  participant_id uuid not null references participants(id) on delete cascade,
  amount numeric(10,2) not null check (amount > 0),
  created_at timestamp with time zone default now(),
  unique(project_id, participant_id)
);

-- Votes table
create table if not exists votes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  participant_id uuid not null references participants(id) on delete cascade,
  suggestion_id uuid not null references suggestions(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(project_id, participant_id, suggestion_id)
);

-- Payments table
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  participant_id uuid not null references participants(id) on delete cascade,
  amount_due numeric(10,2) not null,
  paid boolean not null default false,
  created_at timestamp with time zone default now(),
  unique(project_id, participant_id)
);

-- RLS: désactivé pour simplifier (app sans auth)
-- En prod, activer et sécuriser via service role key côté API
alter table projects disable row level security;
alter table participants disable row level security;
alter table suggestions disable row level security;
alter table budgets disable row level security;
alter table votes disable row level security;
alter table payments disable row level security;
