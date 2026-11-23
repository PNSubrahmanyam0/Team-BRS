# Supabase bootstrap for BRS AI Recruiter

Run this only in the dedicated BRS project `zxqwxacupnpyyljlgsfp`, after reviewing and applying the migrations. Use a non-production environment for the first pass and dummy details only. The project contains the active BRS organisation and no candidate, application, vacancy, or resume records.

## 1. Verify the BRS organization

The dedicated project already has this one active organization:

| Setting | Value |
| --- | --- |
| Name | BRS Career Dream Job's |
| Slug | `brs-career-dream-jobs` |
| Organization ID | `c8341fb8-4854-4f4f-8af8-5a1b174de642` |

It is already present in `.env.example` as the server-only `BRS_ORGANIZATION_ID`. Do not expose it as a `NEXT_PUBLIC_` value.

## 2. Create the first owner account

Use Supabase Auth to create/verify the organisation owner's user through a controlled test OTP flow. Then, in the SQL editor, insert the matching profile using that **auth user UUID** and the organisation ID above:

```sql
insert into public.profiles (id, organization_id, full_name, role, email, status)
values (
  '<auth-user-uuid>',
  'c8341fb8-4854-4f4f-8af8-5a1b174de642',
  'BRS Owner',
  'owner',
  'owner@example.test',
  'active'
);
```

Replace placeholders only in the SQL editor; do not commit actual personal data to this repository. The service role bypasses RLS, so restrict it to deployment/server environments.

## 3. Validate the security model

Use separate test users for candidate, recruiter, admin, and owner roles. At a minimum, prove the following with direct queries and the UI:

1. A candidate cannot select or update another candidate's profile, documents, applications, messages, or payments.
2. A recruiter can access only their BRS organisation. Employee IDs are AES-GCM encrypted before persistence, and the encryption key exists only in server-side environment settings.
3. An admin/owner can manage staff records without receiving any server-side encryption key.
4. Unauthenticated visitors cannot read any application table or storage object.
5. Candidate-visible vacancies are both active and employer-verified; a draft, expired, filled, closed, or unverified vacancy is unavailable.
6. Resume/document URLs are short-lived signed URLs, never public object URLs.

## 4. Enable registrations only after controls are tested

Set `REGISTRATION_ENABLED=true` only after CAPTCHA, rate limiting, OTP verification, abuse monitoring, retention/erasure workflow, and the tests above are in place. The registration endpoint otherwise returns HTTP 503 by design.
