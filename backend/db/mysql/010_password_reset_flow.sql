-- Native password reset code support for users and staff accounts.

set @users_password_reset_code_hash_exists := (
  select count(1) from information_schema.columns
  where table_schema = database() and table_name = 'users' and column_name = 'password_reset_code_hash'
);
set @users_password_reset_code_hash_sql := if(@users_password_reset_code_hash_exists = 0, 'alter table users add column password_reset_code_hash char(64) null after email_verification_attempts', 'select 1');
prepare users_password_reset_code_hash_stmt from @users_password_reset_code_hash_sql;
execute users_password_reset_code_hash_stmt;
deallocate prepare users_password_reset_code_hash_stmt;

set @users_password_reset_expires_at_exists := (
  select count(1) from information_schema.columns
  where table_schema = database() and table_name = 'users' and column_name = 'password_reset_expires_at'
);
set @users_password_reset_expires_at_sql := if(@users_password_reset_expires_at_exists = 0, 'alter table users add column password_reset_expires_at timestamp null after password_reset_code_hash', 'select 1');
prepare users_password_reset_expires_at_stmt from @users_password_reset_expires_at_sql;
execute users_password_reset_expires_at_stmt;
deallocate prepare users_password_reset_expires_at_stmt;

set @users_password_reset_attempts_exists := (
  select count(1) from information_schema.columns
  where table_schema = database() and table_name = 'users' and column_name = 'password_reset_attempts'
);
set @users_password_reset_attempts_sql := if(@users_password_reset_attempts_exists = 0, 'alter table users add column password_reset_attempts int not null default 0 after password_reset_expires_at', 'select 1');
prepare users_password_reset_attempts_stmt from @users_password_reset_attempts_sql;
execute users_password_reset_attempts_stmt;
deallocate prepare users_password_reset_attempts_stmt;

set @users_password_reset_requested_at_exists := (
  select count(1) from information_schema.columns
  where table_schema = database() and table_name = 'users' and column_name = 'password_reset_requested_at'
);
set @users_password_reset_requested_at_sql := if(@users_password_reset_requested_at_exists = 0, 'alter table users add column password_reset_requested_at timestamp null after password_reset_attempts', 'select 1');
prepare users_password_reset_requested_at_stmt from @users_password_reset_requested_at_sql;
execute users_password_reset_requested_at_stmt;
deallocate prepare users_password_reset_requested_at_stmt;

set @users_password_reset_idx_exists := (
  select count(1)
  from information_schema.statistics
  where table_schema = database()
    and table_name = 'users'
    and index_name = 'users_password_reset_idx'
);
set @users_password_reset_idx_sql := if(@users_password_reset_idx_exists = 0, 'create index users_password_reset_idx on users (password_reset_expires_at, password_reset_requested_at)', 'select 1');
prepare users_password_reset_idx_stmt from @users_password_reset_idx_sql;
execute users_password_reset_idx_stmt;
deallocate prepare users_password_reset_idx_stmt;
