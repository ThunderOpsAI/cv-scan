# CVScan Agent Handover Plan

## Goal

Coordinate up to 8 agents to prepare CVScan for a Google Play closed beta without overlap:

- 6 build agents
- 1 test/verification agent
- 1 diff/review agent

No agent should make product-scope decisions. All core decisions are fixed by this document.

## Global Assumptions

- Repo contains a pre-beta MVP commit with working auth/payment flows.
- Current branch has placeholder substitutions for sign-in and payments.
- Stack is Supabase + Stripe.
- Android billing must use Google Play Billing for in-app digital goods unless a compliant alternative is explicitly confirmed.
- Release target is AU/NZ closed beta on Google Play.
- Sensitive data posture applies to CVs, cover letters, auth data, billing-linked records, uploaded files, and user-specific AI outputs.
- Premium access must always be backend-verified.
- Client-only premium unlock is not acceptable.

## Delivery Order

Recommended sequence:

1. Agent 1 first.
2. Agents 2 and 3 in parallel after Agent 1 identifies restore baseline.
3. Agents 4 and 5 in parallel after auth/data model is clear.
4. Agent 6 after legal/compliance behavior is defined.
5. Agent 7 verifies integrated system.
6. Agent 8 performs final diff/review.

## Agent 1: Restore Baseline and Gap Map

### Objective

Identify the last working pre-beta commit and produce a precise restoration map for auth, payments, credits, and premium gating.

### Responsibilities

- inspect git history
- identify likely last-good MVP commit/branch
- compare current placeholders vs prior working implementation
- list all auth/payment/credits/premium gating regressions
- define exact restore targets and dependencies
- identify files/modules to restore or partially restore
- identify build/dependency breakages caused by restoration

### Outputs

- restoration checklist
- changed files/modules inventory
- risk list for restoration
- recommended restore order
- exact commit/branch references
- placeholder regression map

### Must Not

- redesign auth or billing architecture
- introduce new product behavior unless necessary for compatibility
- modify large unrelated areas

### Definition of Done

- team knows exactly what to restore and from where
- Agents 2 and 3 have clear starting instructions
- restore path is specific enough to execute without guessing

## Agent 2: Authentication Restoration and Production Hardening

### Objective

Restore sign-up/sign-in flows and harden them for production.

### Responsibilities

- restore email/password auth
- restore Google sign-in
- restore password reset/session behavior
- remove placeholder auth UI/logic
- verify protected-route behavior
- add account deletion entry point if missing
- verify sign-out behavior
- verify deleted/deactivated users lose access
- document reviewer/test account path if relevant

### Constraints

- use backend-authenticated trust only
- no client-only security assumptions
- preserve compatibility with existing user model if feasible
- do not expose service-role keys or privileged secrets to client/mobile bundles

### Definition of Done

- auth flows work
- protected access is enforced
- placeholder auth is removed from release flows
- account deletion entry point exists
- any remaining auth blockers are explicitly documented

## Agent 3: Billing, Credits, and Entitlement Model

### Objective

Restore existing payment/credit logic and formalize backend entitlements.

### Responsibilities

- restore Stripe-backed web payment flow already present in MVP
- restore credits/premium gating rules
- design and implement normalized entitlement source model
- add or scaffold Google Play Billing integration path for Android
- define purchase restore and entitlement sync behavior
- ensure premium unlock requires backend verification
- verify Stripe webhook signature handling
- define Play purchase verification flow
- define refund/revocation/expiry behavior

### Required Entitlement States

- `free`
- `paid_stripe`
- `paid_play`
- `expired`
- `cancelled`
- `refunded`
- `pending_verification`
- `verification_failed`

### Constraints

- Android in-app digital purchases use Play Billing unless a compliant alternative is explicitly confirmed
- web can keep Stripe
- do not assume Apple Pay for future iOS digital goods
- keep abstraction ready for Apple IAP later
- never unlock premium from local state alone

### Definition of Done

- billing and premium rules are consistent, policy-safe, and verifiable
- backend entitlement model exists or is clearly specified
- premium access checks fail closed
- Stripe and Play paths are separated cleanly

## Agent 4: Data Security and Access Controls

### Objective

Harden sensitive-data handling and server-side protections.

### Responsibilities

- audit Supabase RLS coverage
- audit storage bucket permissions
- audit secret exposure risks
- verify upload validation and authorization
- verify user-owned data isolation
- verify generated output isolation
- add/confirm rate limiting strategy for auth/upload/generation/payment-sensitive flows
- verify server-side protection of privileged operations
- check service-role key usage
- document residual risks

### Constraints

- treat CVs, generated outputs, email addresses, auth data, and billing IDs as sensitive
- default to fail-closed where verification is uncertain
- avoid logging raw CV/resume contents
- do not weaken RLS for convenience

### Definition of Done

- cross-user data access and obvious abuse paths are closed
- storage access is owner-scoped
- invalid uploads are rejected safely
- privileged keys are server-only
- security risks are documented by severity

## Agent 5: Legal, Compliance, and Deletion Flows

### Objective

Make the app behavior and public documents submission-ready.

### Responsibilities

- define Privacy Policy content requirements
- define Terms & Conditions content requirements
- define support contact requirements
- define Data Safety disclosures from actual app behavior
- define account deletion behavior and data retention model
- ensure external deletion URL requirement is met conceptually
- ensure in-app deletion path requirement is met conceptually
- map compliance text to actual product/data flows
- flag mismatches between actual behavior and legal text

### Constraints

- policy text must match implemented behavior
- if payment, AI-processing, retention, or deletion behavior is uncertain, mark as blocking assumption
- do not overclaim privacy/security behavior that is not implemented
- include payment processors and AI providers where applicable

### Definition of Done

- compliance package is ready for final drafting and Play Console entry
- deletion behavior is operationally defined
- data safety answers can be filled from the compliance matrix
- unresolved compliance assumptions are clearly marked

## Agent 6: Play Store Release Readiness

### Objective

Prepare the release and operational submission checklist.

### Responsibilities

- define Play Console listing requirements
- define store asset requirements
- define reviewer access strategy
- define closed-beta setup steps
- define release checklist for signing/versioning/build submission
- define support/ops readiness needs for beta
- verify testing-track assumptions
- prepare release notes checklist
- confirm required URLs are available

### Important Policy Fact

If the Play developer account is a personal account created after November 13, 2023, production access generally requires at least 12 opted-in testers for 14 continuous days before applying for production access.

### Definition of Done

- submission path is clear and operationally realistic
- Play Console checklist exists
- closed test flow is documented
- reviewer access instructions are ready
- missing assets or URLs are listed as blockers

## Agent 7: Test and Verify

### Objective

Verify the integrated result against real launch-critical scenarios.

### Responsibilities

- verify auth flows
- verify password reset
- verify Google sign-in
- verify upload ownership isolation
- verify invalid upload rejection
- verify premium gating
- verify Stripe purchase handling path
- verify Play purchase handling or scaffold path
- verify restore purchases path
- verify deletion flow behavior
- verify policy-linked surfaces are reachable
- verify release build critical-path behavior
- produce pass/fail report with reproduction notes

### Constraints

- prioritize launch blockers over minor polish
- focus on end-to-end production risk
- do not expand scope into new features
- test fail-closed behavior for billing and auth

### Definition of Done

- clear blocker list exists
- readiness verdict exists
- major launch scenarios are tested
- reproduction notes are provided for failures

## Agent 8: Diff and Final Review

### Objective

Review the aggregate change set for regressions, policy misses, and unsafe assumptions.

### Responsibilities

- review integrated diffs
- identify missing tests
- identify security regressions
- identify billing/compliance inconsistencies
- identify any mismatch between legal text and actual behavior
- identify accidental scope creep
- verify no placeholder flows remain
- produce final launch-risk summary ordered by severity

### Constraints

- findings first, not summary first
- no new scope expansion unless it blocks launch
- prioritize auth, billing, privacy, deletion, data security, and Play review risks

### Definition of Done

- final review provides an actionable go/no-go list
- all blockers are severity-ranked
- release readiness is clearly stated

## Cross-Agent Handover Rules

- Agent 1 hands the exact restore baseline to Agents 2 and 3.
- Agent 3 publishes the entitlement model for Agents 4, 5, and 7.
- Agent 4 publishes the access-control and threat findings for Agent 7 and Agent 8.
- Agent 5 publishes the final compliance matrix for Agent 6 and Agent 8.
- Agent 6 publishes the final beta/submission checklist for Agent 7 validation.
- Agent 7 publishes blocker/non-blocker verdicts for Agent 8.
- Agent 8 produces the final launch decision memo.

## Required Artifacts From Each Agent

Each agent should return:

- what they inspected
- decisions they applied from this handover
- what they changed or specified
- blockers
- assumptions
- exact acceptance result against their scope
- files changed or files reviewed
- recommended next handover target

## Shared Blocker Definitions

### Critical Blockers

Critical blockers prevent beta submission:

- broken auth
- placeholder auth in release flow
- placeholder billing in release flow
- premium unlock from local/client state only
- missing privacy policy URL
- missing deletion path
- exposed privileged keys
- broken RLS or storage isolation
- Android digital purchase path not Play-compliant
- release build cannot install
- reviewer cannot access app

### High Blockers

High blockers may prevent safe beta operation:

- weak upload validation
- missing rate limiting on sensitive routes
- unclear retention behavior
- incomplete Data Safety mapping
- missing refund/revocation handling
- insufficient logging for billing/auth failures
- broken password reset

### Medium/Low Issues

Medium/low issues should not block beta unless they create policy, security, or purchase risk:

- UI polish
- minor copy issues
- non-critical analytics gaps
- low-risk layout bugs
- future iOS abstraction cleanup

## Final Exit Criteria

The project is ready for beta submission when:

- auth is restored and secure
- Android billing path is policy-compliant
- premium gating is backend-verified
- legal and deletion surfaces exist and match actual behavior
- core data protections are verified
- Play listing and test-track setup are complete
- verification passes with no unresolved launch blockers
- final diff/review produces a go verdict

