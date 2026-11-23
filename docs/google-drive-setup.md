# BRS AI Recruiter — Google Drive OAuth setup

The app uses the personal Google account selected by the BRS owner. Files are stored in that account's Drive, not Supabase Storage.

## Google Cloud setup (owner action required)
1. Open https://console.cloud.google.com/ and create/select a Google Cloud project for BRS AI Recruiter.
2. Enable **Google Drive API**.
3. Configure the OAuth consent screen. Add the personal Gmail account that owns the existing BRS folder as a test user while the app is in Testing.
4. Create an OAuth Client ID with application type **Web application**.
5. Add this exact Authorized redirect URI: `https://YOUR_APP_DOMAIN/api/google-drive/callback`. For local testing add `http://localhost:3000/api/google-drive/callback`.
6. Create an API key and restrict it to the Google Picker API and your app's allowed HTTP referrers.
7. Record the OAuth Client ID, Client Secret, API key and numeric Google Cloud project number (Picker App ID).

## Environment variables
Set these in local `.env.local` and the deployment provider's encrypted environment settings. Never commit real values.

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:3000/api/google-drive/callback
GOOGLE_OAUTH_STATE_SECRET=
GOOGLE_TOKEN_ENCRYPTION_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_GOOGLE_API_KEY=
NEXT_PUBLIC_GOOGLE_APP_ID=
```

Generate the two random secrets locally with a cryptographically secure generator. The token encryption key must decode to 32 bytes; base64-encoded 32 bytes is accepted. The OAuth state secret must be at least 32 characters.

## Connect the existing folder
1. Sign into BRS AI Recruiter as the owner/admin.
2. Open **Storage settings**.
3. Connect the personal Google account that owns or has Editor access to the existing folder.
4. Use Google Picker to select the existing folder. The folder must allow the connected account to add files.
5. The app creates six subfolders under that selected folder and stores their IDs in Supabase.

## Security
- OAuth requests only `drive.file` and `userinfo.email`; no broad full-Drive scope.
- Refresh tokens are encrypted with AES-256-GCM before storage.
- Refresh tokens are never returned to the browser.
- The connection table has RLS enabled and no grants to anon/authenticated. Only server-side service-role code reads it.
- Upload routes require an active BRS owner/admin/recruiter session and verify the candidate/vacancy belongs to the organization.
- Files are private in Drive. The application stores Drive IDs and metadata only.
- Do not use public Drive sharing links for CVs, identity documents or agreements.
- Google OAuth app verification may be required before public production use, depending on scopes and audience. Keep the app in Testing and add only trusted test users until verification is complete.

## OAuth publishing status warning
- If Google offers a **Personal** audience/mode and only the connected personal Google account will authorize Drive access, use that option.
- If you configure an **External** app and leave its publishing status as **Testing**, Google documents that refresh tokens expire after 7 days when Drive scopes are requested. This would require reconnecting weekly. Do not treat Testing mode as a permanent production setup.
- Before public production use, review Google's current publishing/verification requirements for the exact scopes and audience. The app intentionally uses the narrower `drive.file` scope rather than broad full-Drive access.
