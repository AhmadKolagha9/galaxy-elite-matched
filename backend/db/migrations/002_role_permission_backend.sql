create extension if not exists pgcrypto;

create or replace function public.app_valid_roles()
returns text[]
language sql
immutable
as $$
  select array[
    'user',
    'buyer',
    'tenant',
    'investor',
    'owner',
    'landlord',
    'developer',
    'agent',
    'property_manager',
    'representative',
    'corporate_client',
    'family_office',
    'admin',
    'compliance',
    'super_admin'
  ]::text[];
$$;

create or replace function public.app_current_user_id()
returns uuid
language sql
stable
as $$
  select coalesce(
    auth.uid(),
    nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
  );
$$;

create or replace function public.app_has_any_role(required_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.user_roles ur
    where ur.user_id = public.app_current_user_id()
      and ur.role = any(required_roles)
  )
  or exists (
    select 1
    from public.profiles p
    where p.user_id = public.app_current_user_id()
      and p.primary_role = any(required_roles)
  );
$$;

create or replace function public.app_has_role(required_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select public.app_has_any_role(required_roles);
$$;

create or replace function public.app_is_platform_staff()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select public.app_has_any_role(array['admin', 'compliance', 'super_admin']);
$$;

alter table public.profiles
  alter column primary_role set default 'user',
  alter column verification_level set default 'unverified';

update public.profiles
set primary_role = 'user'
where primary_role is null or not (primary_role = any(public.app_valid_roles()));

update public.profiles
set verification_level = 'unverified'
where verification_level is null;

alter table public.profiles
  alter column primary_role set not null,
  alter column verification_level set not null;

alter table public.profiles drop constraint if exists profiles_primary_role_valid;
alter table public.profiles
  add constraint profiles_primary_role_valid check (primary_role = any(public.app_valid_roles()));

delete from public.user_roles
where role is null or not (role = any(public.app_valid_roles()));

insert into public.user_roles (user_id, role)
select user_id, 'user'
from public.profiles
where user_id is not null
on conflict (user_id, role) do nothing;

alter table public.user_roles drop constraint if exists user_roles_role_valid;
alter table public.user_roles
  add constraint user_roles_role_valid check (role = any(public.app_valid_roles()));

create index if not exists profiles_user_id_idx on public.profiles (user_id);
create index if not exists profiles_primary_role_idx on public.profiles (primary_role);
create index if not exists user_roles_user_role_idx on public.user_roles (user_id, role);

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (user_id, full_name, email, primary_role, verification_level)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.email,
    'user',
    'unverified'
  )
  on conflict (user_id) do update
    set email = excluded.email,
        updated_at = now();

  insert into public.user_roles (user_id, role)
  values (new.id, 'user')
  on conflict (user_id, role) do nothing;

  return new;
end;
$$;

do $$
begin
  if to_regclass('auth.users') is not null then
    drop trigger if exists on_auth_user_created on auth.users;
    create trigger on_auth_user_created
      after insert on auth.users
      for each row execute function public.handle_new_auth_user();
  end if;
end $$;

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
drop policy if exists profiles_self_or_staff_all on public.profiles;
create policy profiles_self_or_staff_all on public.profiles
  for all using (user_id = public.app_current_user_id() or public.app_is_platform_staff())
  with check (user_id = public.app_current_user_id() or public.app_is_platform_staff());

drop policy if exists roles_admin_select on public.user_roles;
drop policy if exists user_roles_self_or_staff_select on public.user_roles;
drop policy if exists user_roles_staff_write on public.user_roles;
create policy user_roles_self_or_staff_select on public.user_roles
  for select using (user_id = public.app_current_user_id() or public.app_is_platform_staff());
create policy user_roles_staff_write on public.user_roles
  for all using (public.app_has_any_role(array['admin', 'super_admin']))
  with check (public.app_has_any_role(array['admin', 'super_admin']));

drop policy if exists interest_public_select on public.interest_signals;
drop policy if exists interest_own_select on public.interest_signals;
drop policy if exists interest_select_public_owner_staff on public.interest_signals;
drop policy if exists interest_owner_insert on public.interest_signals;
drop policy if exists interest_owner_update_or_staff on public.interest_signals;
create policy interest_select_public_owner_staff on public.interest_signals
  for select using ((approval_status = 'approved' and public_status in ('open','matching','matched','archived')) or user_id = public.app_current_user_id() or public.app_is_platform_staff());
create policy interest_owner_insert on public.interest_signals
  for insert with check (user_id = public.app_current_user_id() or public.app_is_platform_staff());
create policy interest_owner_update_or_staff on public.interest_signals
  for update using (user_id = public.app_current_user_id() or public.app_is_platform_staff())
  with check (user_id = public.app_current_user_id() or public.app_is_platform_staff());

drop policy if exists availability_own_select on public.private_availability;
drop policy if exists availability_owner_staff_all on public.private_availability;
create policy availability_owner_staff_all on public.private_availability
  for all using (user_id = public.app_current_user_id() or public.app_is_platform_staff())
  with check (user_id = public.app_current_user_id() or public.app_is_platform_staff());

drop policy if exists verified_public_select on public.verified_listing_requests;
drop policy if exists verified_own_select on public.verified_listing_requests;
drop policy if exists verified_select_public_owner_staff on public.verified_listing_requests;
drop policy if exists verified_owner_insert on public.verified_listing_requests;
drop policy if exists verified_owner_update_or_staff on public.verified_listing_requests;
create policy verified_select_public_owner_staff on public.verified_listing_requests
  for select using ((approval_status = 'approved' and public_status in ('open','matching','matched','archived')) or user_id = public.app_current_user_id() or public.app_is_platform_staff());
create policy verified_owner_insert on public.verified_listing_requests
  for insert with check (user_id = public.app_current_user_id() or public.app_is_platform_staff());
create policy verified_owner_update_or_staff on public.verified_listing_requests
  for update using (user_id = public.app_current_user_id() or public.app_is_platform_staff())
  with check (user_id = public.app_current_user_id() or public.app_is_platform_staff());

drop policy if exists investor_public_select on public.investor_posts;
drop policy if exists investor_own_select on public.investor_posts;
drop policy if exists investor_select_public_owner_staff on public.investor_posts;
drop policy if exists investor_owner_insert on public.investor_posts;
drop policy if exists investor_owner_update_or_staff on public.investor_posts;
create policy investor_select_public_owner_staff on public.investor_posts
  for select using ((approval_status = 'approved' and public_status in ('open','matching','matched','archived')) or user_id = public.app_current_user_id() or public.app_is_platform_staff());
create policy investor_owner_insert on public.investor_posts
  for insert with check (user_id = public.app_current_user_id() or public.app_is_platform_staff());
create policy investor_owner_update_or_staff on public.investor_posts
  for update using (user_id = public.app_current_user_id() or public.app_is_platform_staff())
  with check (user_id = public.app_current_user_id() or public.app_is_platform_staff());

drop policy if exists agent_admin_select on public.agent_profiles;
drop policy if exists agent_owner_staff_all on public.agent_profiles;
create policy agent_owner_staff_all on public.agent_profiles
  for all using (user_id = public.app_current_user_id() or public.app_is_platform_staff())
  with check (user_id = public.app_current_user_id() or public.app_is_platform_staff());

drop policy if exists documents_private_select on public.document_uploads;
drop policy if exists documents_owner_staff_all on public.document_uploads;
create policy documents_owner_staff_all on public.document_uploads
  for all using (owner_user_id = public.app_current_user_id() or public.app_is_platform_staff())
  with check (owner_user_id = public.app_current_user_id() or public.app_is_platform_staff());

drop policy if exists admin_actions_admin_select on public.admin_actions;
drop policy if exists admin_actions_staff_all on public.admin_actions;
create policy admin_actions_staff_all on public.admin_actions
  for all using (public.app_is_platform_staff())
  with check (public.app_is_platform_staff());

drop policy if exists compliance_admin_select on public.compliance_checks;
drop policy if exists compliance_staff_all on public.compliance_checks;
create policy compliance_staff_all on public.compliance_checks
  for all using (public.app_is_platform_staff())
  with check (public.app_is_platform_staff());

drop policy if exists match_requests_staff_or_owner_all on public.match_requests;
create policy match_requests_staff_or_owner_all on public.match_requests
  for all using (requested_by = public.app_current_user_id() or public.app_is_platform_staff())
  with check (requested_by = public.app_current_user_id() or public.app_is_platform_staff());

drop policy if exists match_room_participant_select on public.match_room_participants;
drop policy if exists match_room_participant_staff_write on public.match_room_participants;
create policy match_room_participant_select on public.match_room_participants
  for select using (user_id = public.app_current_user_id() or public.app_is_platform_staff());
create policy match_room_participant_staff_write on public.match_room_participants
  for all using (public.app_is_platform_staff())
  with check (public.app_is_platform_staff());

drop policy if exists match_rooms_participant_or_staff_select on public.match_rooms;
drop policy if exists match_rooms_staff_write on public.match_rooms;
create policy match_rooms_participant_or_staff_select on public.match_rooms
  for select using (
    public.app_is_platform_staff()
    or exists (
      select 1 from public.match_room_participants mrp
      where mrp.match_room_id = match_rooms.id
        and mrp.user_id = public.app_current_user_id()
    )
  );
create policy match_rooms_staff_write on public.match_rooms
  for all using (public.app_is_platform_staff())
  with check (public.app_is_platform_staff());

drop policy if exists taxonomy_public_select on public.taxonomy_items;
drop policy if exists taxonomy_public_read_staff_write on public.taxonomy_items;
drop policy if exists taxonomy_super_admin_write on public.taxonomy_items;
create policy taxonomy_public_read_staff_write on public.taxonomy_items
  for select using (is_active = true or public.app_is_platform_staff());
create policy taxonomy_super_admin_write on public.taxonomy_items
  for all using (public.app_has_any_role(array['super_admin']))
  with check (public.app_has_any_role(array['super_admin']));

drop policy if exists notifications_own_select on public.notifications;
drop policy if exists notifications_owner_staff_all on public.notifications;
create policy notifications_owner_staff_all on public.notifications
  for all using (user_id = public.app_current_user_id() or public.app_is_platform_staff())
  with check (user_id = public.app_current_user_id() or public.app_is_platform_staff());
