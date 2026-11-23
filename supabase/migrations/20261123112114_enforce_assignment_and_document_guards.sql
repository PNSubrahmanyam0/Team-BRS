-- Preserve reassignment history while making the active assignment unambiguous.
-- The operational reassignment transaction must first supersede/end the prior
-- row, then insert the new current row with a reason and actor.
create unique index if not exists application_assignments_one_current
  on public.application_assignments (application_id)
  where assignment_status = 'current';

-- BRS may record inspection and immediate return of an original certificate;
-- it must never retain an original as a candidate document.
alter table public.candidate_documents
  add constraint candidate_documents_no_original_certificate
  check (document_type <> 'original_educational_certificate') not valid;
alter table public.candidate_documents
  validate constraint candidate_documents_no_original_certificate;

comment on table public.candidate_documents is
  'Copies only with consent. Original educational certificates may be inspected and immediately returned; they are never retained as security.';
