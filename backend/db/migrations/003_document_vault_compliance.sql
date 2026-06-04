create extension if not exists pgcrypto;

alter table public.document_uploads
  alter column verification_status set default 'under_review';

update public.document_uploads
set verification_status = 'under_review'
where verification_status is null or verification_status not in ('under_review', 'verified', 'failed', 'expired');

alter table public.document_uploads drop constraint if exists document_uploads_type_valid;
alter table public.document_uploads
  add constraint document_uploads_type_valid check (document_type in (
    'title_deed',
    'owner_id',
    'power_of_attorney',
    'authority_letter',
    'broker_licence',
    'company_licence',
    'ad_permit',
    'project_approval',
    'floor_plan',
    'proof_of_funds'
  ));

alter table public.document_uploads drop constraint if exists document_uploads_mime_type_valid;
alter table public.document_uploads
  add constraint document_uploads_mime_type_valid check (mime_type in ('application/pdf', 'image/jpeg', 'image/png'));

alter table public.document_uploads drop constraint if exists document_uploads_file_size_valid;
alter table public.document_uploads
  add constraint document_uploads_file_size_valid check (file_size > 0 and file_size <= 10485760);

alter table public.document_uploads drop constraint if exists document_uploads_verification_status_valid;
alter table public.document_uploads
  add constraint document_uploads_verification_status_valid check (verification_status in ('under_review', 'verified', 'failed', 'expired'));

alter table public.document_uploads drop constraint if exists document_uploads_failed_reason_required;
alter table public.document_uploads
  add constraint document_uploads_failed_reason_required check (verification_status <> 'failed' or nullif(trim(rejection_reason), '') is not null);

create index if not exists document_uploads_type_status_idx on public.document_uploads (document_type, verification_status, created_at desc);
create index if not exists compliance_checks_object_idx on public.compliance_checks (object_type, object_id, created_at desc);

do $$
begin
  if to_regclass('storage.buckets') is not null then
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    values ('documents', 'documents', false, 10485760, array['application/pdf', 'image/jpeg', 'image/png'])
    on conflict (id) do update
      set public = false,
          file_size_limit = 10485760,
          allowed_mime_types = array['application/pdf', 'image/jpeg', 'image/png'];
  end if;
end $$;

do $$
begin
  if to_regclass('storage.objects') is not null then
    alter table storage.objects enable row level security;

    drop policy if exists documents_storage_owner_insert on storage.objects;
    drop policy if exists documents_storage_owner_read on storage.objects;
    drop policy if exists documents_storage_staff_read on storage.objects;
    drop policy if exists documents_storage_no_public_read on storage.objects;

    create policy documents_storage_owner_insert on storage.objects
      for insert with check (
        bucket_id = 'documents'
        and owner = auth.uid()
        and name like ('private/' || auth.uid()::text || '/%')
      );

    create policy documents_storage_owner_read on storage.objects
      for select using (
        bucket_id = 'documents'
        and owner = auth.uid()
        and name like ('private/' || auth.uid()::text || '/%')
      );

    create policy documents_storage_staff_read on storage.objects
      for select using (
        bucket_id = 'documents'
        and public.app_is_platform_staff()
      );
  end if;
end $$;
