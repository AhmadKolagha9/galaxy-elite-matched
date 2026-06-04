create extension if not exists pgcrypto;

create or replace function public.app_current_user_id()
returns uuid
language sql
stable
as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique,
  full_name text,
  email text,
  phone text,
  whatsapp text,
  country text,
  primary_role text default 'user',
  verification_level text default 'unverified',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role text not null,
  assigned_by uuid,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

create or replace function public.app_has_role(required_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = public.app_current_user_id()
      and role = any(required_roles)
  );
$$;

create table if not exists public.interest_signals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  contact_name text,
  contact_email text,
  contact_phone text,
  submitter_role text,
  purpose text,
  country text,
  area_city text,
  project_name text,
  property_category text,
  property_type text,
  market_segment text,
  size_label text,
  budget_label text,
  budget_visibility text,
  timeline text,
  description text,
  accepts_direct_owner boolean default false,
  accepts_landlord boolean default false,
  accepts_developer boolean default false,
  accepts_agent boolean default false,
  approval_status text not null default 'pending_review',
  public_status text not null default 'hidden',
  verification_status text not null default 'unverified',
  form_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.private_availability (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  contact_name text,
  contact_email text,
  contact_phone text,
  submitter_role text,
  is_representative boolean default false,
  represented_party_type text,
  country text,
  area_city text,
  project_name text,
  building_name text,
  property_category text,
  property_type text,
  market_segment text,
  purpose text,
  size_label text,
  price_label text,
  currency text,
  availability_date date,
  occupancy_status text,
  privacy_level text,
  authority_status text,
  description text,
  approval_status text not null default 'pending_review',
  public_status text not null default 'hidden',
  verification_status text not null default 'unverified',
  form_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.verified_listing_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  contact_name text,
  contact_email text,
  contact_phone text,
  submitter_role text,
  country text,
  area_city text,
  project_name text,
  building_name text,
  property_category text,
  property_type text,
  market_segment text,
  purpose text,
  size_label text,
  bedrooms int,
  bathrooms int,
  price_label text,
  currency text,
  availability_date date,
  ownership_status text,
  permit_status text,
  privacy_level text,
  description text,
  approval_status text not null default 'pending_review',
  public_status text not null default 'hidden',
  verification_status text not null default 'documents_submitted',
  verified_by uuid,
  verified_at timestamptz,
  uploaded_documents jsonb not null default '[]'::jsonb,
  form_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.investor_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  contact_name text,
  contact_email text,
  contact_phone text,
  investor_type text,
  investment_goal text,
  countries text[],
  area_city text,
  property_categories text[],
  property_types text[],
  market_segments text[],
  ticket_label text,
  currency text,
  budget_visibility text,
  target_yield text,
  risk_preference text,
  timeline text,
  holding_period text,
  exit_strategy text,
  description text,
  accepts_direct_owner boolean default false,
  accepts_developer boolean default false,
  accepts_agent boolean default false,
  approval_status text not null default 'pending_review',
  public_status text not null default 'hidden',
  verification_status text not null default 'unverified',
  form_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.agent_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  full_name text,
  email text,
  phone text,
  company_name text,
  country text,
  licence_number text,
  licence_expiry date,
  represents text,
  authority_status text,
  approval_status text not null default 'pending_review',
  public_status text not null default 'hidden',
  verification_status text not null default 'unverified',
  form_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  full_name text,
  segment text,
  status text not null default 'subscribed',
  form_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (email)
);

create table if not exists public.document_uploads (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid,
  related_object_type text not null,
  related_object_id uuid not null,
  document_type text not null,
  storage_bucket text not null,
  storage_path text not null,
  original_filename text,
  mime_type text,
  file_size bigint,
  expiry_date date,
  verification_status text not null default 'under_review',
  verified_by uuid,
  verified_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_actions (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid,
  admin_email text,
  action_type text not null,
  object_type text not null,
  object_id uuid not null,
  previous_status text,
  new_status text,
  note text,
  ip_address text,
  created_at timestamptz not null default now()
);

create table if not exists public.compliance_checks (
  id uuid primary key default gen_random_uuid(),
  object_type text not null,
  object_id uuid not null,
  check_type text not null,
  status text not null default 'pending',
  assigned_to uuid,
  notes text,
  completed_by uuid,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.match_requests (
  id uuid primary key default gen_random_uuid(),
  source_object_type text not null,
  source_object_id uuid not null,
  target_object_type text not null,
  target_object_id uuid not null,
  match_score numeric,
  match_reason text,
  requested_by uuid,
  status text not null default 'pending',
  admin_status text not null default 'pending_review',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.match_rooms (
  id uuid primary key default gen_random_uuid(),
  match_request_id uuid references public.match_requests(id) on delete cascade,
  status text not null default 'pending_participant_approval',
  opened_by uuid,
  opened_at timestamptz,
  contact_unlocked boolean not null default false,
  documents_unlocked boolean not null default false,
  current_stage text not null default 'intro',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.match_room_participants (
  id uuid primary key default gen_random_uuid(),
  match_room_id uuid references public.match_rooms(id) on delete cascade,
  user_id uuid not null,
  role_in_room text not null,
  approval_status text not null default 'pending',
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  unique (match_room_id, user_id)
);

create table if not exists public.taxonomy_items (
  id uuid primary key default gen_random_uuid(),
  taxonomy_type text not null,
  label text not null,
  slug text not null,
  parent_id uuid references public.taxonomy_items(id) on delete set null,
  country_scope text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  notification_type text not null,
  channel text not null default 'email',
  subject text not null,
  body text not null,
  status text not null default 'queued',
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists interest_status_idx on public.interest_signals (approval_status, public_status, verification_status);
create index if not exists interest_location_idx on public.interest_signals (country, area_city, property_type, market_segment);
create index if not exists availability_status_idx on public.private_availability (approval_status, public_status, verification_status);
create index if not exists verified_status_idx on public.verified_listing_requests (approval_status, public_status, verification_status);
create index if not exists investor_status_idx on public.investor_posts (approval_status, public_status, verification_status);
create index if not exists agent_status_idx on public.agent_profiles (approval_status, public_status, verification_status);
create index if not exists document_related_idx on public.document_uploads (related_object_type, related_object_id);
create index if not exists admin_actions_object_idx on public.admin_actions (object_type, object_id, created_at desc);
create unique index if not exists taxonomy_unique_scope_idx on public.taxonomy_items (taxonomy_type, slug, coalesce(country_scope, ''));
create index if not exists taxonomy_lookup_idx on public.taxonomy_items (taxonomy_type, country_scope, is_active, sort_order);
create index if not exists notifications_user_idx on public.notifications (user_id, status, created_at desc);

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.interest_signals enable row level security;
alter table public.private_availability enable row level security;
alter table public.verified_listing_requests enable row level security;
alter table public.investor_posts enable row level security;
alter table public.agent_profiles enable row level security;
alter table public.document_uploads enable row level security;
alter table public.admin_actions enable row level security;
alter table public.compliance_checks enable row level security;
alter table public.match_requests enable row level security;
alter table public.match_rooms enable row level security;
alter table public.match_room_participants enable row level security;
alter table public.taxonomy_items enable row level security;
alter table public.notifications enable row level security;

drop policy if exists profiles_own_select on public.profiles;
create policy profiles_own_select on public.profiles for select using (user_id = public.app_current_user_id() or public.app_has_role(array['admin','compliance','super_admin']));
drop policy if exists roles_admin_select on public.user_roles;
create policy roles_admin_select on public.user_roles for select using (user_id = public.app_current_user_id() or public.app_has_role(array['admin','super_admin']));

drop policy if exists interest_public_select on public.interest_signals;
create policy interest_public_select on public.interest_signals for select using (approval_status = 'approved' and public_status in ('open','matching','matched','archived'));
drop policy if exists interest_own_select on public.interest_signals;
create policy interest_own_select on public.interest_signals for select using (user_id = public.app_current_user_id() or public.app_has_role(array['admin','compliance','super_admin']));
drop policy if exists availability_own_select on public.private_availability;
create policy availability_own_select on public.private_availability for select using (user_id = public.app_current_user_id() or public.app_has_role(array['admin','compliance','super_admin']));
drop policy if exists verified_public_select on public.verified_listing_requests;
create policy verified_public_select on public.verified_listing_requests for select using (approval_status = 'approved' and public_status in ('open','matching','matched','archived'));
drop policy if exists verified_own_select on public.verified_listing_requests;
create policy verified_own_select on public.verified_listing_requests for select using (user_id = public.app_current_user_id() or public.app_has_role(array['admin','compliance','super_admin']));
drop policy if exists investor_public_select on public.investor_posts;
create policy investor_public_select on public.investor_posts for select using (approval_status = 'approved' and public_status in ('open','matching','matched','archived'));
drop policy if exists investor_own_select on public.investor_posts;
create policy investor_own_select on public.investor_posts for select using (user_id = public.app_current_user_id() or public.app_has_role(array['admin','compliance','super_admin']));
drop policy if exists agent_admin_select on public.agent_profiles;
create policy agent_admin_select on public.agent_profiles for select using (user_id = public.app_current_user_id() or public.app_has_role(array['admin','compliance','super_admin']));

drop policy if exists documents_private_select on public.document_uploads;
create policy documents_private_select on public.document_uploads for select using (owner_user_id = public.app_current_user_id() or public.app_has_role(array['admin','compliance','super_admin']));
drop policy if exists admin_actions_admin_select on public.admin_actions;
create policy admin_actions_admin_select on public.admin_actions for select using (public.app_has_role(array['admin','compliance','super_admin']));
drop policy if exists compliance_admin_select on public.compliance_checks;
create policy compliance_admin_select on public.compliance_checks for select using (public.app_has_role(array['admin','compliance','super_admin']));
drop policy if exists taxonomy_public_select on public.taxonomy_items;
create policy taxonomy_public_select on public.taxonomy_items for select using (is_active = true);
drop policy if exists notifications_own_select on public.notifications;
create policy notifications_own_select on public.notifications for select using (user_id = public.app_current_user_id() or public.app_has_role(array['admin','super_admin']));
