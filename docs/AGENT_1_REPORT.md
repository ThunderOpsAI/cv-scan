# Agent 1 Report: Restore Baseline and Gap Map

## 1. Executive Summary
A clear restoration baseline has been identified. The repository contains a fully working pre-beta MVP state immediately prior to the extensive removal of authentication, payments, and credit gating for the public beta. However, partial restorations will be required as newer feature work (OCR resume scanning, photo capture, and chatbot improvements) has been merged since the beta branch started and must be preserved.

## 2. Likely Last-Good Commit/Branch
- **Commit Hash:** `4c860537` 
- **Branch Name:** `origin/main` (was originally on `codex/nextauth-setup` prior to beta merge)
- **Commit Message:** `Update handover after live hotfix`
- **Why this is likely the correct baseline:** This is the immediate parent commit to `7799fe1b` (`feat(beta): strip all authentication and payments, open all features, update UI and docs for public beta`), which began the systematic dismantling of auth layers, session providers, and billing infrastructure.

## 3. Evidence Reviewed
- **Git commands run:** `git log --oneline -n 30`, `git log --graph --oneline -n 30`, `git log --stat 4c860537..HEAD`, `git show --name-only 7799fe1b`
- **Files inspected:** `docs/AGENT_HANDOVER.md`
- **Relevant commits compared:** `7799fe1b` (beta strip start), `6d85bb73` (mock session provider), `01c0f159` (OCR scanner feature added), `61ab8c83` (removed signup/cost restrictions UI), `4cefeb93` (bypassed backend credit checks), `89c09ba2` (replaced pricing pages).
- **Docs referenced:** `docs/AGENT_HANDOVER.md`

## 4. Placeholder Regression Map

| Area | Current Placeholder/Broken Behavior | Last-Good Behavior | Files Involved | Severity |
|---|---|---|---|---|
| Auth & NextAuth | Strict session validation is disabled/mocked; NextAuth setup stripped. | Proper token validation, NextAuth callbacks, email/pass + Google OAuth working. | `app/app/api/auth/[...nextauth]/route.ts`, `app/app/providers.tsx`, `app/app/auth/signin/page.tsx` | Critical |
| Password Reset / UI | Signin/Signup UI stripped or mocked with "return links for beta". | Functional authentication flows and reset capabilities. | `app/app/auth/signin/page.tsx`, `app/lib/auth/adapter.ts` | High |
| Protected Routes | Auth checks removed from almost all API routes (`job-packs`, `export`, `generate`, etc.). | API routes fetch session and return 401 if unauthorized. | `app/app/api/applications/route.ts`, `app/app/api/export/*`, `app/app/api/generate/*`, `app/app/api/job-packs/*`, `app/app/api/profile/*` | Critical |
| Stripe/Payment | Bypassed; webhook replaced, pricing/buy-credits pages removed or stubbed. | Stripe webhooks handle sub creation, pricing UI initiates checkout. | `app/app/api/stripe/webhook/route.ts`, `app/app/buy-credits/page.tsx`, `app/app/pricing/page.tsx` | Critical |
| Credits & Entitlements | Backend credit checks bypassed in route handlers. `app/lib/supabase/credits.ts` mocked. | Real deduction of credits per generation/scan using Supabase RPCs. | `app/lib/supabase/credits.ts`, `app/app/api/ats/scan/route.ts`, `app/app/api/copilot/chat/route.ts` | High |
| Premium Gating | Removed; all beta users have full access to pro tools. | Free vs Premium layout limits, restricted features. | `app/app/dashboard/page.tsx`, `app/app/dashboard/scanner/page.tsx` | High |
| Upload/Storage | Resume upload added *after* auth stripping, likely lacking strong user-scoped RLS validation. | Storage access scoped to authenticated users. | `app/app/api/resume/ocr/route.ts` | Critical |

## 5. Restoration Targets

| Restore Target | Source Commit/File | Current File | Restore Method | Risk |
|---|---|---|---|---|
| NextAuth Config | `4c860537` | `app/app/api/auth/[...nextauth]/route.ts` | Full file restore | Low |
| App Providers | `4c860537` | `app/app/providers.tsx` | Partial function restore (Remove mock session provider, restore real) | Low |
| Auth UI pages | `4c860537` | `app/app/auth/signin/page.tsx` | Full file restore | Low |
| Pricing / Buy Credits | `4c860537` | `app/app/buy-credits/page.tsx`, `app/app/pricing/page.tsx` | Full file restore | Low |
| Stripe Webhook | `4c860537` | `app/app/api/stripe/webhook/route.ts` | Full file restore | Low |
| Global Backend Route Auth | `4c860537` | `app/app/api/*` (various) | Partial function restore (Re-inject `getServerSession` checks) | Medium |
| Credit Deduction Logic | `4c860537` | `app/lib/supabase/credits.ts`, `app/app/api/generate/*` | Partial function restore | Medium |
| Database Schema/RLS | `4c860537` | `app/database/schema.sql` | Schema/migration review needed | High |

## 6. Files Not Safe for Blind Rollback
The following files and features were introduced *after* the MVP baseline and represent newer release work that must **not** be blindly overwritten:
- **Resume OCR / Scanner feature:** `app/app/api/resume/ocr/route.ts`, `app/app/dashboard/scanner/page.tsx`, `app/lib/applications/parseResume.ts`
- **Photo capture capabilities:** Added in commit `1a74ee5c`.
- **Chatbot / Jobsearch improvements:** `app/app/api/interview/chat/route.ts` (modified in `e9ac6d53` & `49baef2a`).
- **Playwright e2e tests:** `app/tests/beta-e2e.spec.ts`
- **Core Dependencies:** `app/package.json` and `package-lock.json` (specifically `tesseract.js` added for OCR).

## 7. Dependencies / Environment / Schema Notes
- **Env vars:** Ensure `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `STRIPE_SECRET_KEY`, and `STRIPE_WEBHOOK_SECRET` are restored to the environment variables.
- **Supabase RLS policies:** Need auditing; it's highly likely RLS policies were relaxed or schema changes bypassed row-level security for beta mock testing.
- **Package dependences:** NextAuth, Stripe, and any associated adapter dependencies should be verified. Do not remove `tesseract.js`.
- **OAuth callback URLs:** Need verification in Google Cloud Console for the production/beta domain.

## 8. Recommended Restore Order
1. **Agent 2:** Restore NextAuth server config (`app/app/api/auth/[...nextauth]/route.ts`) and Provider wrappers (`app/app/providers.tsx`).
2. **Agent 2:** Restore authentication UI and basic protected route wrapper (`getServerSession`).
3. **Agent 3:** Restore Stripe webhook and basic payment UI pages (`app/app/pricing/page.tsx`, `app/app/buy-credits/page.tsx`).
4. **Agent 3:** Re-introduce credit deduction logging into the core generation API routes without breaking the new chatbot/scanner payloads.
5. **Agent 2 & 3:** Apply protected route middlewares and premium gating to the UI components.
6. **Agent 4:** Review and secure the newly added OCR storage buckets and ensure RLS is correctly applied.

## 9. Blockers
- **None currently identified** that prevent beginning restoration, assuming the required environment variables are available.
- Need to ensure we don't accidentally release the app without reviewing data retention on the new OCR/photo capture uploads introduced post-MVP.

## 10. Assumptions
- The database schema on Supabase has not heavily drifted structurally from `4c860537`, only data/RLS logic.
- We still wish to use the original `next-auth` implementation rather than adopting a new Supabase SSR Auth strategy.
- Stripe is the current primary target for billing restoration on the web side; Play Billing integration is net-new work.

## 11. Definition of Done Result
**PASS** - The restore baseline (`4c860537`) and the gap map are clearly identified. Partial restoration rules are defined to protect newer beta functionality (OCR, Chatbot, Photo capture).
