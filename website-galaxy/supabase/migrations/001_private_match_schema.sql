-- Optional production database structure for Galaxy Elite Private Match.
-- Run inside Supabase SQL editor after creating your project.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text,
  verification_level text default 'unverified',
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "profiles are readable by owner" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles can be inserted by owner" on public.profiles
  for insert with check (auth.uid() = id);

create table if not exists public.match_audit_log (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id),
  event_type text not null,
  event_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table public.match_audit_log enable row level security;

create policy "users see own audit log" on public.match_audit_log
  for select using (auth.uid() = user_id);
