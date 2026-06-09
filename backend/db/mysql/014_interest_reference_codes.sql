-- Stable public-safe reference codes for Interest Board communication.

set @interest_reference_code_exists := (
  select count(1) from information_schema.columns
  where table_schema = database() and table_name = 'interest_signals' and column_name = 'reference_code'
);
set @interest_reference_code_sql := if(@interest_reference_code_exists = 0, 'alter table interest_signals add column reference_code varchar(32) null after title', 'select 1');
prepare interest_reference_code_stmt from @interest_reference_code_sql;
execute interest_reference_code_stmt;
deallocate prepare interest_reference_code_stmt;

update interest_signals
set reference_code = concat('IB-', upper(substr(replace(id, '-', ''), 1, 12)))
where reference_code is null or reference_code = '';

alter table interest_signals
  modify column reference_code varchar(32) not null;

set @interest_reference_code_idx_exists := (
  select count(1) from information_schema.statistics
  where table_schema = database() and table_name = 'interest_signals' and index_name = 'interest_signals_reference_code_unique'
);
set @interest_reference_code_idx_sql := if(@interest_reference_code_idx_exists = 0, 'create unique index interest_signals_reference_code_unique on interest_signals (reference_code)', 'select 1');
prepare interest_reference_code_idx_stmt from @interest_reference_code_idx_sql;
execute interest_reference_code_idx_stmt;
deallocate prepare interest_reference_code_idx_stmt;
