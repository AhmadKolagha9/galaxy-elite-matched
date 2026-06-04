alter table public.interest_signals add column if not exists budget_min numeric;
alter table public.interest_signals add column if not exists budget_max numeric;
alter table public.private_availability add column if not exists price_min numeric;
alter table public.private_availability add column if not exists price_max numeric;
alter table public.verified_listing_requests add column if not exists price_min numeric;
alter table public.verified_listing_requests add column if not exists price_max numeric;
alter table public.investor_posts add column if not exists ticket_min numeric;
alter table public.investor_posts add column if not exists ticket_max numeric;

alter table public.match_rooms alter column current_stage set default 'interest_received';

update public.match_rooms
set current_stage = 'interest_received'
where current_stage is null or current_stage not in (
  'interest_received',
  'response_received',
  'identity_check',
  'authority_check',
  'match_proposed',
  'mutual_approval',
  'match_room_opened',
  'viewing_meeting',
  'offer_negotiation',
  'agreement_executed',
  'completed'
);

alter table public.match_rooms drop constraint if exists match_rooms_current_stage_valid;
alter table public.match_rooms
  add constraint match_rooms_current_stage_valid check (current_stage in (
    'interest_received',
    'response_received',
    'identity_check',
    'authority_check',
    'match_proposed',
    'mutual_approval',
    'match_room_opened',
    'viewing_meeting',
    'offer_negotiation',
    'agreement_executed',
    'completed'
  ));

alter table public.match_room_participants add column if not exists contact_unlock_approved boolean not null default false;
alter table public.match_room_participants add column if not exists contact_unlock_approved_at timestamptz;

create unique index if not exists match_requests_pair_unique_idx
  on public.match_requests (source_object_type, source_object_id, target_object_type, target_object_id);
create unique index if not exists match_rooms_match_request_unique_idx on public.match_rooms (match_request_id);
create index if not exists match_rooms_stage_idx on public.match_rooms (current_stage, status);
create index if not exists match_room_participants_user_idx on public.match_room_participants (user_id, match_room_id);

alter table public.match_requests enable row level security;
alter table public.match_rooms enable row level security;
alter table public.match_room_participants enable row level security;

drop policy if exists match_requests_staff_or_owner_all on public.match_requests;
create policy match_requests_staff_or_owner_all on public.match_requests
  for all using (requested_by = public.app_current_user_id() or public.app_is_platform_staff())
  with check (requested_by = public.app_current_user_id() or public.app_is_platform_staff());

drop policy if exists match_room_participant_select on public.match_room_participants;
drop policy if exists match_room_participant_staff_write on public.match_room_participants;
drop policy if exists match_room_participant_self_or_staff_select on public.match_room_participants;
drop policy if exists match_room_participant_self_unlock_or_staff_update on public.match_room_participants;
drop policy if exists match_room_participant_staff_insert on public.match_room_participants;
create policy match_room_participant_self_or_staff_select on public.match_room_participants
  for select using (user_id = public.app_current_user_id() or public.app_is_platform_staff());
create policy match_room_participant_self_unlock_or_staff_update on public.match_room_participants
  for update using (user_id = public.app_current_user_id() or public.app_is_platform_staff())
  with check (user_id = public.app_current_user_id() or public.app_is_platform_staff());
create policy match_room_participant_staff_insert on public.match_room_participants
  for insert with check (public.app_is_platform_staff());

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
