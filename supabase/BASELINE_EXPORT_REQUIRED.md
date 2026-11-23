# Baseline schema export required

The dedicated BRS project (`wavwoupjwulepbifzvkz`) was initialized directly before this repository received its first source commit. It contains the original 27 application tables, RLS policies, private authorization helpers, Google Drive connection structures, and one empty BRS organisation. The repository currently contains only the three **additive** reconciliation migrations applied on 23 November 2026.

This means that a blank database cannot be recreated with `supabase db reset` or `supabase db push` from this repository alone. Do not attempt either against a new project.

Before branch, preview, or disaster-recovery use, an authorized project administrator must export the pre-existing schema and commit it as the baseline. A safe workflow is:

```bash
# Authenticate with a scoped Supabase access token and the database password.
npx supabase link --project-ref wavwoupjwulepbifzvkz
npx supabase db pull --remote baseline_brs_schema --yes
```

Review the resulting baseline carefully; it must include the public schema, the unexposed `private` helper schema, RLS policies, indexes, triggers, storage configuration, and no real candidate, document, payment, or credential data. Then retain the three later reconciliation migrations in timestamp order.

Do not commit:

- Supabase database passwords, personal access tokens, API secret/service-role keys, OAuth tokens, or `.env.local` files.
- Candidate profiles, resumes, identity documents, payment records, or Google Drive refresh tokens.
