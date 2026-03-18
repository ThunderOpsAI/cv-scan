# CVScan - Updated Readiness Assessment
> **Prepared:** 17 Mar 2026 | **Context:** Post-task refresh before API onboarding

---

## Overall Call

**Current readiness: 8.1 / 10**

CVScan is now materially closer to demo-ready than the previous assessment suggested. The messaging, pricing, trust/compliance surfaces, consent gate, pricing route, export flow, interview practice feature, and job aggregation scaffolding are all present in the repo. The biggest remaining blocker is no longer product shape or missing pages. It is **environment and API configuration**, followed by one remaining UX polish item: the unfinished loading skeleton work.

If we enter the required keys cleanly and verify the happy path, this is in good shape for a guided walkthrough.

---

## What Is Clearly Done

### Product and positioning
- Homepage/pricing/trust/legal surfaces now exist in the app.
- Dedicated pricing page exists at `app/pricing/page.tsx`.
- Trust, privacy, and terms pages exist at `app/trust/page.tsx`, `app/privacy/page.tsx`, and `app/terms/page.tsx`.

### Risk and compliance basics
- Signup now includes an explicit consent checkbox in `app/auth/signin/page.tsx`.
- AI review language is present in the trust/legal pages, which is a clear improvement over the prior assessment.

### "Do later" feature work now landed
- Job aggregation route is implemented at `app/api/jobs/discover/route.ts`.
- Export to PDF/DOCX exists at `app/api/job-packs/[id]/export/[format]/route.ts`.
- Interview practice exists at `app/dashboard/interview/page.tsx` and `app/api/interview/chat/route.ts`.

### Platform breadth
- The app now tells a much more complete "score, tailor, track, and coach" story than before.
- From a repo review alone, the product narrative is now coherent enough for a partner walkthrough.

---

## What Still Blocks True Readiness

### 1. API and environment configuration is now the main blocker
The job aggregator and several core product flows depend on env vars that are not checked into the repo. Until those are added locally/Vercel, we should assume some routes will fail or partially degrade.

**Highest-priority keys for the next walkthrough:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GEMINI_API_KEY`
- `ADZUNA_APP_ID`
- `ADZUNA_API_KEY`
- `RAPIDAPI_KEY`

**Needed only if we want the full payments/email story live as well:**
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `EMAIL_FROM`

### 2. One checklist item still appears incomplete
The earlier task list still has **loading skeletons** unchecked. Repo search also shows many pages still render a simple `Loading...` state rather than skeleton UI. This is not a launch blocker for internal testing, but it is still unfinished presentation polish.

### 3. Verification is not complete yet
I attempted a production build, but this machine does not currently have the project dependencies installed, so `next build` could not run. That means the current readiness score is based on repo inspection plus route/file verification, not a clean local build.

### 4. API setup docs were stale
The aggregator docs previously referenced Jooble and `ADZUNA_APP_KEY`, but the implementation currently uses:
- Adzuna with `ADZUNA_APP_ID` + `ADZUNA_API_KEY`
- JSearch via RapidAPI with `RAPIDAPI_KEY`
- RemoteOK without a required key

That mismatch is now corrected in the supporting API note.

---

## Readiness by Area

| Area | Status | Notes |
|------|--------|-------|
| Core ATS scanner | Ready pending envs | Gemini key still required for real scans |
| Job packs and exports | Ready pending envs | Export route exists; needs live data to confirm end-to-end |
| Application tracking | Ready | Core pages and APIs are present |
| Job aggregation | Structurally ready, config-blocked | Providers are wired, keys still needed |
| Interview practice | Structurally ready, config-blocked | Depends on Gemini and user/session flow |
| Trust/compliance story | Ready for walkthrough | Much stronger than before |
| Pricing/messaging consistency | Ready | Dedicated pricing route now exists |
| UX polish | Partially ready | Loading skeletons still outstanding |
| Build verification | Not yet verified locally | Dependencies not installed on this machine |

---

## Practical Recommendation

**Yes, this is ready for the next step: API onboarding.**

The repo no longer looks blocked by missing product work. It now looks blocked by configuration. The smartest sequence from here is:

1. Add the minimum auth/database/AI keys first.
2. Add the job provider keys next.
3. Smoke-test sign-in, scanner, job discovery, and interview chat.
4. Only then decide whether we need to spend time on Stripe/Resend before the next demo.

---

## Immediate Next Step

When we start entering APIs, use this order:

1. Supabase
2. NextAuth + Google OAuth
3. Gemini
4. Adzuna
5. RapidAPI / JSearch
6. Stripe
7. Resend

That order unlocks the most product surface with the least wasted setup work.
