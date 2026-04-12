# CVScan — Codex Handover Template

> Use this as the single handover file for every new Codex / AI coding session on **CVScan**.
> Paste the relevant sections into the next session when needed, then update this file at the end of each working block.
> Keep it factual. Keep it current. Do not let it drift.

---

## 1. Project context

You are a senior full-stack developer working on **CVScan** — an AI-powered job-search assistant for candidates.

CVScan helps users:
- improve resumes
- tailor applications to specific jobs
- generate cover letters
- scan job descriptions for ATS fit
- discover jobs
- track applications
- prepare for interviews
- manage their job-search workflow in one place

CVScan is **not**:
- a recruiter or staffing agency
- a tool for fabricating experience, metrics, or credentials
- an autonomous deceptive auto-apply bot
- a substitute for user approval on factual career content

### Strategic intent
CVScan should evolve from a bundle of AI utilities into a **candidate operating system**:
- evidence-backed career memory
- job fit decisioning
- tailored application generation
- application tracking and follow-up
- interview prep and coaching
- persistent workflow and career guidance

### Repository layout
- Project root: `cv-scan`
- Runnable app: `/app`
- Docs: `/docs`
- Other important folders: `/contracts`, `/agents`, `/data`, `/scripts`
- Project memory files: `tasks.json`, `decisions.json`, `patterns.json`

### Core stack
- Frontend: Next.js App Router, React, TypeScript, Tailwind
- Backend: Next.js server actions / route handlers
- Auth: NextAuth
- Database: Supabase Postgres
- Payments: Stripe
- AI: Gemini API
- Exports / workflows: app routes + supporting scripts/docs

---

## 2. Single source of truth

Before touching code, read the relevant docs.

### Mandatory rule
**`docs/Build_Spec*` is the single source of truth for implementation.**
If the handover, older docs, or code comments conflict with Build_Spec, **follow Build_Spec** and note the conflict in your check-in.

### Read first, in this order
1. `docs/CVScan_Codex_Handover_Template.md` ← current session state and carry-forward instructions
2. `docs/Build_Spec*` ← single source of truth for implementation
3. Start the assigned task only after reading both files above
4. `docs/PRD.md`
5. `docs/SRS.md`
6. `docs/MVP_BLUEPRINT.md`
7. `docs/architecture.md`
8. `docs/BUILD.md`
9. `docs/BUSINESS_PLAN_AND_DECISION_MATRIX.md`
10. `docs/Automated_App_Monetization_Plan.md`
11. `docs/readiness_assessment.md`

If a file is missing, continue with the available files and state what was missing.

---

## 3. Non-negotiables

- Never commit directly to `main`
- Always branch first using `codex/[short-description]`
- Never fabricate user achievements, skills, dates, metrics, responsibilities, or credentials
- Ground generated output in user-approved profile facts whenever possible
- Keep credit, billing, and ledger-related writes safe and auditable
- Keep database writes idempotent where repeated execution is possible
- Protect authenticated routes and user data boundaries
- Do not hardcode secrets, API keys, or environment values
- Keep changes small, reviewable, and reversible
- At the end of every session: clean repo, update this file, and report exact status

---

## 4. Product and engineering principles

1. **Trust first** — candidate data is sensitive and AI must not invent facts.
2. **Outcome over output** — the product exists to improve job-search outcomes, not just generate text.
3. **One workflow, not loose tools** — features should reinforce a guided end-to-end flow.
4. **Memory compounds value** — repeated manual input is product failure.
5. **Human approval matters** — critical outputs must stay reviewable.
6. **Build for retention, not novelty** — prioritize workflows users return to weekly.

---

## 5. Working rules for the agent

1. Read the current session state in this handover file before changing code.
2. Read `docs/Build_Spec*` before starting any task.
3. Start the assigned task only after reading both files above.
4. Create a branch from `main` before making changes.
5. Work in small increments.
6. Stop after each task and check in with the product owner.
7. Do not continue to the next task without confirmation.
8. When done, run the end-of-session checklist in this file exactly.

---

## 6. Current session state (UPDATE THIS EVERY SESSION)

### Current phase
- Foundation — Phase 1 complete locally.
- Activation — **Phase 2 implemented locally** (jobs, fit analyses, tailored generation + `generated_assets`, export APIs, follow-up draft, onboarding). **Apply local SQL to Supabase** before exercising end-to-end against a real database.

### Branch worked on
- `codex/nextauth-setup`

### Latest commit
- Branch `codex/nextauth-setup`: Phase 1 work committed locally; Phase 2.1 job-fit slice committed after implementation (no push unless product owner approves).

### Test result
- Passed: `npx tsc --noEmit`
- Passed: `npx eslint` on Phase 1.2 P1 files: `app/api/profile/facts/route.ts`, `app/api/profile/facts/[id]/route.ts`, `app/dashboard/profile/facts/page.tsx`
- Failed as expected / carry-forward: full-repo `npm run lint` still reports pre-existing debt in legacy routes and libs; not used as gate for this work.
- Passed: `npm run build`
- Passed: `CI=1 npx playwright test --workers=1` — 3 passed (`playwright.config.ts` now starts `npm run dev` via `webServer` when `CI` is set so tests do not rely on a manually started server).
- Full `npm run lint` still has broad pre-existing lint debt in unrelated files and was not used as the acceptance gate for this scoped work.

### What was completed
- Completed Build Spec Phase 1.1 Task 1 — NextAuth setup (P0).
- Hardened `authOptions` for Google OAuth and Resend email magic links, explicit JWT session max age, secure production cookies, and production-only requirement for a real `NEXTAUTH_SECRET`.
- Updated sign-in UI to check configured NextAuth providers before starting email or Google sign-in and to show a clear unavailable state when providers are missing.
- Removed raw email/provider account identifiers from adapter debug logs.
- Locked `/api/debug/auth-check` out of production and changed dev output to set/missing flags only.
- Aligned `app/database/next-auth-supabase-schema.sql` with the adapter's lowercase NextAuth column names and added safe normalization for older quoted camelCase columns.
- Completed Build Spec Phase 1.1 Task 2 — Protected routes (P0).
- Added Next.js 16 `app/proxy.ts` guard for authenticated page routes: `/dashboard/:path*`, `/buy-credits`, and `/generate/:path*`.
- Added shared auth environment constants in `app/lib/auth/env.ts` so NextAuth and the proxy use the same session cookie name and non-production secret.
- Expanded Playwright smoke coverage to verify guest redirects for `/dashboard`, `/buy-credits`, and `/generate/bullets`.
- Installed `agent-browser` 0.25.3 globally and as an app dev dependency. Future agents can use either `agent-browser ...` or `npx agent-browser ...` from `/app`.
- Completed Build Spec Phase 1.1 Task 3 — User isolation (P0), local only.
- Added `app/lib/supabase/user-scope.ts` to resolve user-owned profile, experience, and bullet scopes before child-row reads/writes.
- Hardened high-risk user data routes so profile child updates/deletes, bullet reads/creates, metric mining, copilot conversations, applications, stages, generated emails, job pack updates, and saved search updates are tied back to `session.user.id` or a user-owned parent.
- Removed raw request-body spreading from touched update routes where it could have allowed protected foreign keys such as `user_id`, `profile_id`, `experience_id`, `application_id`, or `job_pack_id` to be reassigned.
- Switched the cover-letter generation route from token-email identity lookup to `getServerSession(authOptions)` and `session.user.id` for generation reads/writes/deletes.
- Tightened Stripe checkout auth to require both `session.user.id` and `session.user.email` before writing checkout metadata.
- Updated auth session hydration to prefer `token.sub`/user id over email lookup.
- Enabled RLS locally for public-schema NextAuth `accounts`, `sessions`, and `verification_tokens` tables.
- Completed Build Spec Phase 1.1 Task 4 — Consent surface (P1), local only.
- Added local SQL/type support for `users.terms_accepted_at`, `users.privacy_accepted_at`, and `users.consent_version`.
- Added `app/lib/auth/consent.ts` and record consent timestamps through adapter user creation and successful sign-in.
- Updated sign-in consent copy to link directly to `/terms` and `/privacy`.
- Completed Build Spec Phase 1.1 Task 5 — Auth error states (P1).
- Sign-in now surfaces provider configuration gaps, magic-link verification requests, expired/protected-route callbacks, and NextAuth error query states.
- Expanded `/auth/error` to cover common OAuth/email/session failure codes with user-facing recovery copy.
- Updated Playwright consent smoke test for the new Terms/Privacy label.
- Completed Build Spec Phase 1.2 P0 — Career profile and memory schema, local only.
- Added local SQL for `profile_facts` and `resume_versions` in `app/database/phase-1-career-memory.sql` and updated `app/database/schema.sql`.
- `profile_facts` fields match Build Spec P0: `fact_id`, `user_id`, `fact_type`, `fact_text`, `is_approved`, `source`, `created_at`, `updated_at`; RLS policies are user-scoped and insert/update policies require approved facts for authenticated clients.
- `resume_versions` fields match Build Spec P0: `version_id`, `user_id`, `raw_content`, `tailored_content`, `label`, `created_at`; RLS policies are user-scoped.
- Added `app/lib/profile/facts.ts` for fact validation, prompt formatting, approved fact IDs, Gemini extraction, JSON parsing, and deterministic line-based fallback extraction.
- Added authenticated `POST /api/profile/resume-import`: saves one `resume_versions` row, extracts candidate facts, and returns candidates for review without storing them in `profile_facts`.
- Added authenticated `GET/POST /api/profile/facts`: `GET` returns approved facts only; `POST` stores approved facts only, enforces valid fact types/sources, sets `is_approved: true`, and skips duplicate approved facts.
- Added `/dashboard/profile/facts` Career Memory UI with paste/upload resume import, extracted fact review, edit/type controls, approve/reject controls, and clear "not approved = not used" messaging.
- Added a Career Memory link from `/dashboard/profile`.
- Reworked `app/lib/ats/profile-loader.ts` so candidate claim material for ATS/tailoring is loaded from approved `profile_facts` only. Legacy `profiles` contact fields may still supply name/headline/contact, but legacy experiences/skills/education/stories are no longer used as generation evidence.
- Updated ATS scanner, job pack creation, job discovery matching, copilot context, standalone bullet generation, and standalone cover-letter generation to use approved facts where candidate-specific claims are involved.
- Removed the raw pasted resume requirement from standalone cover-letter generation; the route now requires approved facts and a job description.
- Updated bullet generation to treat the user-entered focus as guidance only, not evidence, and removed metric estimation language.
- Added anti-fabrication guardrails to ATS/tailoring/cover-letter/bullet/metric-mining prompts: no invented achievements, skills, dates, metrics, responsibilities, titles, companies, education, certifications, or credentials; unsupported job requirements should be surfaced as gaps or requests to add/approve facts.
- Completed Build Spec Phase 1.2 P1 — Profile editing (manual add / edit / delete / `is_approved`), local only.
- `GET /api/profile/facts` defaults to approved facts only; `GET /api/profile/facts?scope=all` returns every stored fact for the Career Memory management UI (ordered by `updated_at` desc).
- `PATCH /api/profile/facts/[id]` updates `fact_type`, `fact_text`, and/or `is_approved` with user scope, duplicate detection (case-insensitive type+text vs other rows), and UUID validation.
- `DELETE /api/profile/facts/[id]` removes a fact with user scope.
- `/dashboard/profile/facts`: manual add form (POST with `source: manual`), full list with edit (inline), pause/resume generation (`is_approved`), and delete; sidebar shows “Active in generation” count.
- Local SQL (`app/database/phase-1-career-memory.sql` and `app/database/schema.sql`): `profile_facts` **UPDATE** RLS `WITH CHECK` relaxed from `(is_approved = TRUE)` to user id only so policies match toggling approval when Supabase auth is used against RLS. Re-apply or alter the policy on any environment that already ran the older version.
- **Phase 2 — Activation (local):**
  - **2.1** `jobs`, `fit_analyses` (`phase-2-activation.sql` + `schema.sql`); fit APIs; `/dashboard/job-fit` with verdict UI, fit history list, primary CTA to `/dashboard/tailor/[jobId]`; `lib/fit/analyze.ts`.
  - **2.2** `generated_assets` + `users.career_path` / `onboarding_completed_at` (`phase-2-generated-assets-onboarding.sql` + `schema.sql`); `POST/GET /api/generated-assets`, `DELETE /api/generated-assets/[assetId]`; job-scoped `POST .../generate/bullets` (1 cr) and `.../generate/cover-letter` (2 cr); `lib/generation/tailored-bullets.ts`, `cover-letter-evidence.ts`, `follow-up-draft.ts`; `/dashboard/tailor/[jobId]` — diff-style bullet table, accept/reject, explicit save only; cover letter edit + evidence; follow-up via `POST /api/generate/follow-up` (1 cr).
  - **2.3** `POST /api/export/pdf`, `/api/export/docx`, `/api/export/pack` (zip via JSZip); client copy + `.txt` downloads on tailor page.
  - **2.4** `GET/PATCH /api/onboarding`; `/dashboard/onboarding` (5-step progress, skip-friendly); dashboard “Activation checklist” card; first-value messaging on tailor (`?fromFit=1`).

### What was not completed / carry forward
- Supabase SQL was not run against a live database in this session; SQL files were updated only.
- The new Phase 1.2 SQL has not been applied anywhere. Runtime import/fact routes require `profile_facts` and `resume_versions` to exist before they can work against a real Supabase database.
- Runtime still uses the Supabase service-role server client, so route-level ownership checks are the local enforcement layer while RLS policies are documented in SQL. Live RLS behavior still needs verification after applying SQL to Supabase.
- Resume upload is implemented as browser text extraction via `File.text()` plus paste support. True PDF/DOCX parsing is not implemented yet.
- Phase 1.2 P2 profile completeness updates for approved facts are not built yet.
- SQL files to apply (in order): `phase-1-career-memory.sql`, `phase-2-activation.sql`, `phase-2-generated-assets-onboarding.sql`, or reconcile from merged `schema.sql`.
- `users.career_path` and `users.onboarding_completed_at` require the Phase 2 onboarding migration; `generated_assets` requires the same batch.
- Full repo lint cleanup remains separate work because failures are broad and pre-existing.
- Do not commit/push or apply live Supabase SQL until product owner asks.
- Next product work should proceed only after product owner confirmation.

### Current product / technical truth
- Auth supports Google OAuth when `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are present, and email magic links through Resend when `RESEND_API_KEY` is present.
- Production auth should provide `NEXTAUTH_SECRET` and `NEXTAUTH_URL`; non-production uses a stable development-only fallback secret if `NEXTAUTH_SECRET` is absent.
- Sign-in page uses NextAuth provider discovery and will not silently attempt a missing provider.
- Sign-in page requires Terms/Privacy consent before starting Google or email sign-in and records consent timestamps in `users` after the account exists.
- Auth error and protected-route/session-required states now surface clear user-facing messages.
- Protected page routes now redirect guests to `/auth/signin?callbackUrl=...` before page client code renders.
- Protected APIs still use route-level 401 checks; the proxy intentionally does not match `/api/*` so public callbacks such as Stripe webhooks are not redirected.
- NextAuth adapter expects public schema columns: `accounts.userid`, `accounts.provideraccountid`, `sessions.userid`, and `sessions.sessiontoken`.
- Local SQL now expects `users.terms_accepted_at`, `users.privacy_accepted_at`, and `users.consent_version`.
- Local SQL now also expects `profile_facts` and `resume_versions` for Phase 1.2 memory/import flows.
- Candidate facts extracted from resumes stay transient until the user approves them. Rejected/pending facts are not written to `profile_facts`.
- Generation and fit-related candidate claims should use approved profile facts. If no approved facts exist, standalone bullet generation, standalone cover-letter generation, ATS scans, and job packs now return a user-facing setup error instead of using raw resume claims.
- `GEMINI_API_KEY` is still required for AI generation. Resume import extraction degrades to deterministic local line extraction if Gemini extraction fails or is unavailable, but bullet/cover-letter/tailoring generation still require Gemini.
- The old docs listed in the template (`PRD.md`, `SRS.md`, `MVP_BLUEPRINT.md`, etc.) are currently deleted in the worktree and replaced by `docs/CVScan_Build_Spec.md`, `docs/CVScan_PRD.docx`, and `docs/CVScan_SRS.docx`.

### Known blockers
- Full repo `npm run lint` fails on unrelated existing lint debt.
- Live Phase 1.2 cannot be exercised until the new SQL is applied to Supabase and verified.
- Live auth cannot be fully exercised until Supabase, Google OAuth, Resend, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL` are configured in the target environment.

### Product owner decisions
- Product owner answered: keep everything local for now.
- Do not commit/push this branch yet.
- Do not apply updated Supabase SQL to the live Supabase project yet.
- Phase 1.2 P0 and P1 are complete locally; ask before starting Phase 1.2 P2 or Phase 1.3.

---

## 7. This session’s task block (REWRITE EACH SESSION)

### Completed this session (Phase 1.2 P1 — profile-fact management)
- API: `GET /api/profile/facts?scope=all` for full fact list; `PATCH` / `DELETE` on `/api/profile/facts/[id]`.
- UI: manual add, inline edit (including “Use in generation”), pause/resume, delete on `/dashboard/profile/facts`.
- SQL: `profile_facts` UPDATE policy `WITH CHECK` allows approval toggles (aligns RLS with Build Spec when JWT clients are used).
- Playwright: `webServer` in `playwright.config.ts` so `CI=1 npx playwright test` self-starts the dev server.

### Recommended next (product owner to confirm)
- Apply local SQL to Supabase when ready: `phase-1-career-memory.sql`, then `phase-2-activation.sql` (or merged `schema.sql` sections), and verify RLS.
- Continue Phase 2: `generated_assets` + evidence-tagged tailoring (2.2), export (2.3), onboarding (2.4); Phase 1.3 credit ledger remains a foundation dependency for production-grade debits.

### Constraints
- Follow `docs/CVScan_Build_Spec.md` over conflicting handover notes.
- No commit/push/live SQL unless product owner explicitly approves.
- Do not fabricate career content; generation stays grounded in approved facts only.

### Notes for the developer
- New file: `app/app/api/profile/facts/[id]/route.ts`.
- Touch `playwright.config.ts` if E2E must run without a manual dev server (use `CI=1` for a fresh server per run).
- Apply `app/database/phase-1-career-memory.sql` (or reconcile `schema.sql`) to Supabase only after product owner approval; if an older UPDATE policy was applied, replace it with the version that does not require `is_approved = TRUE` in `WITH CHECK`.

---

## 8. Definition of done

A task is not done unless:
- the requested code changes are implemented
- affected flows have been manually checked
- relevant tests pass, or the lack of tests is explicitly stated
- no secret leakage exists
- no obvious placeholder/stub code remains without a `TODO`
- the result aligns with `docs/Build_Spec*`
- the product owner has been checked in with

---

## 9. End-of-session checklist

### Verify the work
- [ ] Relevant tests pass
- [ ] No hardcoded secrets or API keys
- [ ] No accidental schema, auth, or billing regressions
- [ ] No placeholder logic left without clear `TODO`
- [ ] Any migration or env requirement is documented
- [ ] Work aligns with `docs/Build_Spec*`

### Clean the repo
- [ ] Remove temp/debug/scratch files
- [ ] Confirm `git status` is clean except intended changes

### Commit and push
```bash
git checkout -b codex/[short-description]
git add .
git commit -m "[codex] short description of completed work"
git push origin codex/[short-description]
```

### Check in with product owner
Report:
- what was completed
- what was not completed
- blockers
- decisions needed
- recommended next task

Wait for instruction before continuing.

### If approved to merge
```bash
git checkout main
git pull origin main
git merge codex/[short-description]
git push origin main
git branch -d codex/[short-description]
```

### Update this file before closing
Rewrite:
- **Current session state**
- **This session’s task block**

Keep it accurate for the next session.

### Commit the updated handover
```bash
git add docs/CODEX_HANDOVER.md
git commit -m "[codex] update cvscan handover"
git push origin main
```

---

## 10. Quick reference

### Branch naming
| Situation | Branch format |
|---|---|
| New feature | `codex/feature-short-name` |
| Bug fix | `codex/fix-short-description` |
| Trust / compliance | `codex/compliance-short-name` |
| Ops / infra | `codex/ops-short-description` |
| UX / onboarding | `codex/ux-short-description` |

### Priority levels
| Level | Meaning |
|---|---|
| P0 | Blocker / must complete now |
| P1 | Important |
| P2 | Nice to have |

### If docs conflict
1. Follow `docs/Build_Spec*`
2. Record the conflict
3. Raise it in product-owner check-in
