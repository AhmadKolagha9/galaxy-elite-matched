-- Galaxy Elite Private Match: admin approval, verified listing and investor post additions.
-- This migration is a production starting point. Review with your Supabase developer before running.

create table if not exists public.admin_decisions (
  id uuid primary key default gen_random_uuid(),
  collection text not null,
  submission_id text not null,
  approval_status text not null default 'pending',
  public_status text not null default 'Hidden',
  verification_level text not null default 'Not started',
  compliance_notes text,
  decided_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.verified_listing_requests (
  id uuid primary key default gen_random_uuid(),
  submitter_id uuid references auth.users(id),
  approval_status text not null default 'pending',
  public_status text not null default 'Hidden',
  verification_level text not null default 'Not started',
  submitter_role text not null,
  listing_intent text not null,
  market_segment text not null,
  purpose text not null,
  country text not null,
  city_area text not null,
  project_name text,
  building_name text,
  property_type text not null,
  size text,
  price_range text not null,
  availability_date text,
  ownership_status text not null,
  permit_status text not null,
  description text not null,
  contact_name text not null,
  contact_email text not null,
  contact_phone text not null,
  uploaded_documents jsonb not null default '[]'::jsonb,
  compliance_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.investor_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  approval_status text not null default 'pending',
  public_status text not null default 'Hidden',
  investor_profile text not null,
  investor_goal text not null,
  market_segment text not null,
  country text not null,
  city_area text not null,
  property_type text not null,
  ticket_size text not null,
  target_yield text,
  risk_preference text not null,
  timeline text not null,
  budget_visibility text not null,
  agent_preference text not null,
  description text not null,
  contact_name text not null,
  contact_email text not null,
  contact_phone text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Suggested RLS direction:
-- 1. Only admins should update approval_status/public_status/verification_level.
-- 2. Submitters may insert their own records.
-- 3. Public Interest Board should read only approved rows with public_status in ('Open','Matching','Matched','Archived').
-- 4. Sensitive documents should be stored in private Supabase Storage buckets with signed URLs.
