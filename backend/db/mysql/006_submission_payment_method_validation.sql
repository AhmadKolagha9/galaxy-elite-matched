-- Add payment-method matching fields and availability verification attachment flag.

set @private_availability_payment_method_exists := (
  select count(1)
  from information_schema.columns
  where table_schema = database()
    and table_name = 'private_availability'
    and column_name = 'preferred_payment_method'
);
set @private_availability_payment_method_sql := if(@private_availability_payment_method_exists = 0, "alter table private_availability add column preferred_payment_method enum('Cash', 'Crypto', 'Installments') null", 'select 1');
prepare private_availability_payment_method_stmt from @private_availability_payment_method_sql;
execute private_availability_payment_method_stmt;
deallocate prepare private_availability_payment_method_stmt;

set @private_availability_verification_files_exists := (
  select count(1)
  from information_schema.columns
  where table_schema = database()
    and table_name = 'private_availability'
    and column_name = 'has_verification_files_attached'
);
set @private_availability_verification_files_sql := if(@private_availability_verification_files_exists = 0, 'alter table private_availability add column has_verification_files_attached boolean not null default false', 'select 1');
prepare private_availability_verification_files_stmt from @private_availability_verification_files_sql;
execute private_availability_verification_files_stmt;
deallocate prepare private_availability_verification_files_stmt;

set @interest_signals_payment_method_exists := (
  select count(1)
  from information_schema.columns
  where table_schema = database()
    and table_name = 'interest_signals'
    and column_name = 'preferred_payment_method'
);
set @interest_signals_payment_method_sql := if(@interest_signals_payment_method_exists = 0, "alter table interest_signals add column preferred_payment_method enum('Cash', 'Crypto', 'Installments') null", 'select 1');
prepare interest_signals_payment_method_stmt from @interest_signals_payment_method_sql;
execute interest_signals_payment_method_stmt;
deallocate prepare interest_signals_payment_method_stmt;

update private_availability
set preferred_payment_method = 'Cash'
where preferred_payment_method is null;

update interest_signals
set preferred_payment_method = 'Cash'
where preferred_payment_method is null;

alter table private_availability
  modify column preferred_payment_method enum('Cash', 'Crypto', 'Installments') not null;

alter table interest_signals
  modify column preferred_payment_method enum('Cash', 'Crypto', 'Installments') not null;

set @private_availability_payment_idx_exists := (
  select count(1)
  from information_schema.statistics
  where table_schema = database()
    and table_name = 'private_availability'
    and index_name = 'private_availability_payment_idx'
);
set @private_availability_payment_idx_sql := if(@private_availability_payment_idx_exists = 0, 'create index private_availability_payment_idx on private_availability (preferred_payment_method, has_verification_files_attached)', 'select 1');
prepare private_availability_payment_idx_stmt from @private_availability_payment_idx_sql;
execute private_availability_payment_idx_stmt;
deallocate prepare private_availability_payment_idx_stmt;

set @interest_signals_payment_idx_exists := (
  select count(1)
  from information_schema.statistics
  where table_schema = database()
    and table_name = 'interest_signals'
    and index_name = 'interest_signals_payment_idx'
);
set @interest_signals_payment_idx_sql := if(@interest_signals_payment_idx_exists = 0, 'create index interest_signals_payment_idx on interest_signals (preferred_payment_method)', 'select 1');
prepare interest_signals_payment_idx_stmt from @interest_signals_payment_idx_sql;
execute interest_signals_payment_idx_stmt;
deallocate prepare interest_signals_payment_idx_stmt;

insert into taxonomy_items (id, taxonomy_type, label, slug, parent_id, country_scope, is_active, sort_order)
values
  ('10000000-0000-0000-0000-000000000001', 'country', 'UAE', 'uae', null, null, true, 10),
  ('10000000-0000-0000-0000-000000000002', 'country', 'UK', 'uk', null, null, true, 20),
  ('10000000-0000-0000-0000-000000000003', 'country', 'India', 'india', null, null, true, 30),
  ('10000000-0000-0000-0000-000000000004', 'country', 'Global', 'global', null, null, true, 40),
  ('10000000-0000-0000-0000-000000000101', 'area_city', 'Abu Dhabi', 'abu-dhabi', null, 'uae', true, 10),
  ('10000000-0000-0000-0000-000000000102', 'area_city', 'Al Ain', 'al-ain', null, 'uae', true, 20),
  ('10000000-0000-0000-0000-000000000103', 'area_city', 'Dubai', 'dubai', null, 'uae', true, 30),
  ('10000000-0000-0000-0000-000000000104', 'area_city', 'Sharjah', 'sharjah', null, 'uae', true, 40),
  ('10000000-0000-0000-0000-000000000105', 'area_city', 'Ajman', 'ajman', null, 'uae', true, 50),
  ('10000000-0000-0000-0000-000000000106', 'area_city', 'Fujairah', 'fujairah', null, 'uae', true, 60),
  ('10000000-0000-0000-0000-000000000107', 'area_city', 'Ras Al Khaimah', 'ras-al-khaimah', null, 'uae', true, 70),
  ('10000000-0000-0000-0000-000000000108', 'area_city', 'Umm Al Quwain', 'umm-al-quwain', null, 'uae', true, 80),
  ('10000000-0000-0000-0000-000000000201', 'area_city', 'England', 'england', null, 'uk', true, 10),
  ('10000000-0000-0000-0000-000000000202', 'area_city', 'Scotland', 'scotland', null, 'uk', true, 20),
  ('10000000-0000-0000-0000-000000000203', 'area_city', 'Wales', 'wales', null, 'uk', true, 30),
  ('10000000-0000-0000-0000-000000000204', 'area_city', 'Northern Ireland', 'northern-ireland', null, 'uk', true, 40),
  ('10000000-0000-0000-0000-000000000301', 'area_city', 'India', 'india', null, 'india', true, 10)
on duplicate key update
  label = values(label),
  country_scope = values(country_scope),
  is_active = values(is_active),
  sort_order = values(sort_order);
