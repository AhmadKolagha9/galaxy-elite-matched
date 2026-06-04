-- Dynamic database-backed taxonomy/dropdown engine.

create extension if not exists pgcrypto;

create table if not exists public.taxonomy_items (
  id uuid primary key default gen_random_uuid(),
  taxonomy_type text not null,
  label text not null,
  slug text not null,
  parent_id uuid references public.taxonomy_items(id) on delete set null,
  country_scope text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.taxonomy_items
  drop constraint if exists taxonomy_items_type_check;

alter table public.taxonomy_items
  add constraint taxonomy_items_type_check
  check (taxonomy_type in ('country','area_city','property_category','property_type','market_segment','purpose'));

alter table public.taxonomy_items
  drop constraint if exists taxonomy_items_country_scope_check;

alter table public.taxonomy_items
  add constraint taxonomy_items_country_scope_check
  check (country_scope is null or country_scope in ('uae','uk','india'));

alter table public.taxonomy_items
  drop constraint if exists taxonomy_items_not_self_parent;

alter table public.taxonomy_items
  add constraint taxonomy_items_not_self_parent
  check (parent_id is null or parent_id <> id);

create unique index if not exists taxonomy_unique_scope_idx
  on public.taxonomy_items (taxonomy_type, slug, coalesce(country_scope, ''));

create index if not exists taxonomy_lookup_idx
  on public.taxonomy_items (taxonomy_type, country_scope, is_active, sort_order);

create index if not exists taxonomy_scope_active_idx
  on public.taxonomy_items (taxonomy_type, country_scope, is_active);

create index if not exists taxonomy_parent_idx
  on public.taxonomy_items (parent_id, sort_order);

create or replace function public.set_taxonomy_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists taxonomy_items_set_updated_at on public.taxonomy_items;
create trigger taxonomy_items_set_updated_at
before update on public.taxonomy_items
for each row execute function public.set_taxonomy_updated_at();

create or replace function public.prevent_taxonomy_parent_cycle()
returns trigger
language plpgsql
as $$
begin
  if new.parent_id is null then
    return new;
  end if;

  if new.parent_id = new.id then
    raise exception 'taxonomy item cannot be its own parent';
  end if;

  if exists (
    with recursive descendants as (
      select id from public.taxonomy_items where parent_id = new.id
      union all
      select child.id
      from public.taxonomy_items child
      inner join descendants d on child.parent_id = d.id
    )
    select 1 from descendants where id = new.parent_id
  ) then
    raise exception 'taxonomy parent assignment would create a cycle';
  end if;

  return new;
end;
$$;

drop trigger if exists taxonomy_items_prevent_parent_cycle on public.taxonomy_items;
create trigger taxonomy_items_prevent_parent_cycle
before insert or update of parent_id on public.taxonomy_items
for each row execute function public.prevent_taxonomy_parent_cycle();

create or replace function public.seed_taxonomy_item(
  p_taxonomy_type text,
  p_label text,
  p_slug text,
  p_parent_taxonomy_type text default null,
  p_parent_slug text default null,
  p_country_scope text default null,
  p_sort_order int default 0
)
returns uuid
language plpgsql
as $$
declare
  v_parent_id uuid;
  v_scope text := nullif(p_country_scope, 'global');
  v_id uuid;
begin
  if p_parent_slug is not null then
    select id into v_parent_id
    from public.taxonomy_items
    where taxonomy_type = coalesce(p_parent_taxonomy_type, p_taxonomy_type)
      and slug = p_parent_slug
      and (country_scope = v_scope or country_scope is null)
    order by case when country_scope = v_scope then 0 else 1 end
    limit 1;

    if v_parent_id is null then
      raise exception 'taxonomy seed parent not found: %.%', coalesce(p_parent_taxonomy_type, p_taxonomy_type), p_parent_slug;
    end if;
  end if;

  insert into public.taxonomy_items (taxonomy_type, label, slug, parent_id, country_scope, is_active, sort_order)
  values (p_taxonomy_type, p_label, p_slug, v_parent_id, v_scope, true, p_sort_order)
  on conflict (taxonomy_type, slug, (coalesce(country_scope, '')))
  do update set
    label = excluded.label,
    parent_id = excluded.parent_id,
    is_active = true,
    sort_order = excluded.sort_order,
    updated_at = now()
  returning id into v_id;

  return v_id;
end;
$$;

-- Countries / geographic bounds.
select public.seed_taxonomy_item('country', 'Global', 'global', null, null, null, 0);
select public.seed_taxonomy_item('country', 'UAE', 'uae', null, null, null, 10);
select public.seed_taxonomy_item('country', 'UK', 'uk', null, null, null, 20);
select public.seed_taxonomy_item('country', 'India', 'india', null, null, null, 30);

select public.seed_taxonomy_item('area_city', 'Abu Dhabi', 'abu-dhabi', 'country', 'uae', 'uae', 10);
select public.seed_taxonomy_item('area_city', 'Al Ain', 'al-ain', 'country', 'uae', 'uae', 20);
select public.seed_taxonomy_item('area_city', 'Dubai', 'dubai', 'country', 'uae', 'uae', 30);
select public.seed_taxonomy_item('area_city', 'Sharjah', 'sharjah', 'country', 'uae', 'uae', 40);
select public.seed_taxonomy_item('area_city', 'Ajman', 'ajman', 'country', 'uae', 'uae', 50);
select public.seed_taxonomy_item('area_city', 'Fujairah', 'fujairah', 'country', 'uae', 'uae', 60);
select public.seed_taxonomy_item('area_city', 'Ras Al Khaimah', 'ras-al-khaimah', 'country', 'uae', 'uae', 70);
select public.seed_taxonomy_item('area_city', 'Umm Al Quwain', 'umm-al-quwain', 'country', 'uae', 'uae', 80);
select public.seed_taxonomy_item('area_city', 'Other UAE', 'other-uae', 'country', 'uae', 'uae', 90);
select public.seed_taxonomy_item('area_city', 'Dubai Marina', 'dubai-marina', 'area_city', 'dubai', 'uae', 110);
select public.seed_taxonomy_item('area_city', 'Downtown Dubai', 'downtown-dubai', 'area_city', 'dubai', 'uae', 120);
select public.seed_taxonomy_item('area_city', 'Business Bay', 'business-bay', 'area_city', 'dubai', 'uae', 130);
select public.seed_taxonomy_item('area_city', 'Palm Jumeirah', 'palm-jumeirah', 'area_city', 'dubai', 'uae', 140);
select public.seed_taxonomy_item('area_city', 'JBR', 'jbr', 'area_city', 'dubai', 'uae', 150);
select public.seed_taxonomy_item('area_city', 'JVC', 'jvc', 'area_city', 'dubai', 'uae', 160);
select public.seed_taxonomy_item('area_city', 'Dubai Hills', 'dubai-hills', 'area_city', 'dubai', 'uae', 170);
select public.seed_taxonomy_item('area_city', 'Arabian Ranches', 'arabian-ranches', 'area_city', 'dubai', 'uae', 180);
select public.seed_taxonomy_item('area_city', 'Meydan', 'meydan', 'area_city', 'dubai', 'uae', 190);
select public.seed_taxonomy_item('area_city', 'Saadiyat Island', 'saadiyat-island', 'area_city', 'abu-dhabi', 'uae', 210);
select public.seed_taxonomy_item('area_city', 'Yas Island', 'yas-island', 'area_city', 'abu-dhabi', 'uae', 220);
select public.seed_taxonomy_item('area_city', 'Al Reem Island', 'al-reem-island', 'area_city', 'abu-dhabi', 'uae', 230);
select public.seed_taxonomy_item('area_city', 'Al Raha', 'al-raha', 'area_city', 'abu-dhabi', 'uae', 240);
select public.seed_taxonomy_item('area_city', 'Khalifa City', 'khalifa-city', 'area_city', 'abu-dhabi', 'uae', 250);

select public.seed_taxonomy_item('area_city', 'England', 'england', 'country', 'uk', 'uk', 10);
select public.seed_taxonomy_item('area_city', 'Scotland', 'scotland', 'country', 'uk', 'uk', 20);
select public.seed_taxonomy_item('area_city', 'Wales', 'wales', 'country', 'uk', 'uk', 30);
select public.seed_taxonomy_item('area_city', 'Northern Ireland', 'northern-ireland', 'country', 'uk', 'uk', 40);
select public.seed_taxonomy_item('area_city', 'Other UK', 'other-uk', 'country', 'uk', 'uk', 50);
select public.seed_taxonomy_item('area_city', 'London', 'london', 'area_city', 'england', 'uk', 110);
select public.seed_taxonomy_item('area_city', 'Manchester', 'manchester', 'area_city', 'england', 'uk', 120);
select public.seed_taxonomy_item('area_city', 'Birmingham', 'birmingham', 'area_city', 'england', 'uk', 130);
select public.seed_taxonomy_item('area_city', 'Liverpool', 'liverpool', 'area_city', 'england', 'uk', 140);
select public.seed_taxonomy_item('area_city', 'Leeds', 'leeds', 'area_city', 'england', 'uk', 150);
select public.seed_taxonomy_item('area_city', 'Bristol', 'bristol', 'area_city', 'england', 'uk', 160);
select public.seed_taxonomy_item('area_city', 'Oxford', 'oxford', 'area_city', 'england', 'uk', 170);
select public.seed_taxonomy_item('area_city', 'Cambridge', 'cambridge', 'area_city', 'england', 'uk', 180);
select public.seed_taxonomy_item('area_city', 'Edinburgh', 'edinburgh', 'area_city', 'scotland', 'uk', 210);
select public.seed_taxonomy_item('area_city', 'Glasgow', 'glasgow', 'area_city', 'scotland', 'uk', 220);

select public.seed_taxonomy_item('area_city', 'India', 'india', 'country', 'india', 'india', 10);

-- Property categories.
select public.seed_taxonomy_item('property_category', 'Residential', 'residential', null, null, null, 10);
select public.seed_taxonomy_item('property_category', 'Commercial', 'commercial', null, null, null, 20);
select public.seed_taxonomy_item('property_category', 'Off-plan', 'off-plan', null, null, null, 30);
select public.seed_taxonomy_item('property_category', 'Secondary', 'secondary', null, null, null, 40);
select public.seed_taxonomy_item('property_category', 'Land', 'land', null, null, null, 50);
select public.seed_taxonomy_item('property_category', 'Industrial', 'industrial', null, null, null, 60);
select public.seed_taxonomy_item('property_category', 'Hospitality', 'hospitality', null, null, null, 70);
select public.seed_taxonomy_item('property_category', 'Mixed-use', 'mixed-use', null, null, null, 80);
select public.seed_taxonomy_item('property_category', 'Investment', 'investment', null, null, null, 90);

-- Market segments.
select public.seed_taxonomy_item('market_segment', 'Off-plan', 'off-plan', null, null, null, 10);
select public.seed_taxonomy_item('market_segment', 'Secondary', 'secondary', null, null, null, 20);
select public.seed_taxonomy_item('market_segment', 'Ready', 'ready', null, null, null, 30);
select public.seed_taxonomy_item('market_segment', 'Under construction', 'under-construction', null, null, null, 40);
select public.seed_taxonomy_item('market_segment', 'New development', 'new-development', null, null, null, 50);
select public.seed_taxonomy_item('market_segment', 'Resale', 'resale', null, null, null, 60);
select public.seed_taxonomy_item('market_segment', 'Rental', 'rental', null, null, null, 70);
select public.seed_taxonomy_item('market_segment', 'Short-term rental', 'short-term-rental', null, null, null, 80);
select public.seed_taxonomy_item('market_segment', 'Income-producing', 'income-producing', null, null, null, 90);
select public.seed_taxonomy_item('market_segment', 'Development opportunity', 'development-opportunity', null, null, null, 100);
select public.seed_taxonomy_item('market_segment', 'Distressed/opportunistic', 'distressed-opportunistic', null, null, null, 110);
select public.seed_taxonomy_item('market_segment', 'Bulk units', 'bulk-units', null, null, null, 120);

-- Property types.
select public.seed_taxonomy_item('property_type', 'Apartment', 'apartment', 'property_category', 'residential', null, 10);
select public.seed_taxonomy_item('property_type', 'Villa', 'villa', 'property_category', 'residential', null, 20);
select public.seed_taxonomy_item('property_type', 'Townhouse', 'townhouse', 'property_category', 'residential', null, 30);
select public.seed_taxonomy_item('property_type', 'Duplex', 'duplex', 'property_category', 'residential', null, 40);
select public.seed_taxonomy_item('property_type', 'Penthouse', 'penthouse', 'property_category', 'residential', null, 50);
select public.seed_taxonomy_item('property_type', 'Mansion', 'mansion', 'property_category', 'residential', null, 60);
select public.seed_taxonomy_item('property_type', 'Branded residence', 'branded-residence', 'property_category', 'residential', null, 70);
select public.seed_taxonomy_item('property_type', 'Serviced apartment', 'serviced-apartment', 'property_category', 'residential', null, 80);
select public.seed_taxonomy_item('property_type', 'Studio', 'studio', 'property_category', 'residential', null, 90);
select public.seed_taxonomy_item('property_type', 'Full floor', 'full-floor', 'property_category', 'residential', null, 100);
select public.seed_taxonomy_item('property_type', 'Full building', 'full-building', 'property_category', 'residential', null, 110);
select public.seed_taxonomy_item('property_type', 'Student housing', 'student-housing', 'property_category', 'residential', null, 120);
select public.seed_taxonomy_item('property_type', 'Co-living', 'co-living', 'property_category', 'residential', null, 130);

select public.seed_taxonomy_item('property_type', 'Office', 'office', 'property_category', 'commercial', null, 210);
select public.seed_taxonomy_item('property_type', 'Retail shop', 'retail-shop', 'property_category', 'commercial', null, 220);
select public.seed_taxonomy_item('property_type', 'Showroom', 'showroom', 'property_category', 'commercial', null, 230);
select public.seed_taxonomy_item('property_type', 'Restaurant / F&B', 'restaurant-f-and-b', 'property_category', 'commercial', null, 240);
select public.seed_taxonomy_item('property_type', 'Clinic / medical space', 'clinic-medical-space', 'property_category', 'commercial', null, 250);
select public.seed_taxonomy_item('property_type', 'Commercial floor', 'commercial-floor', 'property_category', 'commercial', null, 260);
select public.seed_taxonomy_item('property_type', 'Commercial building', 'commercial-building', 'property_category', 'commercial', null, 270);
select public.seed_taxonomy_item('property_type', 'Co-working space', 'co-working-space', 'property_category', 'commercial', null, 280);

select public.seed_taxonomy_item('property_type', 'Warehouse', 'warehouse', 'property_category', 'industrial', null, 310);
select public.seed_taxonomy_item('property_type', 'Industrial unit', 'industrial-unit', 'property_category', 'industrial', null, 320);
select public.seed_taxonomy_item('property_type', 'Logistics facility', 'logistics-facility', 'property_category', 'industrial', null, 330);
select public.seed_taxonomy_item('property_type', 'Factory', 'factory', 'property_category', 'industrial', null, 340);
select public.seed_taxonomy_item('property_type', 'Camp', 'camp', 'property_category', 'industrial', null, 350);
select public.seed_taxonomy_item('property_type', 'Labour camp', 'labour-camp', 'property_category', 'industrial', null, 360);
select public.seed_taxonomy_item('property_type', 'Staff accommodation', 'staff-accommodation', 'property_category', 'industrial', null, 370);
select public.seed_taxonomy_item('property_type', 'Storage facility', 'storage-facility', 'property_category', 'industrial', null, 380);

select public.seed_taxonomy_item('property_type', 'Residential land', 'residential-land', 'property_category', 'land', null, 410);
select public.seed_taxonomy_item('property_type', 'Commercial land', 'commercial-land', 'property_category', 'land', null, 420);
select public.seed_taxonomy_item('property_type', 'Industrial land', 'industrial-land', 'property_category', 'land', null, 430);
select public.seed_taxonomy_item('property_type', 'Agricultural land', 'agricultural-land', 'property_category', 'land', null, 440);
select public.seed_taxonomy_item('property_type', 'Mixed-use land', 'mixed-use-land', 'property_category', 'land', null, 450);
select public.seed_taxonomy_item('property_type', 'Development plot', 'development-plot', 'property_category', 'land', null, 460);
select public.seed_taxonomy_item('property_type', 'Waterfront land', 'waterfront-land', 'property_category', 'land', null, 470);
select public.seed_taxonomy_item('property_type', 'Hospitality land', 'hospitality-land', 'property_category', 'land', null, 480);

select public.seed_taxonomy_item('property_type', 'Hotel', 'hotel', 'property_category', 'hospitality', null, 510);
select public.seed_taxonomy_item('property_type', 'Resort', 'resort', 'property_category', 'hospitality', null, 520);
select public.seed_taxonomy_item('property_type', 'Holiday home portfolio', 'holiday-home-portfolio', 'property_category', 'hospitality', null, 530);
select public.seed_taxonomy_item('property_type', 'Wellness retreat', 'wellness-retreat', 'property_category', 'hospitality', null, 540);
select public.seed_taxonomy_item('property_type', 'Farmhouse', 'farmhouse', 'property_category', 'hospitality', null, 550);
select public.seed_taxonomy_item('property_type', 'Private island / rare asset', 'private-island-rare-asset', 'property_category', 'hospitality', null, 560);

select public.seed_taxonomy_item('property_type', 'Income property', 'income-property', 'property_category', 'investment', null, 610);
select public.seed_taxonomy_item('property_type', 'Bulk units', 'bulk-units', 'property_category', 'investment', null, 620);
select public.seed_taxonomy_item('property_type', 'Portfolio', 'portfolio', 'property_category', 'investment', null, 630);
select public.seed_taxonomy_item('property_type', 'REIT-style asset', 'reit-style-asset', 'property_category', 'investment', null, 640);
select public.seed_taxonomy_item('property_type', 'JV opportunity', 'jv-opportunity', 'property_category', 'investment', null, 650);
select public.seed_taxonomy_item('property_type', 'Development opportunity', 'development-opportunity', 'property_category', 'investment', null, 660);

-- Purposes.
select public.seed_taxonomy_item('purpose', 'Buy', 'buy', null, null, null, 10);
select public.seed_taxonomy_item('purpose', 'Rent', 'rent', null, null, null, 20);
select public.seed_taxonomy_item('purpose', 'Sell privately', 'sell-privately', null, null, null, 30);
select public.seed_taxonomy_item('purpose', 'Lease', 'lease', null, null, null, 40);
select public.seed_taxonomy_item('purpose', 'Invest', 'invest', null, null, null, 50);
select public.seed_taxonomy_item('purpose', 'Buy land', 'buy-land', null, null, null, 60);
select public.seed_taxonomy_item('purpose', 'Lease commercial', 'lease-commercial', null, null, null, 70);
select public.seed_taxonomy_item('purpose', 'Joint venture', 'joint-venture', null, null, null, 80);
select public.seed_taxonomy_item('purpose', 'Development opportunity', 'development-opportunity', null, null, null, 90);
select public.seed_taxonomy_item('purpose', 'Submit availability', 'submit-availability', null, null, null, 100);
select public.seed_taxonomy_item('purpose', 'Request verified listing', 'request-verified-listing', null, null, null, 110);

alter table public.taxonomy_items enable row level security;

drop policy if exists taxonomy_public_select on public.taxonomy_items;
drop policy if exists taxonomy_public_read_staff_write on public.taxonomy_items;
drop policy if exists taxonomy_super_admin_write on public.taxonomy_items;

create policy taxonomy_public_read_staff_write on public.taxonomy_items
  for select using (is_active = true or public.app_is_platform_staff());

create policy taxonomy_super_admin_write on public.taxonomy_items
  for all using (public.app_has_any_role(array['super_admin']))
  with check (public.app_has_any_role(array['super_admin']));
