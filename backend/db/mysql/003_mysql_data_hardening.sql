-- Align the MySQL data model with backend moderation, matching, audit, and notification workflows.

set @private_availability_verified_at_exists := (
  select count(1)
  from information_schema.columns
  where table_schema = database()
    and table_name = 'private_availability'
    and column_name = 'verified_at'
);
set @private_availability_verified_at_sql := if(@private_availability_verified_at_exists = 0, 'alter table private_availability add column verified_at timestamp null', 'select 1');
prepare private_availability_verified_at_stmt from @private_availability_verified_at_sql;
execute private_availability_verified_at_stmt;
deallocate prepare private_availability_verified_at_stmt;

set @interest_signals_verified_at_exists := (
  select count(1)
  from information_schema.columns
  where table_schema = database()
    and table_name = 'interest_signals'
    and column_name = 'verified_at'
);
set @interest_signals_verified_at_sql := if(@interest_signals_verified_at_exists = 0, 'alter table interest_signals add column verified_at timestamp null', 'select 1');
prepare interest_signals_verified_at_stmt from @interest_signals_verified_at_sql;
execute interest_signals_verified_at_stmt;
deallocate prepare interest_signals_verified_at_stmt;

set @participants_contact_unlock_approved_exists := (
  select count(1)
  from information_schema.columns
  where table_schema = database()
    and table_name = 'match_room_participants'
    and column_name = 'contact_unlock_approved'
);
set @participants_contact_unlock_approved_sql := if(@participants_contact_unlock_approved_exists = 0, 'alter table match_room_participants add column contact_unlock_approved boolean not null default false', 'select 1');
prepare participants_contact_unlock_approved_stmt from @participants_contact_unlock_approved_sql;
execute participants_contact_unlock_approved_stmt;
deallocate prepare participants_contact_unlock_approved_stmt;

set @participants_contact_unlock_approved_at_exists := (
  select count(1)
  from information_schema.columns
  where table_schema = database()
    and table_name = 'match_room_participants'
    and column_name = 'contact_unlock_approved_at'
);
set @participants_contact_unlock_approved_at_sql := if(@participants_contact_unlock_approved_at_exists = 0, 'alter table match_room_participants add column contact_unlock_approved_at timestamp null', 'select 1');
prepare participants_contact_unlock_approved_at_stmt from @participants_contact_unlock_approved_at_sql;
execute participants_contact_unlock_approved_at_stmt;
deallocate prepare participants_contact_unlock_approved_at_stmt;

set @notifications_provider_message_id_exists := (
  select count(1)
  from information_schema.columns
  where table_schema = database()
    and table_name = 'notifications'
    and column_name = 'provider_message_id'
);
set @notifications_provider_message_id_sql := if(@notifications_provider_message_id_exists = 0, 'alter table notifications add column provider_message_id varchar(255)', 'select 1');
prepare notifications_provider_message_id_stmt from @notifications_provider_message_id_sql;
execute notifications_provider_message_id_stmt;
deallocate prepare notifications_provider_message_id_stmt;

set @notifications_error_message_exists := (
  select count(1)
  from information_schema.columns
  where table_schema = database()
    and table_name = 'notifications'
    and column_name = 'error_message'
);
set @notifications_error_message_sql := if(@notifications_error_message_exists = 0, 'alter table notifications add column error_message varchar(500)', 'select 1');
prepare notifications_error_message_stmt from @notifications_error_message_sql;
execute notifications_error_message_stmt;
deallocate prepare notifications_error_message_stmt;
