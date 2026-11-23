-- Reconciles this repository with the already-provisioned, dedicated BRS
-- database. It is additive: no existing application table, record, or policy
-- is removed. Apply only to project wavwoupjwulepbifzvkz.

-- Candidate codes must be generated atomically, rather than calculated by the
-- application from a count. This prevents concurrent registrations colliding.
create sequence if not exists private.candidate_code_sequence start with 1;

create or replace function private.assign_candidate_code()
returns trigger
language plpgsql
set search_path = public, private
as $$
begin
  if new.candidate_code is null or btrim(new.candidate_code) = '' then
    new.candidate_code := format(
      'BRS-%s-%s',
      to_char(current_date, 'YYYY'),
      lpad(nextval('private.candidate_code_sequence')::text, 6, '0')
    );
  end if;
  return new;
end;
$$;

drop trigger if exists candidates_assign_candidate_code on public.candidates;
create trigger candidates_assign_candidate_code
before insert on public.candidates
for each row execute function private.assign_candidate_code();

-- Email is compared case-insensitively and mobile is expected in E.164 form by
-- the server validator. Both constraints are organization-scoped.
create unique index if not exists candidates_org_email_normalized_unique
  on public.candidates (organization_id, lower(email));
create unique index if not exists candidates_org_mobile_unique
  on public.candidates (organization_id, mobile);
create index if not exists candidates_org_pending_matching_idx
  on public.candidates (organization_id, recruitment_status, employment_type, total_experience_months);
create index if not exists candidates_preferred_locations_gin_idx
  on public.candidates using gin (preferred_locations);
create index if not exists candidates_key_skills_gin_idx
  on public.candidates using gin (key_skills);
create index if not exists vacancies_org_matching_idx
  on public.vacancies (organization_id, status, employer_verification_status, application_deadline);
create index if not exists matches_candidate_review_idx
  on public.matches (candidate_id, review_status, match_score desc);
create index if not exists matches_vacancy_review_idx
  on public.matches (vacancy_id, review_status, match_score desc);
create index if not exists interviews_scheduled_status_idx
  on public.interview_schedules (scheduled_at, status);

-- This database began with Drive references. Retain them for a future approved
-- Google Drive integration, while adding an independent private Supabase
-- Storage path for Phase 1 resume uploads.
alter table public.resumes add column if not exists storage_path text;
alter table public.resumes add constraint resumes_storage_path_not_blank
  check (storage_path is null or btrim(storage_path) <> '') not valid;
alter table public.resumes validate constraint resumes_storage_path_not_blank;
create unique index if not exists resumes_storage_path_unique
  on public.resumes (storage_path) where storage_path is not null;
create unique index if not exists resumes_one_current_per_candidate
  on public.resumes (candidate_id) where is_current;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'resumes',
  'resumes',
  false,
  10485760,
  array['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- A browser may read only its own record after it has been authorized through
-- the existing private.can_access_candidate helper. Uploads happen only in a
-- validated server route using the service role, so object paths cannot be
-- guessed or replaced from the browser.
drop policy if exists resume_objects_authorized_read on storage.objects;
create policy resume_objects_authorized_read
on storage.objects for select
to authenticated
using (
  bucket_id = 'resumes' and exists (
    select 1
    from public.resumes r
    where r.storage_path = name
      and private.can_access_candidate(r.candidate_id)
  )
);

-- Consent needs immutable, versioned history rather than only the summary state
-- on candidates. Public access is still default-deny except selected records
-- visible to the relevant candidate or BRS staff.
create table if not exists public.candidate_consents (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  consent_type text not null,
  consent_version text not null,
  granted boolean not null,
  granted_at timestamptz,
  withdrawn_at timestamptz,
  source text not null,
  created_at timestamptz not null default now(),
  check ((granted and granted_at is not null) or not granted)
);
create index if not exists candidate_consents_candidate_type_idx
  on public.candidate_consents (candidate_id, consent_type, created_at desc);
alter table public.candidate_consents enable row level security;
grant select, insert, update, delete on public.candidate_consents to authenticated;
revoke all on public.candidate_consents from anon;

drop policy if exists candidate_consents_read_owner_or_staff on public.candidate_consents;
create policy candidate_consents_read_owner_or_staff
on public.candidate_consents for select
to authenticated
using (private.can_access_candidate(candidate_id));

drop policy if exists candidate_consents_staff_write on public.candidate_consents;
create policy candidate_consents_staff_write
on public.candidate_consents for all
to authenticated
using (
  private.is_org_staff((
    select c.organization_id from public.candidates c where c.id = candidate_id
  ))
)
with check (
  private.is_org_staff((
    select c.organization_id from public.candidates c where c.id = candidate_id
  ))
);

comment on column public.resumes.storage_path is
  'Private Supabase Storage path. Issue only short-lived signed URLs after authorization.';
comment on table public.candidate_consents is
  'Versioned candidate consent history. Do not silently overwrite or delete withdrawal events.';
