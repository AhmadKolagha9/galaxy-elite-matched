# DATA_MODEL.md

## Recommended backend split

Use:

- **Supabase/Postgres** for users, roles, submissions, verification, admin workflow, match rooms, sensitive process data
- **Private object storage** for documents
- **Sanity** for public CMS content such as Market Pulse articles and editable website copy

## Core tables

### profiles

```text
id uuid primary key
user_id uuid references auth.users
full_name text
email text
phone text
whatsapp text
country text
primary_role text
verification_level text
created_at timestamptz
updated_at timestamptz
```

### user_roles

```text
id uuid primary key
user_id uuid
role text
assigned_by uuid
created_at timestamptz
```

Roles:

- user
- buyer
- tenant
- investor
- owner
- landlord
- developer
- agent
- property_manager
- representative
- admin
- compliance
- super_admin

### interest_signals

```text
id uuid primary key
user_id uuid
purpose text
country text
area_city text
project_name text
property_category text
property_type text
market_segment text
size_min numeric
size_max numeric
budget_min numeric
budget_max numeric
currency text
budget_visibility text
timeline text
description text
accepts_direct_owner boolean
accepts_landlord boolean
accepts_developer boolean
accepts_agent boolean
approval_status text
public_status text
verification_status text
created_at timestamptz
updated_at timestamptz
```

### private_availability

```text
id uuid primary key
user_id uuid
submitter_role text
is_representative boolean
represented_party_type text
country text
area_city text
project_name text
building_name text
property_category text
property_type text
market_segment text
purpose text
size numeric
price_min numeric
price_max numeric
currency text
availability_date date
occupancy_status text
privacy_level text
approval_status text
public_status text
verification_status text
created_at timestamptz
updated_at timestamptz
```

### verified_listing_requests

```text
id uuid primary key
user_id uuid
submitter_role text
country text
area_city text
project_name text
building_name text
property_category text
property_type text
market_segment text
purpose text
size numeric
bedrooms int
bathrooms int
price_min numeric
price_max numeric
currency text
availability_date date
ownership_status text
permit_status text
privacy_level text
approval_status text
public_status text
verification_status text
verified_by uuid
verified_at timestamptz
created_at timestamptz
updated_at timestamptz
```

### investor_posts

```text
id uuid primary key
user_id uuid
investor_type text
investment_goal text
countries text[]
area_city text
property_categories text[]
property_types text[]
market_segments text[]
ticket_min numeric
ticket_max numeric
currency text
budget_visibility text
target_yield numeric
risk_preference text
timeline text
holding_period text
exit_strategy text
accepts_direct_owner boolean
accepts_developer boolean
accepts_agent boolean
approval_status text
public_status text
verification_status text
created_at timestamptz
updated_at timestamptz
```

### agent_profiles

```text
id uuid primary key
user_id uuid
full_name text
company_name text
country text
licence_number text
licence_expiry date
represents text
authority_status text
approval_status text
verification_status text
created_at timestamptz
updated_at timestamptz
```

### document_uploads

```text
id uuid primary key
owner_user_id uuid
related_object_type text
related_object_id uuid
document_type text
storage_bucket text
storage_path text
original_filename text
mime_type text
file_size bigint
expiry_date date
verification_status text
verified_by uuid
verified_at timestamptz
rejection_reason text
created_at timestamptz
```

### admin_actions

```text
id uuid primary key
admin_user_id uuid
action_type text
object_type text
object_id uuid
previous_status text
new_status text
note text
ip_address text
created_at timestamptz
```

### compliance_checks

```text
id uuid primary key
object_type text
object_id uuid
check_type text
status text
assigned_to uuid
notes text
completed_by uuid
completed_at timestamptz
created_at timestamptz
```

### match_requests

```text
id uuid primary key
source_object_type text
source_object_id uuid
target_object_type text
target_object_id uuid
match_score numeric
match_reason text
requested_by uuid
status text
admin_status text
created_at timestamptz
updated_at timestamptz
```

### match_rooms

```text
id uuid primary key
match_request_id uuid
status text
opened_by uuid
opened_at timestamptz
contact_unlocked boolean
documents_unlocked boolean
current_stage text
created_at timestamptz
updated_at timestamptz
```

### match_room_participants

```text
id uuid primary key
match_room_id uuid
user_id uuid
role_in_room text
approval_status text
approved_at timestamptz
created_at timestamptz
```

### taxonomy_items

```text
id uuid primary key
taxonomy_type text
label text
slug text
parent_id uuid null
country_scope text null
is_active boolean
sort_order int
created_at timestamptz
updated_at timestamptz
```

### notifications

```text
id uuid primary key
user_id uuid
notification_type text
channel text
subject text
body text
status text
sent_at timestamptz
created_at timestamptz
```

## RLS principles

- Users can create and read their own submissions.
- Users cannot approve their own submissions.
- Admin can read all submissions.
- Compliance can read documents and compliance checks.
- Public can read only approved and public-visible records.
- Documents are never public.
- Match rooms are visible only to participants and admin.

## Indexing recommendations

Add indexes on:

- approval_status
- public_status
- verification_status
- country
- area_city
- property_category
- property_type
- market_segment
- created_at
- user_id
- related_object_type + related_object_id
