-- Native authentication and deferred identity verification for MySQL-backed accounts.

create table if not exists users (
  id char(36) primary key default (uuid()),
  email varchar(255) not null,
  password_hash varchar(255) not null,
  full_name varchar(255) null,
  phone varchar(64) null,
  primary_role enum(
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
  ) not null default 'user',
  verification_status enum('unverified', 'under_review', 'action_required', 'verified') not null default 'unverified',
  is_profile_locked boolean not null default false,
  verification_reviewed_by char(36) null,
  verification_review_note text null,
  verified_at timestamp null,
  last_login_at timestamp null,
  created_at timestamp not null default current_timestamp,
  updated_at timestamp not null default current_timestamp on update current_timestamp,
  unique key users_email_unique (email),
  index users_role_status_idx (primary_role, verification_status),
  index users_verification_idx (verification_status, created_at)
);

set @users_password_hash_exists := (
  select count(1) from information_schema.columns
  where table_schema = database() and table_name = 'users' and column_name = 'password_hash'
);
set @users_password_hash_sql := if(@users_password_hash_exists = 0, 'alter table users add column password_hash varchar(255) null', 'select 1');
prepare users_password_hash_stmt from @users_password_hash_sql;
execute users_password_hash_stmt;
deallocate prepare users_password_hash_stmt;

set @users_full_name_exists := (
  select count(1) from information_schema.columns
  where table_schema = database() and table_name = 'users' and column_name = 'full_name'
);
set @users_full_name_sql := if(@users_full_name_exists = 0, 'alter table users add column full_name varchar(255) null', 'select 1');
prepare users_full_name_stmt from @users_full_name_sql;
execute users_full_name_stmt;
deallocate prepare users_full_name_stmt;

set @users_phone_exists := (
  select count(1) from information_schema.columns
  where table_schema = database() and table_name = 'users' and column_name = 'phone'
);
set @users_phone_sql := if(@users_phone_exists = 0, 'alter table users add column phone varchar(64) null', 'select 1');
prepare users_phone_stmt from @users_phone_sql;
execute users_phone_stmt;
deallocate prepare users_phone_stmt;

set @users_primary_role_exists := (
  select count(1) from information_schema.columns
  where table_schema = database() and table_name = 'users' and column_name = 'primary_role'
);
set @users_primary_role_sql := if(@users_primary_role_exists = 0, "alter table users add column primary_role enum('user', 'buyer', 'tenant', 'investor', 'owner', 'landlord', 'developer', 'agent', 'property_manager', 'representative', 'corporate_client', 'family_office', 'admin', 'compliance', 'super_admin') not null default 'user'", 'select 1');
prepare users_primary_role_stmt from @users_primary_role_sql;
execute users_primary_role_stmt;
deallocate prepare users_primary_role_stmt;

set @users_verification_status_exists := (
  select count(1) from information_schema.columns
  where table_schema = database() and table_name = 'users' and column_name = 'verification_status'
);
set @users_verification_status_sql := if(@users_verification_status_exists = 0, "alter table users add column verification_status enum('unverified', 'under_review', 'action_required', 'verified') not null default 'unverified'", 'select 1');
prepare users_verification_status_stmt from @users_verification_status_sql;
execute users_verification_status_stmt;
deallocate prepare users_verification_status_stmt;

set @users_is_profile_locked_exists := (
  select count(1) from information_schema.columns
  where table_schema = database() and table_name = 'users' and column_name = 'is_profile_locked'
);
set @users_is_profile_locked_sql := if(@users_is_profile_locked_exists = 0, 'alter table users add column is_profile_locked boolean not null default false', 'select 1');
prepare users_is_profile_locked_stmt from @users_is_profile_locked_sql;
execute users_is_profile_locked_stmt;
deallocate prepare users_is_profile_locked_stmt;

set @users_verification_reviewed_by_exists := (
  select count(1) from information_schema.columns
  where table_schema = database() and table_name = 'users' and column_name = 'verification_reviewed_by'
);
set @users_verification_reviewed_by_sql := if(@users_verification_reviewed_by_exists = 0, 'alter table users add column verification_reviewed_by char(36) null', 'select 1');
prepare users_verification_reviewed_by_stmt from @users_verification_reviewed_by_sql;
execute users_verification_reviewed_by_stmt;
deallocate prepare users_verification_reviewed_by_stmt;

set @users_verification_review_note_exists := (
  select count(1) from information_schema.columns
  where table_schema = database() and table_name = 'users' and column_name = 'verification_review_note'
);
set @users_verification_review_note_sql := if(@users_verification_review_note_exists = 0, 'alter table users add column verification_review_note text null', 'select 1');
prepare users_verification_review_note_stmt from @users_verification_review_note_sql;
execute users_verification_review_note_stmt;
deallocate prepare users_verification_review_note_stmt;

set @users_verified_at_exists := (
  select count(1) from information_schema.columns
  where table_schema = database() and table_name = 'users' and column_name = 'verified_at'
);
set @users_verified_at_sql := if(@users_verified_at_exists = 0, 'alter table users add column verified_at timestamp null', 'select 1');
prepare users_verified_at_stmt from @users_verified_at_sql;
execute users_verified_at_stmt;
deallocate prepare users_verified_at_stmt;

set @users_last_login_at_exists := (
  select count(1) from information_schema.columns
  where table_schema = database() and table_name = 'users' and column_name = 'last_login_at'
);
set @users_last_login_at_sql := if(@users_last_login_at_exists = 0, 'alter table users add column last_login_at timestamp null', 'select 1');
prepare users_last_login_at_stmt from @users_last_login_at_sql;
execute users_last_login_at_stmt;
deallocate prepare users_last_login_at_stmt;

alter table users
  modify column primary_role enum(
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
  ) not null default 'user',
  modify column verification_status enum('unverified', 'under_review', 'action_required', 'verified') not null default 'unverified';

update users
set password_hash = concat('$disabled$', uuid())
where password_hash is null or password_hash = '';

alter table users
  modify column password_hash varchar(255) not null;

set @users_email_unique_exists := (
  select count(1)
  from information_schema.statistics
  where table_schema = database()
    and table_name = 'users'
    and index_name = 'users_email_unique'
);
set @users_email_unique_sql := if(@users_email_unique_exists = 0, 'create unique index users_email_unique on users (email)', 'select 1');
prepare users_email_unique_stmt from @users_email_unique_sql;
execute users_email_unique_stmt;
deallocate prepare users_email_unique_stmt;

set @users_role_status_idx_exists := (
  select count(1)
  from information_schema.statistics
  where table_schema = database()
    and table_name = 'users'
    and index_name = 'users_role_status_idx'
);
set @users_role_status_idx_sql := if(@users_role_status_idx_exists = 0, 'create index users_role_status_idx on users (primary_role, verification_status)', 'select 1');
prepare users_role_status_idx_stmt from @users_role_status_idx_sql;
execute users_role_status_idx_stmt;
deallocate prepare users_role_status_idx_stmt;

set @users_verification_idx_exists := (
  select count(1)
  from information_schema.statistics
  where table_schema = database()
    and table_name = 'users'
    and index_name = 'users_verification_idx'
);
set @users_verification_idx_sql := if(@users_verification_idx_exists = 0, 'create index users_verification_idx on users (verification_status, created_at)', 'select 1');
prepare users_verification_idx_stmt from @users_verification_idx_sql;
execute users_verification_idx_stmt;
deallocate prepare users_verification_idx_stmt;

update profiles
set verification_level = 'verified'
where verification_level in ('basic_checked', 'documents_submitted');

update profiles
set verification_level = 'action_required'
where verification_level in ('failed', 'expired');

update profiles
set verification_level = 'unverified'
where verification_level not in ('unverified', 'under_review', 'action_required', 'verified');

set @profiles_phone_exists := (
  select count(1) from information_schema.columns
  where table_schema = database() and table_name = 'profiles' and column_name = 'phone'
);
set @profiles_phone_sql := if(@profiles_phone_exists = 0, 'alter table profiles add column phone varchar(64) null', 'select 1');
prepare profiles_phone_stmt from @profiles_phone_sql;
execute profiles_phone_stmt;
deallocate prepare profiles_phone_stmt;

alter table profiles
  modify column verification_level enum('unverified', 'under_review', 'action_required', 'verified') not null default 'unverified';

alter table document_uploads
  modify column verification_status enum('under_review', 'verified', 'failed', 'expired') not null default 'under_review';

set @document_uploads_updated_at_exists := (
  select count(1) from information_schema.columns
  where table_schema = database() and table_name = 'document_uploads' and column_name = 'updated_at'
);
set @document_uploads_updated_at_sql := if(@document_uploads_updated_at_exists = 0, 'alter table document_uploads add column updated_at timestamp not null default current_timestamp on update current_timestamp', 'select 1');
prepare document_uploads_updated_at_stmt from @document_uploads_updated_at_sql;
execute document_uploads_updated_at_stmt;
deallocate prepare document_uploads_updated_at_stmt;

set @document_owner_status_idx_exists := (
  select count(1)
  from information_schema.statistics
  where table_schema = database()
    and table_name = 'document_uploads'
    and index_name = 'document_owner_status_idx'
);
set @document_owner_status_idx_sql := if(@document_owner_status_idx_exists = 0, 'create index document_owner_status_idx on document_uploads (owner_user_id, related_object_type, verification_status)', 'select 1');
prepare document_owner_status_idx_stmt from @document_owner_status_idx_sql;
execute document_owner_status_idx_stmt;
deallocate prepare document_owner_status_idx_stmt;

alter table notifications
  modify column notification_type enum(
    'submission_received',
    'admin_alert_new_post',
    'identity_verification_submitted',
    'identity_verified',
    'identity_action_required',
    'submission_approved',
    'documents_requested',
    'compliance_hold',
    'match_proposed',
    'match_room_opened',
    'match_completed'
  ) not null;

drop trigger if exists admin_actions_prevent_delete;

create trigger admin_actions_prevent_delete
before delete on admin_actions
for each row
  signal sqlstate '45000' set message_text = 'admin_actions audit records cannot be deleted';
