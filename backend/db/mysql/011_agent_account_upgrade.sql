-- Agent account upgrade applications with private document review.

create table if not exists agent_applications (
  id char(36) primary key default (uuid()),
  user_id char(36) not null,
  company_name varchar(255) not null,
  broker_licence_number varchar(120) not null,
  country varchar(120) not null,
  notes text null,
  status enum('draft', 'pending_review', 'approved', 'rejected') not null default 'draft',
  review_note text null,
  reviewed_by char(36) null,
  reviewed_at timestamp null,
  submitted_at timestamp null,
  created_at timestamp not null default current_timestamp,
  updated_at timestamp not null default current_timestamp on update current_timestamp,
  unique key agent_applications_user_unique (user_id),
  index agent_applications_status_idx (status, submitted_at, updated_at),
  constraint agent_applications_user_fk foreign key (user_id) references profiles(user_id) on delete cascade
);

set @agent_applications_user_unique_exists := (
  select count(1)
  from information_schema.statistics
  where table_schema = database()
    and table_name = 'agent_applications'
    and index_name = 'agent_applications_user_unique'
);
set @agent_applications_user_unique_sql := if(@agent_applications_user_unique_exists = 0, 'create unique index agent_applications_user_unique on agent_applications (user_id)', 'select 1');
prepare agent_applications_user_unique_stmt from @agent_applications_user_unique_sql;
execute agent_applications_user_unique_stmt;
deallocate prepare agent_applications_user_unique_stmt;

set @agent_applications_status_idx_exists := (
  select count(1)
  from information_schema.statistics
  where table_schema = database()
    and table_name = 'agent_applications'
    and index_name = 'agent_applications_status_idx'
);
set @agent_applications_status_idx_sql := if(@agent_applications_status_idx_exists = 0, 'create index agent_applications_status_idx on agent_applications (status, submitted_at, updated_at)', 'select 1');
prepare agent_applications_status_idx_stmt from @agent_applications_status_idx_sql;
execute agent_applications_status_idx_stmt;
deallocate prepare agent_applications_status_idx_stmt;
