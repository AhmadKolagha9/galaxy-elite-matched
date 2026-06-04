-- Older MySQL QA schemas required form_data on submission tables. The current
-- typed submission handlers persist first-class columns instead, so legacy
-- form_data must be nullable when the column exists.

set @interest_signals_form_data_exists := (
  select count(1)
  from information_schema.columns
  where table_schema = database()
    and table_name = 'interest_signals'
    and column_name = 'form_data'
);
set @interest_signals_form_data_sql := if(@interest_signals_form_data_exists = 0, 'select 1', 'alter table interest_signals modify column form_data json null');
prepare interest_signals_form_data_stmt from @interest_signals_form_data_sql;
execute interest_signals_form_data_stmt;
deallocate prepare interest_signals_form_data_stmt;

set @private_availability_form_data_exists := (
  select count(1)
  from information_schema.columns
  where table_schema = database()
    and table_name = 'private_availability'
    and column_name = 'form_data'
);
set @private_availability_form_data_sql := if(@private_availability_form_data_exists = 0, 'select 1', 'alter table private_availability modify column form_data json null');
prepare private_availability_form_data_stmt from @private_availability_form_data_sql;
execute private_availability_form_data_stmt;
deallocate prepare private_availability_form_data_stmt;
