-- Multi-channel notification broker tracking fields and constraints.

alter table public.notifications
  add column if not exists provider_message_id text,
  add column if not exists error_message text;

alter table public.notifications
  drop constraint if exists notifications_type_check;

alter table public.notifications
  add constraint notifications_type_check
  check (notification_type in (
    'submission_received',
    'admin_alert_new_post',
    'submission_approved',
    'documents_requested',
    'match_proposed',
    'match_room_opened'
  ));

alter table public.notifications
  drop constraint if exists notifications_channel_check;

alter table public.notifications
  add constraint notifications_channel_check
  check (channel in ('email', 'in_app'));

alter table public.notifications
  drop constraint if exists notifications_status_check;

alter table public.notifications
  add constraint notifications_status_check
  check (status in ('queued', 'sent', 'failed'));

create index if not exists notifications_user_created_idx
  on public.notifications (user_id, created_at desc);

create index if not exists notifications_type_status_idx
  on public.notifications (notification_type, status, created_at desc);

alter table public.notifications enable row level security;

drop policy if exists notifications_own_select on public.notifications;
drop policy if exists notifications_owner_staff_all on public.notifications;

create policy notifications_owner_staff_all on public.notifications
  for all using (user_id = public.app_current_user_id() or public.app_is_platform_staff())
  with check (user_id = public.app_current_user_id() or public.app_is_platform_staff());
