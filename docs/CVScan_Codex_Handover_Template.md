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
- Payments: Stripe (one-time credit packs + subscriptions)
- AI: Gemini API
- Exports / workflows: app routes + supporting scripts/docs

---

## 2. Single source of truth

Before touching code, read the relevant docs.

### Mandatory rule
**`docs/Build_Spec*` is the single source of truth for implementation.**
If the handover, older docs, or code comments conflict with Build_Spec, **follow Build_Spec** and note the conflict at your next check-in.

### Read first, in this order
1. `docs/CVScan_Codex_Handover_Template.md` ← current session state and carry-forward instructions
2. `docs/CVScan_Build_Spec.md` ← single source of truth for implementation
3. Start the assigned task only after reading both files above

If a file is missing, continue with the available files and state what was missing.

---

## 3. Non-negotiables

- Never commit directly to `main` without team process
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
2. Read `docs/CVScan_Build_Spec.md` before starting any task.
3. Work in small increments.
4. When done, run the end-of-session checklist in this file exactly.

---

## 6. Current session state (UPDATE THIS EVERY SESSION)


### Current phase
- **Foundation (Phase 1)** — locally complete, including **1.4 analytics plumbing**. Analytics schema/code is local only until product owner approves applying SQL to Supabase.
- **Activation (Phase 2)** — locally complete (job fit, tailor, exports, onboarding).
- **Monetisation (Phase 3)** — locally complete (credits, ledger, Stripe, subscriptions, gating).
- **Trust (Phase 4, code-complete):**
  - All tailoring and cover letter generation endpoints audited and confirmed facts-only (grounded in approved profile facts; no invention of skills, roles, metrics, dates, education, credentials, or achievements).
  - Evidence tags are present and visible for all generated bullets and cover letters; gap/ungroundable signals are surfaced in the UI before export/save/use.
  - User-facing AI output disclosure is present on tailor, applications, and generation pages, and is visible before export/save/use.
  - Privacy and Terms pages are reviewed and align with Build Spec 4.2.
  - No generated career content can silently add unsupported factual claims; all relevant checks pass.
  - All Phase 4 Trust tasks (4.1–4.3) are complete and verified. See below for checklist.


### Phase 4 (Trust) Checklist (all complete)

1. Evidence tags always visible in all export/save flows
2. Gap/ungroundable signals surfaced everywhere generated content is reviewed/exported
3. User override/manual bullet labeling present and clear
4. In-product AI output disclosure present on all relevant pages, visible before export/save/use
5. Data deletion/export process implemented and documented
6. No generated content can be exported/sent without explicit user review
7. No credential inflation or unapproved degrees/certs in export
8. All touched flows pass typecheck/build/lint
9. Handover and Build Spec up to date

---

## Beta Branch Plan (April 2026)

**Goal:** Prepare a public/QA beta with authentication and payments stripped/disabled for open testing.

**Branch:** `beta/no-auth-payments` (from `codex/nextauth-setup`)

**Steps:**
1. Remove/disable all NextAuth logic (providers, session checks, sign-in/out, protected routes)
2. Remove/disable Stripe payment and subscription flows (API endpoints, UI, pricing, buy-credits)
3. Remove credit gating (all features open, or show “beta mode” banner)
4. Remove sign-in/out buttons, credit displays, pricing/buy-credits pages
5. Add “Beta – No Auth/Payments” banner to all pages
6. Update privacy/terms to reflect beta limitations
7. Update docs and README with beta instructions and limitations
8. Test beta build end-to-end (no auth, no payments, all flows open)

**How to merge fixes:**
- All bugfixes and improvements in beta should be merged back to `codex/nextauth-setup` before release.

**Snapshot:**
- Main branch: `codex/nextauth-setup` @ [commit hash]
- Beta branch: `beta/no-auth-payments` @ [commit hash]

---

## Next steps

1. Update Build Spec and README for beta/test mode
2. Create beta branch and strip auth/payments
3. Test beta build and document
4. Handover to product owner for QA

### Product owner checklist before main/live push

- [ ] All Trust 4.1–4.3 coding tasks above are complete and verified.
- [ ] Evidence tags and gap/ungroundable signals are visible in all relevant UI flows.
- [ ] User override/manual bullet labeling is present and clear.
- [ ] AI output disclosure is visible before any export/save/use of generated content, on all relevant pages.
- [ ] Data deletion and export process is implemented or documented.
- [ ] No generated content can be exported or sent without explicit user review.
- [ ] All touched flows pass focused typecheck/build/lint.
- [ ] Handover and Build Spec are up to date.

### Single SQL deploy file
- **`app/database/cvscan-full-schema.sql`** — concatenated canonical schema for greenfield or full replay. Sections: `schema.sql` (core, including `analytics_events`) → phase-0 → phase-1 → smart goals → career memory → phase-2 activation → phase-2 generated assets → phase-2 job packs/ATS → **phase-3-schema** (applications tracker) → NextAuth.
- **`app/database/phase-1-analytics.sql`** — incremental Phase 1.4 analytics delta if product owner chooses not to replay the full schema.
- Smaller `phase-*.sql` / `fix-*.sql` / `schema.sql` remain in repo for archaeology; **avoid applying both the monolith and the same fragments twice** on one database without checking for duplicate policies.

### Environment (billing)
- One-time credits: existing `STRIPE_SECRET_KEY`, webhook, checkout metadata.
- Subscriptions: **`STRIPE_PRICE_STARTER`**, **`STRIPE_PRICE_PRO`**, optional **`STRIPE_PRICE_ENTERPRISE`** (Stripe Price IDs). Webhook must receive **`checkout.session.completed`**, **`customer.subscription.updated`**, **`customer.subscription.deleted`**. Configure **Customer portal** in Stripe Dashboard for `/api/stripe/portal`.
- Optional **`STRIPE_LIVE_MODE`** — checkout/subscribe log warning when set outside production.

### Branch / commit
- Current checkout: **`codex/nextauth-setup`**.
- Current local HEAD: **`4c860537 Update handover after live hotfix`**.
- Current worktree: uncommitted Phase 1.4 analytics changes (do not push/commit unless product owner asks).
- Phase 2/3 work remains local on `codex/nextauth-setup` unless product owner explicitly asks to push it.
- Live `main` was hotfixed and pushed through **`8e4c6cae Configure Vercel to deploy app directory`**.
- The live mobile Copilot chat bug was fixed on `main` in **`6d5c6b87 Fix copilot mobile chat layout`** and cherry-picked into this phase branch as **`dbf67c98 Fix copilot mobile chat layout`**.
- The Vercel deploy fixes were also brought into this phase branch so the final effective deploy shape matches live: root `vercel.json` runs install/build inside `/app` and uses `app/.next` as output.

### Tests last run
- `./node_modules/.bin/tsc --noEmit` (in `/app`) — pass after Phase 1.4 analytics work.
- `npm run build` (in `/app`) with dummy env values — pass after Phase 1.4 analytics work.
- Root `npm run build` with dummy env values — pass after final Vercel config; it runs `cd app && npm run build`.
- Full-repo `npm run lint` — known pre-existing debt in legacy files; not used as gate unless touching those files.
- Targeted `npx eslint app/dashboard/copilot/page.tsx` — pass after Copilot mobile layout fix.
- Targeted `./node_modules/.bin/eslint lib/analytics.ts lib/analytics/server.ts` — pass.
- Touched-route ESLint with `@typescript-eslint/no-explicit-any` disabled — pass with only unused-disable warnings caused by that temporary rule override. Normal touched-route lint still reports pre-existing `no-explicit-any` debt in several legacy routes/helpers.

### Carry forward / not done
- Apply **`cvscan-full-schema.sql`** (or incremental deltas) to Supabase only when product owner approves.
- Apply **`phase-1-analytics.sql`** to Supabase only when product owner approves if using an incremental analytics rollout.
- **Phase 4 (Trust)** per Build Spec.
- **Product tuning:** which routes beyond interview should require `pro` / `enterprise`; monthly credit grants for subscribers (not implemented — ledger is separate from subscription today).
- **Pricing page** (`/pricing`) still describes credit-only UX; align copy with subscriptions when marketing is ready.
- `/dashboard/copilot` mobile layout was fixed and live deploy is green, but a real-phone/mobile-auth visual confirmation is still pending.
- Local untracked generated folder may appear as `app/test-results/`; it is Playwright/test output and has intentionally not been committed.

---

## 7. This session’s task block (REWRITE EACH SESSION)

### Completed (handoff snapshot)
- Verified Vercel production deploy from `main` commit **`8e4c6cae`**:
  - GitHub commit statuses show both Vercel contexts as `success`: `Vercel – cv-scan` and `Vercel – cv-scan-lyoj`.
  - `https://cv-scan.vercel.app` and `https://cv-scan-lyoj.vercel.app` both returned HTTP 200 from Vercel.
- Phase 1.4 analytics plumbing implemented locally:
  - Added `analytics_events` schema/RLS to `app/database/schema.sql`, `app/database/cvscan-full-schema.sql`, and incremental `app/database/phase-1-analytics.sql`.
  - Added server helper `app/lib/analytics/server.ts` with event taxonomy, PII-safe property sanitisation, `emitAnalyticsEvent`, and `logCriticalError`.
  - Added `docs/CVScan_Analytics.md` with taxonomy and funnel queries for signups, activations, and first purchases.
  - Instrumented signup, resume import, fact review, job fit, tailored bullets, cover letter generation, application save, interview prep, credit spend, credit purchase, and selected critical write/error paths.
  - Updated Supabase TypeScript types for `analytics_events` and stale Phase 3 user subscription fields.
- Phase 3.3: plan tier column + Stripe subscription checkout + portal + webhook lifecycle + interview API/UI gating.
- `app/database/cvscan-full-schema.sql` generated from existing fragments.
- Live hotfix branch flow completed:
  - Created hotfix branch from `origin/main`.
  - Fixed Copilot mobile chat layout so the page uses a viewport-contained flex layout, the message pane scrolls internally, and the input stays visible.
  - Pushed the Copilot fix to live `main`.
  - Cherry-picked the Copilot fix back into `codex/nextauth-setup`.
- Vercel deploy recovery completed:
  - Reproduced root install failure: Vercel was running from repo root while the real app lives in `/app`.
  - Added root package metadata for Vercel's Next detector.
  - Final corrected deploy config is root `vercel.json`: `cd app && npm install --legacy-peer-deps`, `cd app && npm run build`, output `app/.next`.
  - Removed the problematic root lockfile/output-copy approach; copying `app/.next` to root `.next` caused bad file tracing such as `/vercel/node_modules/client-only/index.js`.
  - Pushed final live deploy fix to `main` and cherry-picked equivalent fixes back into `codex/nextauth-setup`.
- Handover updated for the next agent.

### Suggested next
- Get product-owner approval before applying `app/database/phase-1-analytics.sql` or `app/database/cvscan-full-schema.sql` to Supabase.
- Confirm `/dashboard/copilot` mobile layout on a real phone or authenticated mobile viewport.
- Wire Stripe products/prices in test mode; run webhook smoke tests.
- Decide subscriber benefits (bonus credits vs feature flags) and document in Build Spec.
- Phase 4 trust work.

### Constraints
- Follow `docs/CVScan_Build_Spec.md`.
- No live Supabase/schema changes unless product owner approves.
- Do not switch off `codex/nextauth-setup` unless the product owner asks.
- Do not push phase 2/3 branch unless the product owner asks.

### Prompt for next agent

```text
You are taking over CVScan in /Users/thunderopsai/Documents/Workspace/01_Projects/cv-scan.

Read these first:
1. docs/CVScan_Codex_Handover_Template.md
2. docs/CVScan_Build_Spec.md

Current branch should be codex/nextauth-setup. Do not switch branches or push unless the product owner asks.

Current situation:
- Phase 1 foundation is locally complete, including Phase 1.4 analytics plumbing.
- Phase 2 activation is locally complete.
- Phase 3 monetisation is locally complete, including Stripe credit packs, credit ledger, subscription checkout/portal/webhook lifecycle, plan tier session exposure, and interview route gating.
- app/database/cvscan-full-schema.sql is the canonical full schema file, but do not apply it to Supabase without product owner approval.
- app/database/phase-1-analytics.sql is available as the incremental analytics delta, but do not apply it to Supabase without product owner approval.
- A live-site hotfix was done during the previous session:
  - Copilot mobile chat layout was fixed on live main and cherry-picked back into this branch.
  - Vercel deployment was repaired on live main and cherry-picked back into this branch.
  - Final deploy shape: root vercel.json installs/builds inside app and uses outputDirectory app/.next.

Before coding:
- Run git status --short --branch and confirm you are on codex/nextauth-setup.
- Treat app/test-results/ as generated local test output if present; do not commit it.
- Full npm run lint has known pre-existing repo-wide debt. Use focused lint/type/build checks for touched areas unless asked to clean lint debt.

Recommended next work:
- Vercel production deploy from main is confirmed green at commit 8e4c6cae via GitHub Vercel statuses and HTTP 200 host checks.
- Next continue with either Supabase analytics SQL rollout (only with product-owner approval), Stripe test-mode smoke testing, or Phase 4 trust work per docs/CVScan_Build_Spec.md.
```

---

## 8. Definition of done

A task is not done unless:
- the requested code changes are implemented
- affected flows have been manually checked where feasible
- relevant tests pass, or the lack of tests is explicitly stated
- no secret leakage exists
- no obvious placeholder/stub code remains without a `TODO`
- the result aligns with Build Spec
- the product owner has been checked in with when required

---

## 9. End-of-session checklist

### Verify the work
- [ ] Relevant tests pass
- [ ] No hardcoded secrets or API keys
- [ ] No accidental schema, auth, or billing regressions
- [ ] Work aligns with Build Spec

### Update this file
Rewrite **Current session state** and **This session’s task block**.

### Commit / push
Use team branch naming; push only when approved.

---

## 10. Quick reference

### Priority levels
| Level | Meaning |
|---|---|
| P0 | Blocker / must complete now |
| P1 | Important |
| P2 | Nice to have |

### If docs conflict
1. Follow `docs/CVScan_Build_Spec.md`
2. Record the conflict
3. Raise it in product-owner check-in
