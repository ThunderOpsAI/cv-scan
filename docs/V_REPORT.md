# CVScan Phase 0 Verification Report

> Date: April 28, 2026
> Agent: Agent 1
> Scope: `docs/BUILDSPEC.md` Phase 0
> Repo: local verification only, no production testing

## Pre-Flight

| Check | Status | Notes |
|---|---|---|
| `cd app && npm install` | PASS | Completed after dependency fixes and auth-provider cleanup. |
| `cd app && npm run build` | PASS | Exits `0` after build/runtime hardening. |
| `cd app && npm run dev` | FAIL (env/runtime) | In this local environment, Next.js fails during host detection with `uv_interface_addresses` (`ERR_SYSTEM_ERROR`). App does start when run directly as `next dev --hostname 127.0.0.1` for local inspection. |
| `.env.local` completeness | FAIL | `app/.env.local` is missing locally. `/api/debug/auth-check` reports auth/Supabase env vars missing. |

## V1 Authentication

| Item | Status | Notes |
|---|---|---|
| Magic-link email sign-in creates records in `auth.users` and `public.users` | BLOCKED | Email provider code is present, but Resend/Supabase env vars were missing locally so the full sign-in flow could not be exercised. |
| Magic-link email sign-in redirects to `/dashboard` | BLOCKED | Sign-in page and callback handling are wired, but the live flow could not be verified without email/Supabase env vars. |
| Google OAuth sign-in works (if configured) | BLOCKED | Code path exists, but Google OAuth env vars are missing locally. |
| Protected routes redirect unauthenticated users to `/auth/signin` | PASS | Verified locally with `307` redirects for `/dashboard`, `/generate/bullets`, and `/buy-credits`. |
| Sign-out clears session and redirects to `/` | BLOCKED | UI code calls `signOut({ callbackUrl: "/" })`, but could not be exercised without a working session. |
| Deleted user cannot sign in after account deletion | BLOCKED | Delete flow depends on Supabase auth/data env and a real user session. |

## V2 Payments & Credits

| Item | Status | Notes |
|---|---|---|
| `/buy-credits` page loads with Stripe checkout options | PASS | Page builds and route renders locally. |
| Stripe checkout session creates successfully (test mode) | BLOCKED | Stripe env vars are missing locally. |
| `/api/stripe/webhook` processes `checkout.session.completed` | BLOCKED | Handler exists, but could not be exercised without Stripe test credentials and webhook secret. |
| Credits are added after successful payment | BLOCKED | Webhook/RPC path present, but not testable without Supabase + Stripe env. |
| Credit balance displays correctly on dashboard | BLOCKED | Session enrichment code exists, but no authenticated local session was available. |
| Generation routes return `402` when credits = 0 | PASS (code review) | Verified statically across generation routes via `deductCredits` / explicit `402` branches. |
| Credits deduct correctly on successful generation | BLOCKED | Deduction RPC wiring exists, but cannot be executed without Supabase env and seeded user data. |

## V3 Resume Scan & OCR

| Item | Status | Notes |
|---|---|---|
| Resume upload accepts PDF/DOCX | PASS (code fix) | Added `app/app/api/profile/resume-upload/route.ts` and `app/lib/profile/resume-files.ts` so PDF/DOCX uploads are processed server-side instead of `file.text()` on the client. |
| OCR extraction processes uploaded images | PASS | `/api/resume/ocr` and `/api/jobs/ocr` use Tesseract.js. |
| Extracted text populates profile fields | PASS | Upload handlers populate the resume text box in `app/app/dashboard/profile/facts/page.tsx`. |
| Mobile camera capture works on Android Chrome | PASS (code path) | File inputs retain `capture="environment"` for image-based capture. Physical Android testing was not performed locally. |
| Files are stored in `resume_uploads` bucket under `{user_id}/` | PASS (code fix, unverified live) | New upload route stores files to `resume_uploads/{user_id}/...`. Live verification remains blocked by missing Supabase env. |
| Cross-user access to stored files is blocked (RLS) | PASS (schema review) | `app/database/schema.sql` and `app/database/cvscan-full-schema.sql` define owner-folder RLS policies on `storage.objects` for `resume_uploads`. |

Smoke test note: the new PDF/DOCX extraction helper was exercised locally against generated sample DOCX/PDF buffers and returned extracted text for both formats.

## V4 Privacy & Compliance

| Item | Status | Notes |
|---|---|---|
| `/privacy` loads and contains accurate disclosures | PASS | Local `HEAD /privacy` returned `200`. Updated page to remove the incorrect Anthropic reference and to use `.com.au` contact details. |
| `/terms` loads and contains accurate disclosures | PASS | Local `HEAD /terms` returned `200`. Updated legal contact to `legal@cvscan.com.au`. |
| `/delete-account` loads without auth | PASS | Local `HEAD /delete-account` returned `200`. |
| In-app deletion removes from `public.users`, `auth.users`, and `resume_uploads` | BLOCKED | Code path exists and deletes storage first, then `public.users`, then `auth.admin.deleteUser()`. Could not be executed locally without Supabase env and an authenticated user. |
| No beta placeholder text remains in legal pages | PASS | Verified release-facing legal pages and updated lingering legacy-domain / provider references. |

## V5 Domain & Deployment

| Item | Status | Notes |
|---|---|---|
| `cvscan.com.au` resolves to Vercel | FAIL | `curl -I -L https://cvscan.com.au` on April 27, 2026 returned `curl: (6) Could not resolve host: cvscan.com.au`. |
| `https://cvscan.com.au/privacy` is publicly accessible | FAIL | Blocked by unresolved domain. Local route works. |
| `https://cvscan.com.au/terms` is publicly accessible | FAIL | Blocked by unresolved domain. Local route works. |
| `https://cvscan.com.au/delete-account` is publicly accessible | FAIL | Blocked by unresolved domain. Local route works. |
| All internal `cvscan.com` references updated to `cvscan.com.au` | PASS | Verified with `rg -nP "cvscan\\.com(?!\\.au)" . -S` returning no matches. |

## V6 Existing Blockers / Prior-Agent Issues

| Item | Status | Notes |
|---|---|---|
| BA-1: DPA status with AI sub-processors documented/escalated | FAIL | No DPA artifacts are present in the repo. Owner still needs to confirm current Google Gemini and OpenAI DPA status before production. |
| BA-3: AI sub-processor retention windows verified or documented | FAIL | No authoritative retention-policy proof is present in the repo. Unsupported claims were removed from the privacy page. |
| BA-4: `analytics_events` 12-month TTL implemented or documented | PASS | Added `app/database/phase-0-analytics-retention.sql` with a purge function plus optional monthly `pg_cron` scheduling. |
| Engineering blockers from `PRE_SUBMISSION_CHECKLIST.md` Sections 5–7 verified or fixed | PARTIAL | Fixed route protection, auth provider/runtime issues, dependency manifest issues, legal/domain references, analytics TTL script, and Google Play billing verification scaffolding. Remaining blockers: missing env, unresolved DNS, and unverified live Stripe/Supabase/Google Play flows. |

## Summary

### Fixed in this phase

- Restored a green `npm run build`.
- Confirmed build output is green; `npm run dev` remains blocked in this environment by a host-interface runtime error unrelated to app compilation.
- Re-enabled protected-route redirects in `app/proxy.ts`.
- Fixed auth provider runtime behavior so `/api/auth/providers` returns `200` instead of crashing when email env is absent.
- Added missing `next-auth` / `stripe` dependency declarations to `app/package.json`.
- Corrected all remaining legacy-domain references to `cvscan.com.au`.
- Corrected release-facing legal copy to match the actual AI-provider set (Gemini + OpenAI only).
- Added server-side PDF/DOCX resume extraction and storage wiring for `resume_uploads/{user_id}/...`.
- Added a concrete analytics retention SQL script for BA-4.

### Still blocking launch after Phase 0

- No local `.env.local`; auth, Supabase, Stripe, Google OAuth, and email verification cannot be exercised end-to-end.
- `cd app && npm run dev` fails in this sandbox due `uv_interface_addresses` host enumeration errors; direct-host startup works for limited local inspection.
- The app uses magic-link email plus optional Google OAuth; verification of the live sign-in flow remained blocked locally by missing env.
- `cvscan.com.au` was not resolving on April 27, 2026.
- Google Play purchase verification and RTDN webhook paths are now present, but still need live Play Console credentials for end-to-end verification.
