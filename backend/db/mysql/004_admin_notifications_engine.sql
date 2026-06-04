-- Status change notification trigger engine for MySQL-backed transactional alerts.
-- Firebase is used only for push delivery; authentication is handled by backend JWT middleware.

create table if not exists notifications (
  id char(36) primary key default (uuid()),
  user_id char(36) null,
  notification_type enum(
    'submission_received',
    'admin_alert_new_post',
    'submission_approved',
    'documents_requested',
    'compliance_hold',
    'match_proposed',
    'match_room_opened',
    'match_completed'
  ) not null,
  channel enum('email', 'in_app', 'push') not null default 'email',
  subject varchar(255) not null,
  body text not null,
  status enum('pending', 'sent', 'failed') not null default 'pending',
  sent_at timestamp null,
  provider_message_id varchar(255) null,
  error_message varchar(500) null,
  created_at timestamp not null default current_timestamp,
  updated_at timestamp not null default current_timestamp on update current_timestamp,
  index notifications_user_idx (user_id, status, created_at),
  index notifications_type_status_idx (notification_type, status, created_at),
  constraint notifications_user_fk foreign key (user_id) references profiles(user_id) on delete set null
);

update notifications set status = 'pending' where status = 'queued';

alter table notifications
  modify column notification_type enum(
    'submission_received',
    'admin_alert_new_post',
    'submission_approved',
    'documents_requested',
    'compliance_hold',
    'match_proposed',
    'match_room_opened',
    'match_completed'
  ) not null,
  modify column channel enum('email', 'in_app', 'push') not null default 'email',
  modify column status enum('pending', 'sent', 'failed') not null default 'pending';

set @notifications_updated_at_exists := (
  select count(1)
  from information_schema.columns
  where table_schema = database()
    and table_name = 'notifications'
    and column_name = 'updated_at'
);
set @notifications_updated_at_sql := if(@notifications_updated_at_exists = 0, 'alter table notifications add column updated_at timestamp not null default current_timestamp on update current_timestamp', 'select 1');
prepare notifications_updated_at_stmt from @notifications_updated_at_sql;
execute notifications_updated_at_stmt;
deallocate prepare notifications_updated_at_stmt;
