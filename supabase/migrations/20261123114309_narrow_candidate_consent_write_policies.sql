-- Keep candidate/staff reads in the dedicated SELECT policy. Splitting staff
-- writes avoids a second permissive SELECT policy while retaining tenant-safe
-- mutations.
drop policy if exists candidate_consents_staff_write on public.candidate_consents;
drop policy if exists candidate_consents_staff_insert on public.candidate_consents;
drop policy if exists candidate_consents_staff_update on public.candidate_consents;
drop policy if exists candidate_consents_staff_delete on public.candidate_consents;

create policy candidate_consents_staff_insert
on public.candidate_consents for insert
to authenticated
with check (
  private.is_org_staff((
    select c.organization_id from public.candidates c where c.id = candidate_id
  ))
);

create policy candidate_consents_staff_update
on public.candidate_consents for update
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

create policy candidate_consents_staff_delete
on public.candidate_consents for delete
to authenticated
using (
  private.is_org_staff((
    select c.organization_id from public.candidates c where c.id = candidate_id
  ))
);
