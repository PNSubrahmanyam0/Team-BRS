-- Reconciles the BRS AI Recruiter website with the dedicated target project
-- zxqwxacupnpyyljlgsfp. This migration is additive and preserves the existing
-- BRS job-platform foundation and its application-owner profile.

alter table public.organizations
  add column if not exists status text not null default 'active'
  check (status in ('active', 'inactive'));

alter table public.profiles
  add column if not exists organization_id uuid references public.organizations(id) on delete set null,
  add column if not exists mobile text,
  add column if not exists status text not null default 'active'
  check (status in ('active', 'inactive'));

create index if not exists profiles_organization_id_idx on public.profiles (organization_id);

-- The original app uses organization-scoped recruitment records. The first
-- owner already exists in Auth and in public.profiles, so we can safely attach
-- the BRS workspace without inventing a user or credentials.
insert into public.organizations (owner_id, name, slug, description, is_verified, status)
select
  p.id,
  'BRS Career Dream Jobs',
  'brs-career-dream-jobs',
  'BRS recruitment operations workspace.',
  true,
  'active'
from public.profiles p
where p.email = 'brscareerdreamjobs@gmail.com'
on conflict (slug) do update
  set name = excluded.name,
      description = excluded.description,
      is_verified = true,
      status = 'active';

update public.profiles
set organization_id = (
      select id from public.organizations where slug = 'brs-career-dream-jobs'
    ),
    status = 'active',
    mobile = coalesce(mobile, phone)
where email = 'brscareerdreamjobs@gmail.com';

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  company_name text not null check (char_length(trim(company_name)) between 2 and 180),
  industry text,
  contact_name text,
  contact_email text,
  contact_phone text,
  verification_status text not null default 'unverified'
    check (verification_status in ('unverified', 'pending', 'verified', 'rejected')),
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.candidates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid unique references auth.users(id) on delete set null,
  candidate_code text not null default '',
  employment_type text not null check (employment_type in ('fresher', 'experienced')),
  full_name text not null check (char_length(trim(full_name)) between 2 and 180),
  email text not null,
  mobile text not null,
  current_location text,
  preferred_locations text[] not null default '{}',
  preferred_job_roles text[] not null default '{}',
  key_skills text[] not null default '{}',
  highest_qualification text,
  graduation_year integer,
  college_name text,
  specialization text,
  certifications text,
  projects text,
  total_experience_months integer,
  relevant_experience_months integer,
  current_job_role text,
  previous_company text,
  current_company text,
  employee_id_encrypted text,
  current_ctc numeric(12,2),
  expected_ctc numeric(12,2),
  notice_period text,
  last_working_day date,
  consent_status text not null default 'pending' check (consent_status in ('pending', 'granted', 'withdrawn')),
  registration_status text not null default 'started' check (registration_status in ('started', 'completed')),
  profile_status text not null default 'pending' check (profile_status in ('pending', 'active', 'inactive', 'rejected')),
  recruitment_status text not null default 'pending_vacancy_assignment',
  profile_completion integer not null default 0 check (profile_completion between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vacancies (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete restrict,
  job_title text not null check (char_length(trim(job_title)) between 2 and 180),
  location text,
  domain text,
  work_mode text,
  shift text,
  job_description text,
  package_min numeric(12,2),
  package_max numeric(12,2),
  experience_min_months integer,
  experience_max_months integer,
  mandatory_skills text[] not null default '{}',
  preferred_skills text[] not null default '{}',
  qualification_requirements text[] not null default '{}',
  graduation_year_requirements integer[] not null default '{}',
  openings integer,
  employer_verification_status text not null default 'pending'
    check (employer_verification_status in ('pending', 'verified', 'rejected')),
  status text not null default 'draft'
    check (status in ('draft', 'active', 'filled', 'closed', 'archived')),
  application_deadline timestamptz,
  activated_at timestamptz,
  interview_details text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (package_min is null or package_min >= 0),
  check (package_max is null or package_max >= 0),
  check (package_min is null or package_max is null or package_max >= package_min),
  check (experience_min_months is null or experience_min_months >= 0),
  check (experience_max_months is null or experience_max_months >= 0),
  check (experience_min_months is null or experience_max_months is null or experience_max_months >= experience_min_months)
);

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  vacancy_id uuid not null references public.vacancies(id) on delete cascade,
  match_score numeric(5,2) not null default 0 check (match_score between 0 and 100),
  eligibility_status text not null default 'pending',
  review_status text not null default 'pending',
  explanation text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (candidate_id, vacancy_id)
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  vacancy_id uuid not null references public.vacancies(id) on delete cascade,
  match_id uuid references public.matches(id) on delete set null,
  application_status text not null default 'submitted',
  applied_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (candidate_id, vacancy_id)
);

create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  storage_path text unique,
  drive_file_id text,
  original_filename text not null,
  mime_type text,
  file_size bigint,
  file_hash text,
  version_number integer not null default 1 check (version_number > 0),
  extraction_status text not null default 'pending',
  parsed_data jsonb not null default '{}'::jsonb,
  is_current boolean not null default true,
  uploaded_at timestamptz not null default now()
);

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

create index if not exists companies_organization_id_idx on public.companies (organization_id);
create index if not exists candidates_organization_id_idx on public.candidates (organization_id);
create index if not exists candidates_user_id_idx on public.candidates (user_id);
create unique index if not exists candidates_org_email_normalized_unique
  on public.candidates (organization_id, lower(email));
create unique index if not exists candidates_org_mobile_unique
  on public.candidates (organization_id, mobile);
create unique index if not exists candidates_candidate_code_unique
  on public.candidates (candidate_code);
create index if not exists vacancies_organization_id_idx on public.vacancies (organization_id);
create index if not exists applications_organization_id_idx on public.applications (organization_id);
create index if not exists applications_candidate_id_idx on public.applications (candidate_id);
create unique index if not exists resumes_one_current_per_candidate
  on public.resumes (candidate_id) where is_current;

create sequence if not exists private.candidate_code_sequence start with 1;

create or replace function private.assign_candidate_code()
returns trigger
language plpgsql
security definer
set search_path = ''
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

create or replace function private.is_org_staff(p_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.can_manage_organization(p_organization_id);
$$;

create or replace function private.can_access_candidate(p_candidate_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.candidates c
    where c.id = p_candidate_id
      and (c.user_id = (select auth.uid()) or private.is_org_staff(c.organization_id))
  );
$$;

drop trigger if exists candidates_assign_candidate_code on public.candidates;
create trigger candidates_assign_candidate_code
before insert on public.candidates
for each row execute function private.assign_candidate_code();

drop trigger if exists companies_set_updated_at on public.companies;
create trigger companies_set_updated_at
before update on public.companies
for each row execute function public.set_updated_at();

drop trigger if exists candidates_set_updated_at on public.candidates;
create trigger candidates_set_updated_at
before update on public.candidates
for each row execute function public.set_updated_at();

drop trigger if exists vacancies_set_updated_at on public.vacancies;
create trigger vacancies_set_updated_at
before update on public.vacancies
for each row execute function public.set_updated_at();

drop trigger if exists matches_set_updated_at on public.matches;
create trigger matches_set_updated_at
before update on public.matches
for each row execute function public.set_updated_at();

drop trigger if exists applications_set_updated_at on public.applications;
create trigger applications_set_updated_at
before update on public.applications
for each row execute function public.set_updated_at();

alter table public.companies enable row level security;
alter table public.candidates enable row level security;
alter table public.vacancies enable row level security;
alter table public.matches enable row level security;
alter table public.applications enable row level security;
alter table public.resumes enable row level security;
alter table public.candidate_consents enable row level security;

revoke all on public.companies, public.candidates, public.vacancies, public.matches,
  public.applications, public.resumes, public.candidate_consents from anon, authenticated;
grant select, insert, update, delete on public.companies, public.candidates, public.vacancies,
  public.matches, public.applications, public.resumes, public.candidate_consents to authenticated;

create policy "companies: staff manage organization"
on public.companies for all to authenticated
using ((select private.is_org_staff(organization_id)))
with check ((select private.is_org_staff(organization_id)));

create policy "candidates: candidate or staff read"
on public.candidates for select to authenticated
using ((select private.can_access_candidate(id)));

create policy "candidates: staff create"
on public.candidates for insert to authenticated
with check ((select private.is_org_staff(organization_id)));

create policy "candidates: staff update"
on public.candidates for update to authenticated
using ((select private.is_org_staff(organization_id)))
with check ((select private.is_org_staff(organization_id)));

create policy "candidates: staff delete"
on public.candidates for delete to authenticated
using ((select private.is_org_staff(organization_id)));

create policy "vacancies: staff manage organization"
on public.vacancies for all to authenticated
using ((select private.is_org_staff(organization_id)))
with check ((select private.is_org_staff(organization_id)));

create policy "matches: staff manage organization"
on public.matches for all to authenticated
using ((select private.is_org_staff(organization_id)))
with check ((select private.is_org_staff(organization_id)));

create policy "applications: candidate or staff read"
on public.applications for select to authenticated
using (
  exists (
    select 1 from public.candidates c
    where c.id = candidate_id
      and (c.user_id = (select auth.uid()) or private.is_org_staff(organization_id))
  )
);

create policy "applications: staff manage organization"
on public.applications for insert to authenticated
with check ((select private.is_org_staff(organization_id)));

create policy "applications: staff update"
on public.applications for update to authenticated
using ((select private.is_org_staff(organization_id)))
with check ((select private.is_org_staff(organization_id)));

create policy "applications: staff delete"
on public.applications for delete to authenticated
using ((select private.is_org_staff(organization_id)));

create policy "resumes: candidate or staff read"
on public.resumes for select to authenticated
using ((select private.can_access_candidate(candidate_id)));

create policy "resumes: staff manage"
on public.resumes for all to authenticated
using (
  exists (
    select 1 from public.candidates c
    where c.id = candidate_id and private.is_org_staff(c.organization_id)
  )
)
with check (
  exists (
    select 1 from public.candidates c
    where c.id = candidate_id and private.is_org_staff(c.organization_id)
  )
);

create policy "candidate consents: candidate or staff read"
on public.candidate_consents for select to authenticated
using ((select private.can_access_candidate(candidate_id)));

create policy "candidate consents: staff manage"
on public.candidate_consents for all to authenticated
using (
  exists (
    select 1 from public.candidates c
    where c.id = candidate_id and private.is_org_staff(c.organization_id)
  )
)
with check (
  exists (
    select 1 from public.candidates c
    where c.id = candidate_id and private.is_org_staff(c.organization_id)
  )
);

revoke all on function private.assign_candidate_code() from public, anon, authenticated, service_role;
revoke all on function private.is_org_staff(uuid) from public, anon, authenticated, service_role;
revoke all on function private.can_access_candidate(uuid) from public, anon, authenticated, service_role;
grant execute on function private.is_org_staff(uuid) to authenticated;
grant execute on function private.can_access_candidate(uuid) to authenticated;

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

drop policy if exists "resume objects: authorized read" on storage.objects;
create policy "resume objects: authorized read"
on storage.objects for select to authenticated
using (
  bucket_id = 'resumes'
  and exists (
    select 1
    from public.resumes r
    where r.storage_path = name
      and private.can_access_candidate(r.candidate_id)
  )
);
