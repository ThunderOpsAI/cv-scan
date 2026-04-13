# CVScan — Build Spec

> **This is the single source of truth for all implementation work.**
> If this document conflicts with PRD.md, SRS.md, or the handover file, follow this document and note the conflict at your next check-in.
> Do not fabricate user achievements, skills, dates, metrics, or credentials. Ground all generated output in user-approved profile facts.

---

## Document structure

- [Phase overview](#phase-overview)
- [Foundation — Phase 1](#foundation--phase-1)
- [Activation — Phase 2](#activation--phase-2)
- [Monetisation — Phase 3](#monetisation--phase-3)
- [Trust — Phase 4](#trust--phase-4)
- [Retention — Phase 5](#retention--phase-5)
- [Extension — Phase 6](#extension--phase-6)
- [Schema reference](#schema-reference)
- [Non-functional requirements](#non-functional-requirements)
- [Explicit non-goals](#explicit-non-goals)

---

## Phase overview

| Phase | Name | Goal | Horizon |
|---|---|---|---|
| 1 | Foundation | Auth, profile, data model, credits wired correctly | 0–6 weeks |
| 2 | Activation | Core job-fit → tailor → export workflow complete | 6–10 weeks |
| 3 | Monetisation | Stripe packages, credit spending, billing auditable | 10–14 weeks |
| 4 | Trust | Grounded generation, legal surfaces, disclosures | 14–18 weeks |
| 5 | Retention | Tracker CRM, follow-ups, weekly workflow hooks | 18–24 weeks |
| 6 | Extension | Browser extension, interview stack, early B2B layer | 24+ weeks |

**Priority legend**

| Level | Meaning |
|---|---|
| P0 | Blocker — must complete before phase is done |
| P1 | Important — phase is not shippable without this |
| P2 | Nice to have — include if phase P0/P1 are clean |

---

## Foundation — Phase 1

**Goal:** A working, secure, data-isolated app with correct auth, a canonical career profile schema, an auditable credit ledger, and analytics event plumbing. Nothing else is stable until these are solid.

### 1.1 Authentication

| Task | Detail / Acceptance Criteria | Priority |
|---|---|---|
| NextAuth setup | NextAuth wired with at least email and Google providers. Session tokens secure. No credential leakage in client bundles. | P0 |
| Protected routes | All authenticated pages reject unauthenticated requests with redirect to sign-in. Middleware approach preferred — not per-page if/else. | P0 |
| User isolation | Every Supabase query scoped to the authenticated user. RLS policies enforced. No cross-user data access possible. | P0 |
| Consent surface | Terms of service and privacy policy acknowledgement captured at signup. Timestamp stored in DB. | P1 |
| Auth error states | Sign-in errors, session expiry, and OAuth failures surface clearly to the user. No silent failures. | P1 |

### 1.2 Career profile and memory schema

This is the highest-leverage foundation investment. Every generation, fit scan, and coaching workflow should eventually draw from approved profile facts, not from user-pasted raw text on each use.

| Task | Detail / Acceptance Criteria | Priority |
|---|---|---|
| Profile facts table | `profile_facts` table: fact_id, user_id, fact_type (work_history / education / skill / achievement / metric / goal), fact_text, is_approved, source (manual / extracted), created_at, updated_at. RLS: user-scoped. | P0 |
| Resume versions table | `resume_versions`: version_id, user_id, raw_content, tailored_content, label, created_at. One row per version. | P0 |
| Resume import flow | User can paste or upload resume content. System extracts candidate facts (work history, education, skills, achievements). Extracted facts shown to user for review before storing. | P0 |
| Fact review UI | User sees each extracted fact with approve / edit / reject controls. Only approved facts enter `profile_facts`. Clear "not approved = not used" messaging. | P0 |
| Profile editing | User can manually add, edit, or delete profile facts at any time. Changes update `is_approved` state. | P1 |
| Profile completeness signal | Simple completeness indicator (e.g. "your profile is 60% complete — add 2 more work history entries to improve tailoring"). Drives activation. | P2 |

### 1.3 Credit ledger

| Task | Detail / Acceptance Criteria | Priority |
|---|---|---|
| Ledger table | `credit_ledger`: event_id, user_id, event_type (purchase / debit / refund / adjustment), amount, balance_after, reference_id (Stripe payment intent or action ID), created_at. Append-only. | P0 |
| Balance read | Current balance = sum of all ledger rows for user. No separate mutable balance column. Always derived from ledger. | P0 |
| Debit function | A single server-side function handles all credit deductions. It checks balance before deducting, writes ledger row, returns new balance. Not callable client-side. Never silently fails. | P0 |
| Debit idempotency | Each debit carries a reference_id. Re-running the same action does not double-deduct if reference_id already exists in ledger. | P0 |
| Balance display | Authenticated UI shows current credit balance. Updates after each debit. | P1 |

### 1.4 Analytics event plumbing

| Task | Detail / Acceptance Criteria | Priority |
|---|---|---|
| Event taxonomy | Define and document core events: `user_signed_up`, `resume_imported`, `facts_reviewed`, `job_fit_run`, `tailoring_run`, `cover_letter_run`, `application_saved`, `interview_prep_run`, `credit_purchased`, `credit_spent`. | P0 |
| Event emit function | A lightweight server-side emit function. Event name, user_id, properties, timestamp. Pluggable — can write to Supabase `analytics_events` table initially. | P0 |
| Error logging | Critical workflow errors (AI provider failure, ledger write failure, auth failure) logged with enough context to debug. Not just console.error. | P0 |
| Funnel visibility | Dashboard or simple query to see: signups, activations (first fit scan completed), first purchase. These three numbers drive product decisions. | P1 |

---

## Activation — Phase 2

**Goal:** A user can complete the full core workflow in one session — paste resume → confirm profile → paste job → get fit verdict → tailor materials → export. This is the demo loop and the activation metric.

### 2.1 Job fit analysis

| Task | Detail / Acceptance Criteria | Priority |
|---|---|---|
| Job entity | `jobs` table: job_id, user_id, title, company, url, raw_description, source (manual / captured / api), created_at. | P0 |
| Job paste / import | User can paste a job description or URL. Description stored in `jobs`. At minimum, manual paste works. | P0 |
| Fit analysis engine | Given resume content (or approved profile facts) + job description, system produces: fit verdict (apply / stretch / skip), key signals (strengths matched, must-have gaps, stretch areas), rationale in plain language. Grounded in approved facts where possible. | P0 |
| Fit analysis storage | `fit_analyses` table: analysis_id, user_id, job_id, verdict, signals_json, rationale, created_at. Analyses must be retrievable — not ephemeral. | P0 |
| Fit UI | Verdict displayed clearly. Strengths / gaps / stretch clearly separated. User can act from this screen (go to tailor, save job, dismiss). | P0 |
| Apply / skip / stretch logic | Three distinct verdicts with distinct UI treatment. Not just a score. A skip should not look like an apply. | P1 |
| Fit history | User can see previous fit analyses for saved jobs. Sorted by recency. | P1 |

### 2.2 Tailored content generation

| Task | Detail / Acceptance Criteria | Priority |
|---|---|---|
| Tailored bullets | Generate tailored resume bullets for a target job. Grounded in approved `profile_facts`. Show evidence tag: which fact each bullet draws from. Never invent a fact. | P0 |
| Before/after diff view | Side-by-side view: original bullet vs tailored bullet. User can accept, edit, or reject each. | P0 |
| Cover letter generation | Generate a tailored cover letter from approved facts + job description. Show evidence tags on key claims. | P0 |
| Generation storage | `generated_assets` table: asset_id, user_id, job_id, asset_type (tailored_bullets / cover_letter / follow_up), content, evidence_json, created_at. | P0 |
| User review before saving | User must explicitly save or approve a generated asset. No silent auto-save. | P0 |
| Follow-up draft | Generate a follow-up email draft for an application. Grounded in job title, company, and date applied. | P1 |
| Hallucination guardrail | AI prompt must explicitly instruct: do not add skills, achievements, dates, or metrics not present in the approved facts provided. System should flag when it cannot ground a bullet. | P0 |

### 2.3 Export

| Task | Detail / Acceptance Criteria | Priority |
|---|---|---|
| Copy to clipboard | One-click copy for any generated asset. | P0 |
| Plain text export | Download generated content as .txt file. | P0 |
| PDF export | Export tailored resume or cover letter as PDF. Basic formatting acceptable for V1. | P1 |
| Application pack export | Bundle: tailored bullets + cover letter + job details into a single downloadable pack. | P1 |
| DOCX export | Export to .docx format. | P2 |

### 2.4 Onboarding flow

| Task | Detail / Acceptance Criteria | Priority |
|---|---|---|
| Onboarding sequence | Sign in → import resume → confirm facts → choose user path → run first fit scan. Max 4–5 steps. Progress indicator shown. | P0 |
| User path selection | User self-identifies: new grad / career switcher / currently employed / laid off / international candidate. Stored in profile. Influences prompt tuning later. | P1 |
| Skip and return | User can skip onboarding steps and complete them later. Incomplete state does not block app use. | P1 |
| First value moment | After first fit scan, user lands on a screen that clearly shows result and prompts next action (tailor, save job, etc.). Not a dead end. | P0 |

---

## Monetisation — Phase 3

**Goal:** Stripe wired, credit packages purchaseable, credit spending safe and auditable, users understand what they're buying.

### 3.1 Stripe integration

| Task | Detail / Acceptance Criteria | Priority |
|---|---|---|
| Stripe setup | Stripe keys in environment only. No hardcoding. Test mode for development. Live mode behind env flag. | P0 |
| Package definitions | Define credit packages: e.g. Starter Pack (50 credits), Application Sprint (200 credits), Career Switch Pack (500 credits). Prices set in Stripe. | P0 |
| Checkout flow | User selects package → Stripe Checkout → webhook confirms payment → credits added to ledger. | P0 |
| Webhook handler | Stripe webhook endpoint. Handles: `payment_intent.succeeded`, `checkout.session.completed`, `payment_intent.payment_failed`. Idempotent — replaying events must not double-credit. | P0 |
| Credit crediting | On payment confirmed: ledger row written (event_type = purchase, amount = package credits, reference_id = Stripe payment intent). | P0 |
| Purchase history | User can see their purchase history. Dates, amounts, package names. | P1 |
| Failed payment handling | Failed payments surface clearly. No credits added. User can retry. | P0 |

### 3.2 Credit spending

| Task | Detail / Acceptance Criteria | Priority |
|---|---|---|
| Credit cost map | Document credit cost per action: fit scan = X, tailored bullets = Y, cover letter = Z, interview prep = W. Reviewed by product owner before going live. | P0 |
| Pre-action balance check | Before any credit-costing action, check balance. If insufficient, surface upgrade prompt — not a silent failure. | P0 |
| Spend on generation | Each tailored generation, fit scan, and interview prep flow debits correct credits via the ledger debit function. | P0 |
| Spend confirmation | User sees "this will use X credits (you have Y)" before proceeding. Not hidden. | P1 |
| Low balance warning | When balance drops below a threshold, surface a prompt to purchase more. | P1 |

### 3.3 Subscription tier (optional for Phase 3, confirmed P1)

| Task | Detail / Acceptance Criteria | Priority |
|---|---|---|
| Subscription product in Stripe | Define a subscription plan if the business model moves to subscription alongside credits. Confirm direction with product owner before building. | P1 |
| Plan tier in user record | `users` table has `plan_tier` (free / starter / pro / enterprise). Updated on subscription events. | P1 |
| Feature gating | Premium features (advanced prep, extension, B2B tools) gated behind plan tier checks. Server-side checks — not UI-only. | P1 |

---


## Trust — Phase 4 (Code-Complete)

**Goal:** Users trust the output. Grounded generation is enforced, disclosures are in place, AI usage is understandable, and the legal surface is complete.

**Status:** All Trust 4.1–4.3 requirements are implemented and verified as of April 2026. See handover for details and checklist.
---

## Beta/Test Mode (April 2026)

**Purpose:**
Prepare a public/QA beta with authentication and payments stripped/disabled for open testing.

**Branch:** `beta/no-auth-payments` (from `codex/nextauth-setup`)

**Key changes:**
- All authentication and payments logic is removed/disabled
- All features are open (no credit gating)
- UI updated to reflect beta mode (banner, no sign-in/out, no pricing/buy-credits)
- Privacy/terms updated for beta
- See handover for full plan and checklist

**How to merge fixes:**
All bugfixes and improvements in beta should be merged back to `codex/nextauth-setup` before release.

### 4.1 Grounded generation enforcement

| Task | Detail / Acceptance Criteria | Priority |
|---|---|---|
| Facts-only mode | All tailoring and cover letter generation pulls only from approved `profile_facts`. Raw resume text as fallback must be explicitly flagged. | P0 |
| Evidence tags on output | Every generated bullet or claim shows a source tag: which approved fact it draws from. | P0 |
| AI cannot invent | System prompt must explicitly state: do not add skills, roles, metrics, dates, or achievements not provided. Violations should be flagged as missing grounding, not invented. | P0 |
| Ungroundable signal | When a job requires a skill the user does not have in approved facts, the gap is surfaced explicitly — not silently papered over. | P0 |
| User override with notice | User can choose to manually add a bullet outside approved facts, but they see a clear "manually added — not from your verified profile" label. | P1 |

### 4.2 Legal and disclosure surfaces

| Task | Detail / Acceptance Criteria | Priority |
|---|---|---|
| Privacy policy page | Accessible from footer and auth flows. Covers: data collected, how used, third parties (Supabase, Stripe, AI providers), deletion rights. | P0 |
| Terms of service page | Covers: what the product is and is not, no fabrication policy, user responsibility for accuracy of submitted facts. Accessible from footer and auth flows. | P0 |
| AI usage disclosure | In-product: clear labelling that outputs are AI-generated and should be reviewed by the user. Not buried. | P0 |
| Data deletion | User can request deletion of their account, profile facts, and generated assets. Process documented. Automated or manual for V1. | P1 |
| Data export | User can download their profile facts and generated assets. Basic JSON or CSV export acceptable for V1. | P2 |

### 4.3 Anti-fabrication guardrails

| Task | Detail / Acceptance Criteria | Priority |
|---|---|---|
| No deceptive auto-apply | The system must not submit applications on behalf of users without explicit user review and approval of each application and its content. | P0 |
| No credential inflation | System must not produce outputs that suggest degrees, certifications, or titles the user has not provided in approved facts. | P0 |
| Output review always required | No generated content should be exported or sent without user seeing it first. | P0 |

---

## Retention — Phase 5

**Goal:** Users come back every week. The tracker becomes an active workflow engine, not a passive database. Follow-up reminders, next-best actions, and outcome tracking drive a habit loop.

### 5.1 Application tracker (CRM)

| Task | Detail / Acceptance Criteria | Priority |
|---|---|---|
| Application record | `applications` table: application_id, user_id, job_id, stage (saved / applied / interview / offer / rejected / withdrawn), applied_at, updated_at, notes, outcome. | P0 |
| Stage pipeline UI | Kanban-style or list view showing applications by stage. User can drag or update stage. | P0 |
| Notes on application | User can add freeform notes to any application. Notes timestamped. | P0 |
| Outcome capture | When application reaches terminal stage (offer / rejected / withdrawn), user prompted to record outcome. Outcome stored for future analytics. | P1 |
| Application created from workflow | Completing a tailoring + export flow should offer to create an application record automatically. One click, not a separate flow. | P0 |

### 5.2 Follow-ups and reminders

| Task | Detail / Acceptance Criteria | Priority |
|---|---|---|
| Follow-up task | User can set a follow-up reminder on any application: type (email follow-up / check status / interview prep), due date, notes. | P0 |
| `follow_ups` table | follow_up_id, user_id, application_id, type, due_date, is_complete, notes, created_at. | P0 |
| Due today / overdue surface | Dashboard surfaces follow-ups due today and overdue. Not buried in settings. | P0 |
| Follow-up draft from tracker | From any application with a follow-up task, user can trigger a follow-up email draft. Grounded in job + stage + days elapsed. | P1 |
| Email notification (optional) | Email reminders for due follow-ups. Requires email provider. Degrade cleanly if not configured. | P2 |

### 5.3 Dashboard and next-best actions

| Task | Detail / Acceptance Criteria | Priority |
|---|---|---|
| Dashboard | On login: shows active applications (by stage), follow-ups due, recent activity, quick-start prompts. Not a blank screen. | P0 |
| Next-best action | System surfaces one or two suggested next actions based on current state: e.g. "You haven't followed up on 3 applications in 7+ days" or "You have 2 saved jobs you haven't tailored yet." | P1 |
| Weekly summary (future) | Weekly email or in-app digest: applications moved, follow-ups completed, new jobs saved. Infrastructure in place but not required for P1. | P2 |

---

## Extension — Phase 6

**Goal:** CVScan becomes ambient — job capture from the browser, voice interview practice, early B2B and coaching layer. Build only after Phase 5 is stable.

### 6.1 Job capture browser extension

| Task | Detail / Acceptance Criteria | Priority |
|---|---|---|
| Extension scaffold | Browser extension (Chrome-first) that can capture a job description from a job board page. | P1 |
| Capture action | One-click capture: job title, company, URL, description sent to CVScan and saved to `jobs`. User sees confirmation. | P1 |
| Auth passthrough | Extension uses existing user session. No separate login. | P1 |
| Fit scan from capture | After capture, user can launch a fit scan from the extension or from the app. | P2 |

### 6.2 Interview preparation stack

| Task | Detail / Acceptance Criteria | Priority |
|---|---|---|
| Interview session record | `interview_sessions` table: session_id, user_id, job_id, questions_json, answers_json, scores_json, feedback, created_at. | P0 |
| Question generation | Given job description + approved profile facts, generate likely interview questions (behavioural, technical, fit). Role-appropriate. | P0 |
| Talking points | For each question, generate a talking point grounded in the user's approved facts. | P0 |
| Practice flow | User reads question, types or speaks their answer, system scores and provides feedback. | P1 |
| Rubric scoring | Score on: relevance, use of specific examples, conciseness. Feedback per dimension. | P1 |
| Prep pack export | Export generated questions + talking points as a PDF prep pack. | P1 |
| Voice mode (future) | Architecture should not block future voice input/output — but do not implement for Phase 6 V1. | P2 |

### 6.3 Early B2B layer

Do not build B2B tooling before the consumer loop is stable and revenue is generating. The following are directional only.

| Task | Detail / Acceptance Criteria | Priority |
|---|---|---|
| Coach seat concept | A coach or bootcamp can manage multiple candidate users. Separate `coach_seats` table with user_id → coach_id relationship. | P2 |
| Candidate roster | Coach can view a list of their candidates and their pipeline stages. Read-only initially. | P2 |
| Seat billing | Seat-based billing per coach. Stripe subscription product. | P2 |

---

## Schema reference

Full canonical table list. All tables require RLS with user_id scoping unless noted.

| Table | Key columns | Notes |
|---|---|---|
| `users` | user_id, email, plan_tier, credit_balance (derived), created_at | Auth identity. credit_balance is always derived from ledger — never stored directly. |
| `profile_facts` | fact_id, user_id, fact_type, fact_text, is_approved, source, created_at, updated_at | Core memory layer. Only approved facts used in generation. |
| `resume_versions` | version_id, user_id, raw_content, tailored_content, label, created_at | One row per version. |
| `jobs` | job_id, user_id, title, company, url, raw_description, source, created_at | Source: manual / captured / api. |
| `fit_analyses` | analysis_id, user_id, job_id, verdict, signals_json, rationale, created_at | Verdicts: apply / stretch / skip. |
| `generated_assets` | asset_id, user_id, job_id, asset_type, content, evidence_json, created_at | Types: tailored_bullets / cover_letter / follow_up. |
| `applications` | application_id, user_id, job_id, stage, applied_at, updated_at, notes, outcome | Stages: saved / applied / interview / offer / rejected / withdrawn. |
| `follow_ups` | follow_up_id, user_id, application_id, type, due_date, is_complete, notes, created_at | Types: email_follow_up / check_status / interview_prep. |
| `interview_sessions` | session_id, user_id, job_id, questions_json, answers_json, scores_json, feedback, created_at | Scores per dimension. |
| `credit_ledger` | event_id, user_id, event_type, amount, balance_after, reference_id, created_at | Append-only. event_types: purchase / debit / refund / adjustment. |
| `analytics_events` | event_id, user_id, event_name, properties_json, created_at | Pluggable. No PII in properties. |

---

## Non-functional requirements

These apply to every phase, not just the phase that introduces them.

| Category | Requirement |
|---|---|
| Security | Secrets in environment only. Never in client bundles, source code, or committed files. |
| User isolation | Every query scoped to authenticated user. RLS enforced. No cross-user access possible at any layer. |
| Ledger safety | Credit ledger is append-only. Balance always derived. Debit function is server-side only. Reference_id enforces idempotency. |
| No fabrication | AI must not invent facts, achievements, skills, or credentials. Evidence tags required on all generated career content. |
| No silent failures | Critical write failures (ledger, application save, fact storage) must fail loudly. Not silently. User must see an error state. |
| Clean degradation | AI provider failure, email provider failure, and job API failure degrade cleanly — they do not break core app functionality. |
| Idempotent writes | Any write that may be retried (ledger debit, Stripe webhook credit) must be idempotent. |
| Performance | Core fit scan and generation flows should feel responsive for standard user sessions. |
| Observability | Error logging and funnel analytics must be in place before a feature ships to real users. |
| Documentation | Code comments and docs must remain usable by both humans and coding agents. Docs cannot drift from implementation indefinitely. |

---

## Explicit non-goals

Do not build these without explicit product owner sign-off and a confirmed session task.

- Enterprise recruiting workflows or ATS integrations
- Large-scale team collaboration features
- Autonomous job application submission without per-application user review and approval
- AI-generated claims of credentials, experience, or metrics the user has not provided
- Heavy admin tooling before the consumer workflow is stable
- B2B layer before Phase 5 (consumer retention) is proven
- Voice mode in Phase 6 V1 (architecture should not block it — but do not implement yet)

---

*Last updated: April 2026. Update this file when phase scope changes. Do not let it drift.*
