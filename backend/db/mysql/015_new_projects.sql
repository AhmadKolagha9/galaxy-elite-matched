-- Public New Projects board managed by Galaxy Elite admins.

create table if not exists new_projects (
  id char(36) primary key default (uuid()),
  project_name varchar(180) not null,
  start_price decimal(14,2) null,
  end_price decimal(14,2) null,
  images json not null,
  video varchar(500) null,
  description text not null,
  user_id varchar(128) null,
  map_location varchar(500) null,
  phone varchar(40) null,
  address varchar(500) null,
  status enum('draft', 'published', 'archived') not null default 'draft',
  city_id varchar(64) null,
  country_id varchar(64) null,
  developer_name varchar(180) null,
  reference varchar(32) not null,
  created_at timestamp not null default current_timestamp,
  updated_at timestamp not null default current_timestamp on update current_timestamp,
  unique index new_projects_reference_unique (reference),
  index new_projects_status_created_idx (status, created_at),
  index new_projects_location_idx (country_id, city_id),
  index new_projects_developer_idx (developer_name)
);
