-- Backfill structured submission columns for QA databases that applied an older
-- 001/002 schema before the strict submission-field contract was introduced.

set @interest_signals_structured_columns := (
  select group_concat(add_clause order by sort_order separator ', ')
  from (
    select 10 as sort_order, 'add column title varchar(255) null' as add_clause
    where not exists (select 1 from information_schema.columns where table_schema = database() and table_name = 'interest_signals' and column_name = 'title')
    union all
    select 20, 'add column user_role varchar(80) null'
    where not exists (select 1 from information_schema.columns where table_schema = database() and table_name = 'interest_signals' and column_name = 'user_role')
    union all
    select 30, 'add column availability_type varchar(120) null'
    where not exists (select 1 from information_schema.columns where table_schema = database() and table_name = 'interest_signals' and column_name = 'availability_type')
    union all
    select 40, 'add column listing_intent varchar(160) null'
    where not exists (select 1 from information_schema.columns where table_schema = database() and table_name = 'interest_signals' and column_name = 'listing_intent')
    union all
    select 50, 'add column building_name varchar(255) null'
    where not exists (select 1 from information_schema.columns where table_schema = database() and table_name = 'interest_signals' and column_name = 'building_name')
    union all
    select 60, 'add column size_sqft decimal(12,2) null'
    where not exists (select 1 from information_schema.columns where table_schema = database() and table_name = 'interest_signals' and column_name = 'size_sqft')
    union all
    select 70, 'add column price_min decimal(15,2) null'
    where not exists (select 1 from information_schema.columns where table_schema = database() and table_name = 'interest_signals' and column_name = 'price_min')
    union all
    select 80, 'add column price_max decimal(15,2) null'
    where not exists (select 1 from information_schema.columns where table_schema = database() and table_name = 'interest_signals' and column_name = 'price_max')
    union all
    select 90, 'add column availability_date date null'
    where not exists (select 1 from information_schema.columns where table_schema = database() and table_name = 'interest_signals' and column_name = 'availability_date')
    union all
    select 100, 'add column privacy_level varchar(120) null'
    where not exists (select 1 from information_schema.columns where table_schema = database() and table_name = 'interest_signals' and column_name = 'privacy_level')
    union all
    select 110, 'add column private_description text null'
    where not exists (select 1 from information_schema.columns where table_schema = database() and table_name = 'interest_signals' and column_name = 'private_description')
    union all
    select 120, 'add column category varchar(40) null'
    where not exists (select 1 from information_schema.columns where table_schema = database() and table_name = 'interest_signals' and column_name = 'category')
    union all
    select 130, 'add column offering_type varchar(20) null'
    where not exists (select 1 from information_schema.columns where table_schema = database() and table_name = 'interest_signals' and column_name = 'offering_type')
    union all
    select 140, 'add column rooms int null'
    where not exists (select 1 from information_schema.columns where table_schema = database() and table_name = 'interest_signals' and column_name = 'rooms')
    union all
    select 150, 'add column bedrooms int null'
    where not exists (select 1 from information_schema.columns where table_schema = database() and table_name = 'interest_signals' and column_name = 'bedrooms')
    union all
    select 160, 'add column total_floors int null'
    where not exists (select 1 from information_schema.columns where table_schema = database() and table_name = 'interest_signals' and column_name = 'total_floors')
    union all
    select 170, 'add column parking_spaces int null'
    where not exists (select 1 from information_schema.columns where table_schema = database() and table_name = 'interest_signals' and column_name = 'parking_spaces')
    union all
    select 180, 'add column furnishing_type varchar(40) null'
    where not exists (select 1 from information_schema.columns where table_schema = database() and table_name = 'interest_signals' and column_name = 'furnishing_type')
    union all
    select 190, 'add column project_status varchar(40) null'
    where not exists (select 1 from information_schema.columns where table_schema = database() and table_name = 'interest_signals' and column_name = 'project_status')
    union all
    select 200, 'add column amenities json null'
    where not exists (select 1 from information_schema.columns where table_schema = database() and table_name = 'interest_signals' and column_name = 'amenities')
  ) as missing_columns
);
set @interest_signals_structured_sql := if(@interest_signals_structured_columns is null, 'select 1', concat('alter table interest_signals ', @interest_signals_structured_columns));
prepare interest_signals_structured_stmt from @interest_signals_structured_sql;
execute interest_signals_structured_stmt;
deallocate prepare interest_signals_structured_stmt;

set @private_availability_structured_columns := (
  select group_concat(add_clause order by sort_order separator ', ')
  from (
    select 10 as sort_order, 'add column title varchar(255) null' as add_clause
    where not exists (select 1 from information_schema.columns where table_schema = database() and table_name = 'private_availability' and column_name = 'title')
    union all
    select 20, 'add column user_role varchar(120) null'
    where not exists (select 1 from information_schema.columns where table_schema = database() and table_name = 'private_availability' and column_name = 'user_role')
    union all
    select 30, 'add column availability_type varchar(120) null'
    where not exists (select 1 from information_schema.columns where table_schema = database() and table_name = 'private_availability' and column_name = 'availability_type')
    union all
    select 40, 'add column listing_intent varchar(160) null'
    where not exists (select 1 from information_schema.columns where table_schema = database() and table_name = 'private_availability' and column_name = 'listing_intent')
    union all
    select 50, 'add column size_sqft decimal(12,2) null'
    where not exists (select 1 from information_schema.columns where table_schema = database() and table_name = 'private_availability' and column_name = 'size_sqft')
    union all
    select 60, 'add column price_min decimal(15,2) null'
    where not exists (select 1 from information_schema.columns where table_schema = database() and table_name = 'private_availability' and column_name = 'price_min')
    union all
    select 70, 'add column price_max decimal(15,2) null'
    where not exists (select 1 from information_schema.columns where table_schema = database() and table_name = 'private_availability' and column_name = 'price_max')
    union all
    select 80, 'add column authority_declaration varchar(160) null'
    where not exists (select 1 from information_schema.columns where table_schema = database() and table_name = 'private_availability' and column_name = 'authority_declaration')
    union all
    select 90, 'add column private_description text null'
    where not exists (select 1 from information_schema.columns where table_schema = database() and table_name = 'private_availability' and column_name = 'private_description')
    union all
    select 100, 'add column category varchar(40) null'
    where not exists (select 1 from information_schema.columns where table_schema = database() and table_name = 'private_availability' and column_name = 'category')
    union all
    select 110, 'add column offering_type varchar(20) null'
    where not exists (select 1 from information_schema.columns where table_schema = database() and table_name = 'private_availability' and column_name = 'offering_type')
    union all
    select 120, 'add column rooms int null'
    where not exists (select 1 from information_schema.columns where table_schema = database() and table_name = 'private_availability' and column_name = 'rooms')
    union all
    select 130, 'add column bedrooms int null'
    where not exists (select 1 from information_schema.columns where table_schema = database() and table_name = 'private_availability' and column_name = 'bedrooms')
    union all
    select 140, 'add column total_floors int null'
    where not exists (select 1 from information_schema.columns where table_schema = database() and table_name = 'private_availability' and column_name = 'total_floors')
    union all
    select 150, 'add column parking_spaces int null'
    where not exists (select 1 from information_schema.columns where table_schema = database() and table_name = 'private_availability' and column_name = 'parking_spaces')
    union all
    select 160, 'add column furnishing_type varchar(40) null'
    where not exists (select 1 from information_schema.columns where table_schema = database() and table_name = 'private_availability' and column_name = 'furnishing_type')
    union all
    select 170, 'add column project_status varchar(40) null'
    where not exists (select 1 from information_schema.columns where table_schema = database() and table_name = 'private_availability' and column_name = 'project_status')
    union all
    select 180, 'add column amenities json null'
    where not exists (select 1 from information_schema.columns where table_schema = database() and table_name = 'private_availability' and column_name = 'amenities')
  ) as missing_columns
);
set @private_availability_structured_sql := if(@private_availability_structured_columns is null, 'select 1', concat('alter table private_availability ', @private_availability_structured_columns));
prepare private_availability_structured_stmt from @private_availability_structured_sql;
execute private_availability_structured_stmt;
deallocate prepare private_availability_structured_stmt;

set @interest_signals_has_legacy_columns := (
  select count(1)
  from information_schema.columns
  where table_schema = database()
    and table_name = 'interest_signals'
    and column_name in ('submitter_role', 'description', 'property_category')
);
set @interest_signals_backfill_sql := if(@interest_signals_has_legacy_columns = 3,
  "update interest_signals
   set
     title = coalesce(title, nullif(project_name, ''), 'Private interest signal'),
     user_role = coalesce(user_role, nullif(submitter_role, ''), 'Buyer'),
     availability_type = coalesce(availability_type, nullif(purpose, ''), 'May sell privately'),
     listing_intent = coalesce(listing_intent, 'Keep private - match only'),
     private_description = coalesce(private_description, description, 'Imported legacy interest signal'),
     category = coalesce(category, property_category, 'residential'),
     offering_type = coalesce(offering_type, 'sell'),
     rooms = coalesce(rooms, 0),
     bedrooms = coalesce(bedrooms, 0),
     total_floors = coalesce(total_floors, 0),
     parking_spaces = coalesce(parking_spaces, 0),
     furnishing_type = coalesce(furnishing_type, 'unfurnished'),
     project_status = coalesce(project_status, 'resale'),
     amenities = coalesce(amenities, json_array())
   where title is null
      or user_role is null
      or availability_type is null
      or listing_intent is null
      or private_description is null
      or category is null
      or offering_type is null
      or rooms is null
      or bedrooms is null
      or total_floors is null
      or parking_spaces is null
      or furnishing_type is null
      or project_status is null
      or amenities is null",
  'select 1'
);
prepare interest_signals_backfill_stmt from @interest_signals_backfill_sql;
execute interest_signals_backfill_stmt;
deallocate prepare interest_signals_backfill_stmt;

set @private_availability_has_legacy_columns := (
  select count(1)
  from information_schema.columns
  where table_schema = database()
    and table_name = 'private_availability'
    and column_name in ('submitter_role', 'authority_status', 'description', 'property_category')
);
set @private_availability_backfill_sql := if(@private_availability_has_legacy_columns = 4,
  "update private_availability
   set
     title = coalesce(title, nullif(project_name, ''), nullif(building_name, ''), 'Private availability'),
     user_role = coalesce(user_role, nullif(submitter_role, ''), 'Direct owner'),
     availability_type = coalesce(availability_type, nullif(purpose, ''), 'May sell privately'),
     listing_intent = coalesce(listing_intent, 'Keep private - match only'),
     authority_declaration = coalesce(authority_declaration, nullif(authority_status, ''), 'I am the direct owner/landlord'),
     private_description = coalesce(private_description, description, 'Imported legacy private availability'),
     category = coalesce(category, property_category, 'residential'),
     offering_type = coalesce(offering_type, 'sell'),
     rooms = coalesce(rooms, 0),
     bedrooms = coalesce(bedrooms, 0),
     total_floors = coalesce(total_floors, 0),
     parking_spaces = coalesce(parking_spaces, 0),
     furnishing_type = coalesce(furnishing_type, 'unfurnished'),
     project_status = coalesce(project_status, 'resale'),
     amenities = coalesce(amenities, json_array())
   where title is null
      or user_role is null
      or availability_type is null
      or listing_intent is null
      or authority_declaration is null
      or private_description is null
      or category is null
      or offering_type is null
      or rooms is null
      or bedrooms is null
      or total_floors is null
      or parking_spaces is null
      or furnishing_type is null
      or project_status is null
      or amenities is null",
  'select 1'
);
prepare private_availability_backfill_stmt from @private_availability_backfill_sql;
execute private_availability_backfill_stmt;
deallocate prepare private_availability_backfill_stmt;
