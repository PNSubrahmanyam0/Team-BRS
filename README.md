# BRS AI Recruiter

An independent, security-first recruitment platform for **BRS Career Dream Job's**. It is a new project; it does not share a database, users, or deployment with any existing BRS or other application.

## Current implementation

The first build is a working Next.js foundation with fictional development data:

- Candidate registration, dynamically tailored to Fresher or Experienced candidates.
- Required PDF/DOCX resume selection and a private-storage upload route, disabled by default until the safety checks in [Launch checklist](#launch-checklist) are complete.
- Email OTP sign-in and candidate-account claim scaffolding using Supabase Auth, with no password stored by this app. Mobile OTP stays off until an approved SMS provider is configured.
- A candidate dashboard that requires an active, linked candidate session, plus the existing server-guarded staff dashboard.
- Deterministic candidate–vacancy eligibility and scoring. Mandatory failures always prevent an automatic recommendation.
- A schema already provisioned in the dedicated BRS Supabase project: organisations, roles, candidates, resumes, companies, vacancies and versions, applications/reassignments/history, interviews, documents, agreements, payment ledger, notifications, Google Drive integration records, and audit logs.
- Generated TypeScript definitions checked into [`types/database.types.ts`](types/database.types.ts) from that real database.
- Private Supabase Storage for resumes, versioned consent history, and RLS policies for the new records.

It intentionally does **not** make AI requests, send WhatsApp messages, initiate calls, collect Razorpay payments, or process real candidate data.

## Requirements

- Node.js 22+
- npm 10+
- The separate Supabase project `brs-ai-recruiter` in Mumbai (`wavwoupjwulepbifzvkz`)

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open <http://localhost:3000>. Without credentials, all public pages and the health check work in preview mode; database-backed registration remains safely disabled.

## Configure Supabase

1. In the new BRS Supabase project, obtain the project URL and **publishable** API key. Put them in `.env.local` as `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
2. Keep `SUPABASE_SERVICE_ROLE_KEY` only in `.env.local` and the deployment provider's encrypted server-side secret store. It must never have a `NEXT_PUBLIC_` prefix.
3. Generate a unique, server-only encryption key for the optional employee ID:

   ```bash
   openssl rand -base64 32
   ```

   Put it in `EMPLOYEE_ID_ENCRYPTION_KEY`.
4. Authenticate the Supabase CLI separately from the Codex MCP connection, then link and apply the reviewed migrations:

   ```bash
   npx supabase login
   npx supabase link --project-ref wavwoupjwulepbifzvkz
   npx supabase db push
   ```

   **Important:** the initial 27-table BRS schema was provisioned directly in the new remote project before this otherwise-empty repository was initialized. It has no checked-in baseline migration. Do not use `supabase db reset` or apply the three reconciliation migrations to a blank project: they are deliberately additive and require that existing baseline. Export and commit a baseline schema before creating any preview or replacement database.

5. Follow [Supabase bootstrap](supabase/BOOTSTRAP.md) to provision the first owner and verify the existing BRS organisation. `BRS_ORGANIZATION_ID` is supplied in `.env.example`; do not make it public.
6. Configure Supabase Auth email OTP and password-recovery templates, CAPTCHA/rate limiting, and a transactional email provider. Add `http://localhost:3000/auth/update-password` to the Supabase Auth Redirect URL allow-list for local recovery tests; add the deployed equivalent before release. Only then set `REGISTRATION_ENABLED=true` and `AUTH_OTP_ENABLED=true` in a non-production environment.

The Codex Supabase MCP server is configured for project `wavwoupjwulepbifzvkz`; it is separate from the CLI authentication above.

## Database design

The dedicated project was already provisioned before this repository was initialized. The checked-in reconciliation migrations preserve that existing schema and add only non-destructive safeguards:

- [`20261123111621_reconcile_remote_registration.sql`](supabase/migrations/20261123111621_reconcile_remote_registration.sql) adds atomic candidate-code generation, case-normalized duplicate protection, matching indexes, private resume storage, and versioned consent history protected by RLS.
- [`20261123112114_enforce_assignment_and_document_guards.sql`](supabase/migrations/20261123112114_enforce_assignment_and_document_guards.sql) allows exactly one current assignment per application while retaining prior assignment rows, and prevents retaining original educational certificates as documents.
- [`20261123114309_narrow_candidate_consent_write_policies.sql`](supabase/migrations/20261123114309_narrow_candidate_consent_write_policies.sql) narrows staff consent mutations to insert, update, and delete so the read policy remains the only permissive `SELECT` policy.
- Existing role and candidate ownership helpers reside in the unexposed `private` schema. The app never exposes the Supabase service-role key to the browser.
- Resume URLs must be short-lived signed URLs issued only after authorization. Browser-side object writes are denied; validated server routes use the service role.

The reconciliation migrations do not enable WhatsApp, payment processing, AI extraction, or calls. The existing Google Drive connection UI remains credential-free until it is explicitly configured and tested; see [`docs/google-drive-setup.md`](docs/google-drive-setup.md).

## Matching behaviour

`lib/matching.ts` evaluates the mandatory requirements first: vacancy availability, employer verification, experience range, mandatory skills, qualification, and graduation-year rule. If any fails, the result is ineligible regardless of score.

Eligible scores use the agreed initial weighting:

| Input | Weight |
| --- | ---: |
| Relevant experience | 25% |
| Skills | 25% |
| Domain | 20% |
| Qualification | 15% |
| Location / work mode | 10% |
| Role preference | 5% |

85–100 routes to a recommendation candidate; 70–84 routes to recruiter review; lower scores are not automatically recommended. The evaluator returns matching/missing skills and an explanation rather than an opaque outcome.

## Useful commands

```bash
npm run typecheck
npm test
npm run build
npm run dev
```

`GET /api/health` reports whether the public Supabase configuration and registration feature flag are present without returning any secret values.

## Launch checklist

Do not enable external candidate traffic or set `REGISTRATION_ENABLED=true` until all of these are complete:

- [ ] Export and commit the pre-existing baseline schema before creating a fresh local/preview database. The three repository migrations are additive reconciliations and have already been applied to the dedicated remote BRS project.
- [ ] Complete and test email OTP, CAPTCHA, durable server-side rate limiting, sessions, claim-profile workflow, and duplicate-account handling. Add mobile OTP only after an approved SMS provider is in place.
- [ ] Add an authenticated resume-replacement route that creates a new version, marks the old version non-current, audits the update, and queues rematching.
- [ ] Maintain server-side owner/admin/recruiter route checks for every staff route. `/admin` now redirects to the already guarded `/dashboard`; test this boundary with separate candidate and staff users before launch.
- [ ] Implement transactional application reassignment and status transition RPCs that append history/audit rows and do not silently alter agreements, offers, payments, or interviews.
- [ ] Implement the background queue for matching. Do not make vacancy activation wait for matching, resume extraction, or notifications.
- [ ] Obtain legal/privacy/retention review, backup/recovery plan, monitoring, and incident ownership.
- [ ] Obtain explicit approval and use sandbox integrations before enabling WhatsApp, AI, Razorpay, Google Drive, or production email/SMS.
- [ ] Perform security review and acceptance testing using only dummy data; no real resumes, IDs, payments, passwords, or WhatsApp messages during testing.

## Scope boundary

This repository has no live payment, WhatsApp, AI, Google Drive, Vercel, or Razorpay credentials. Configuring or enabling any of those is a separate, explicit release decision.
