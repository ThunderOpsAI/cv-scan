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
- **Foundation (Phase 1)** — locally complete except optional 1.4 analytics.
- **Activation (Phase 2)** — locally complete (job fit, tailor, exports, onboarding).
- **Monetisation (Phase 3)** — locally complete:
  - **3.1–3.2:** `credit_ledger`, idempotent debits/purchases, credit packages, webhook for one-time checkout, purchase history API, cost map (`docs/CVScan_Credit_Costs.md`), spend hints, low-balance banner.
  - **3.3 Subscriptions:** `users.plan_tier` (`free` | `starter` | `pro` | `enterprise`), `stripe_subscription_id`, `stripe_subscription_status`; `POST /api/stripe/subscribe` (Checkout `mode: subscription`); `POST /api/stripe/portal` (billing portal); webhook branches for `checkout.session.completed` (payment vs subscription), `customer.subscription.updated`, `customer.subscription.deleted`; session exposes `planTier`. **Server-side gate:** `POST /api/interview/chat` requires `plan_tier` ≥ **starter** (credits alone do not unlock). UI copy on `/dashboard/interview` and `/buy-credits`.

### Single SQL deploy file
- **`app/database/cvscan-full-schema.sql`** — concatenated canonical schema for greenfield or full replay. Sections: `schema.sql` (core) → phase-0 → phase-1 → smart goals → career memory → phase-2 activation → phase-2 generated assets → phase-2 job packs/ATS → **phase-3-schema** (applications tracker) → NextAuth.
- Smaller `phase-*.sql` / `fix-*.sql` / `schema.sql` remain in repo for archaeology; **avoid applying both the monolith and the same fragments twice** on one database without checking for duplicate policies.

### Environment (billing)
- One-time credits: existing `STRIPE_SECRET_KEY`, webhook, checkout metadata.
- Subscriptions: **`STRIPE_PRICE_STARTER`**, **`STRIPE_PRICE_PRO`**, optional **`STRIPE_PRICE_ENTERPRISE`** (Stripe Price IDs). Webhook must receive **`checkout.session.completed`**, **`customer.subscription.updated`**, **`customer.subscription.deleted`**. Configure **Customer portal** in Stripe Dashboard for `/api/stripe/portal`.
- Optional **`STRIPE_LIVE_MODE`** — checkout/subscribe log warning when set outside production.

### Branch / commit
- Latest work committed **locally** with message covering Phase 3.3 + merged SQL; **not pushed** (per product owner).

### Tests last run
- `npx tsc --noEmit` (in `/app`) — pass
- `npm run build` — pass
- Full-repo `npm run lint` — known pre-existing debt in legacy files; not used as gate unless touching those files.

### Carry forward / not done
- Apply **`cvscan-full-schema.sql`** (or incremental deltas) to Supabase only when product owner approves.
- **Phase 4 (Trust)** and **Phase 1.4 (analytics)** per Build Spec.
- **Product tuning:** which routes beyond interview should require `pro` / `enterprise`; monthly credit grants for subscribers (not implemented — ledger is separate from subscription today).
- **Pricing page** (`/pricing`) still describes credit-only UX; align copy with subscriptions when marketing is ready.

---

## 7. This session’s task block (REWRITE EACH SESSION)

### Completed (handoff snapshot)
- Phase 3.3: plan tier column + Stripe subscription checkout + portal + webhook lifecycle + interview API/UI gating.
- `app/database/cvscan-full-schema.sql` generated from existing fragments.
- Handover reset for the next agent.

### Suggested next
- Wire Stripe products/prices in test mode; run webhook smoke tests.
- Decide subscriber benefits (bonus credits vs feature flags) and document in Build Spec.
- Phase 4 trust work or analytics plumbing.

### Constraints
- Follow `docs/CVScan_Build_Spec.md`.
- No push / no live Supabase unless product owner approves.

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
