# Baseline schema export required

The dedicated BRS project (`zxqwxacupnpyyljlgsfp`) now contains the BRS job-platform foundation plus the additive website reconciliation migration. It includes the active BRS organisation, the linked owner profile, candidate and recruiter workflow tables, RLS policies, and a private resume bucket. The older migration notes in this repository are historical; do not apply them to a blank or unrelated project.

This means that a blank database cannot be recreated with `supabase db reset` or `supabase db push` from this repository alone. Do not attempt either against a new project.

Before branch, preview, or disaster-recovery use, an authorized project administrator must export the pre-existing schema and commit it as the baseline. A safe workflow is:

```bash
# Authenticate with a scoped Supabase access token and the database password.
npx supabase link --project-ref zxqwxacupnpyyljlgsfp
npx supabase db pull --remote baseline_brs_schema --yes
```

Review the resulting baseline carefully; it must include the public schema, the unexposed `private` helper schema, RLS policies, indexes, triggers, storage configuration, and no real candidate, document, payment, or credential data. Then retain the three later reconciliation migrations in timestamp order.

Do not commit:

- Supabase database passwords, personal access tokens, API secret/service-role keys, OAuth tokens, or `.env.local` files.
- Candidate profiles, resumes, identity documents, payment records, or Google Drive refresh tokens.
