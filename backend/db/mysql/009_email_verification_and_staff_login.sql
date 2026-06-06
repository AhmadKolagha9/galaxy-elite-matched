-- Email-code account activation and native staff login support.

set @users_email_verification_status_exists := (
  select count(1) from information_schema.columns
  where table_schema = database() and table_name = 'users' and column_name = 'email_verification_status'
);
set @users_email_verification_status_sql := if(@users_email_verification_status_exists = 0, "alter table users add column email_verification_status enum('pending', 'verified') not null default 'pending' after verification_status", 'select 1');
prepare users_email_verification_status_stmt from @users_email_verification_status_sql;
execute users_email_verification_status_stmt;
deallocate prepare users_email_verification_status_stmt;

set @users_email_verified_at_exists := (
  select count(1) from information_schema.columns
  where table_schema = database() and table_name = 'users' and column_name = 'email_verified_at'
);
set @users_email_verified_at_sql := if(@users_email_verified_at_exists = 0, 'alter table users add column email_verified_at timestamp null after email_verification_status', 'select 1');
prepare users_email_verified_at_stmt from @users_email_verified_at_sql;
execute users_email_verified_at_stmt;
deallocate prepare users_email_verified_at_stmt;

set @users_email_verification_code_hash_exists := (
  select count(1) from information_schema.columns
  where table_schema = database() and table_name = 'users' and column_name = 'email_verification_code_hash'
);
set @users_email_verification_code_hash_sql := if(@users_email_verification_code_hash_exists = 0, 'alter table users add column email_verification_code_hash char(64) null after email_verified_at', 'select 1');
prepare users_email_verification_code_hash_stmt from @users_email_verification_code_hash_sql;
execute users_email_verification_code_hash_stmt;
deallocate prepare users_email_verification_code_hash_stmt;

set @users_email_verification_expires_at_exists := (
  select count(1) from information_schema.columns
  where table_schema = database() and table_name = 'users' and column_name = 'email_verification_expires_at'
);
set @users_email_verification_expires_at_sql := if(@users_email_verification_expires_at_exists = 0, 'alter table users add column email_verification_expires_at timestamp null after email_verification_code_hash', 'select 1');
prepare users_email_verification_expires_at_stmt from @users_email_verification_expires_at_sql;
execute users_email_verification_expires_at_stmt;
deallocate prepare users_email_verification_expires_at_stmt;

set @users_email_verification_attempts_exists := (
  select count(1) from information_schema.columns
  where table_schema = database() and table_name = 'users' and column_name = 'email_verification_attempts'
);
set @users_email_verification_attempts_sql := if(@users_email_verification_attempts_exists = 0, 'alter table users add column email_verification_attempts int not null default 0 after email_verification_expires_at', 'select 1');
prepare users_email_verification_attempts_stmt from @users_email_verification_attempts_sql;
execute users_email_verification_attempts_stmt;
deallocate prepare users_email_verification_attempts_stmt;

alter table users
  modify column email_verification_status enum('pending', 'verified') not null default 'pending';

update users
set email_verification_status = 'verified',
    email_verified_at = coalesce(email_verified_at, created_at)
where primary_role in ('admin', 'compliance', 'super_admin')
   or last_login_at is not null;

set @users_email_verification_idx_exists := (
  select count(1)
  from information_schema.statistics
  where table_schema = database()
    and table_name = 'users'
    and index_name = 'users_email_verification_idx'
);
set @users_email_verification_idx_sql := if(@users_email_verification_idx_exists = 0, 'create index users_email_verification_idx on users (email_verification_status, email_verification_expires_at)', 'select 1');
prepare users_email_verification_idx_stmt from @users_email_verification_idx_sql;
execute users_email_verification_idx_stmt;
deallocate prepare users_email_verification_idx_stmt;
