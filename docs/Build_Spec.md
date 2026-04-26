# CVScan Production Launch Build Spec

## Summary

Prepare CVScan for an AU/NZ Google Play closed beta by restoring the last working pre-beta MVP auth and payments flow, then adding production-grade compliance, billing separation, security guardrails, and release readiness.

The primary launch goal is a stable Android closed beta that supports secure account creation, CV/resume upload, AI-assisted processing, compliant digital purchases, backend-verified premium access, and operational account deletion.

## Product Goal

Ship a stable Android beta that allows users to:

- create an account
- sign in with email/password and Google
- upload and process CV/resume documents securely
- purchase digital credits or premium access correctly
- manage their account, including deletion
- use premium features only when backend-verified entitlement exists

## Launch Scope

### In Scope

- Android app closed beta on Google Play
- AU/NZ distribution only
- Supabase auth and data backend
- Stripe web checkout retained for web purchases
- Google Play Billing used for Android in-app digital goods unless a compliant alternative is explicitly approved
- Privacy Policy, Terms & Conditions, support contact, deletion flow
- production logging, abuse protection, and purchase verification
- Play Console listing, compliance forms, and reviewer access path

### Out of Scope

- iOS App Store launch
- Apple IAP implementation
- broad global rollout
- enterprise/admin dashboard
- advanced experimentation
- multi-region compliance beyond AU/NZ baseline
- complex subscription experimentation

## Platform Billing Rules

- Android in-app purchases for digital goods/features must use Google Play Billing unless the app has a clearly documented, compliant, approved alternative.
- Web may retain Stripe checkout for web purchases.
- Premium access must never be granted from local state alone.
- Entitlements must be backend-normalized and server-verified.
- Recommended v1 rule: one user account may hold entitlements from either `play` or `stripe`, but premium unlock must always depend on backend verification.
- Stripe entitlements and Play entitlements should be stored with source, product, status, expiry, and verification metadata.

## Required Workstreams

## 1. Restore Baseline MVP

### Objective

Restore the last known good commit/branch where auth, payments, credits, and premium gating worked before beta placeholders were introduced.

### Deliverables

- identified restore commit/branch
- diff map of placeholder substitutions introduced after MVP
- restoration checklist for auth, billing, credits, premium gating
- list of broken flows and missing dependencies
- file/module inventory for restoration

### Acceptance

- sign-up, sign-in, and premium gating behavior matches pre-beta MVP intent
- no placeholder auth/payment UI remains in release flows
- restored code builds successfully
- restored flows can be verified end-to-end

## 2. Authentication

### Required Capabilities

- email/password signup
- email/password sign-in
- password reset
- Google OAuth sign-in
- session persistence
- sign-out
- account deletion entry point
- reviewer/test account support path

### Guardrails

- no client-only auth trust
- secure session refresh behavior
- abuse protection for signup, login, and reset
- protected routes must verify user state server-side where applicable
- deleted users must lose access immediately

### Acceptance

- auth works in production build
- unauthorized access to user data is blocked server-side
- password reset works
- Google sign-in works or is clearly blocked as a launch blocker
- deleted/deactivated users cannot access protected features

## 3. Billing, Credits, and Entitlements

### Required Capabilities

- Stripe retained for web checkout
- Google Play Billing added for Android digital purchases
- backend entitlement normalization
- purchase restore flow
- subscription/credit ownership visibility
- webhook/event verification where applicable
- refund/revocation handling

### Entitlement States

- `free`
- `paid_stripe`
- `paid_play`
- `expired`
- `cancelled`
- `refunded`
- `pending_verification`
- `verification_failed`

### Rules

- premium access cannot be granted from local state alone
- Play purchases must be verified server-side before granting access
- Stripe webhook signatures must be verified
- restore purchases must reconcile user entitlements safely
- refunded/revoked/expired purchases must remove premium access
- entitlement checks must fail closed if verification is unavailable

### Acceptance

- user can buy successfully from app and web in supported channels
- backend reflects correct entitlement state
- premium access is granted only after backend verification
- loss of entitlement is enforced reliably
- restore purchase path works for Android reinstall/device change

## 4. Data and Security

### Sensitive Data

Treat the following as sensitive:

- CVs/resumes
- cover letters
- email addresses
- password/auth/session data
- purchase/customer identifiers
- AI-generated user-specific output
- uploaded files and extracted text

### Required Protections

- audit all secrets and environment variables
- verify Supabase RLS on every user-owned table
- verify storage bucket access policies
- validate file type and file size on upload
- reject unsafe/unsupported uploads
- use malware/abuse-conscious upload handling
- rate limit auth, upload, generation, and billing-sensitive endpoints
- log high-risk events
- verify payment webhooks/signatures
- remove placeholder bypasses
- confirm server-only use of privileged keys
- confirm no service-role key is exposed to client bundles

### Acceptance

- cross-user access attempts fail
- invalid uploads fail safely
- auth/payment abuse is throttled
- premium unlock bypasses are not possible from client only
- secrets are not exposed in frontend/mobile builds
- storage access is owner-scoped

## 5. Compliance and Legal

### Required Artifacts

- Privacy Policy URL
- Terms & Conditions URL
- support email/contact URL
- account deletion path in-app
- account deletion web URL for Play Console
- Data Safety form answers
- app access/reviewer instructions

### Policy Requirements to Reflect

- account deletion must be available if account creation is supported
- deletion must include an in-app path and a web path
- user data disclosures must match actual collection, sharing, retention, and deletion behavior
- AI processing disclosure must describe user CV/resume handling clearly
- retention exceptions must be disclosed clearly
- payment processor use must be disclosed

### Acceptance

- legal pages are public, linked, and consistent with actual behavior
- deletion works operationally, not just cosmetically
- Play declarations match app behavior exactly
- support contact is reachable

## 6. Play Store Release Readiness

### Deliverables

- package/signing readiness
- Play Console app setup
- closed testing track
- screenshots
- app icon
- feature graphic
- short description
- full description
- content rating answers
- privacy policy URL
- support contact
- release notes
- reviewer login path if needed
- beta tester onboarding instructions

### Important Testing Requirement

For personal Play developer accounts created after November 13, 2023, production access generally requires at least 12 opted-in closed testers for 14 continuous days before applying for production access.

### Acceptance

- internal test build installs successfully
- closed test can onboard testers
- store listing passes policy review readiness checks
- reviewer can access core functionality
- release build does not expose debug-only secrets or placeholder flows

## Non-Functional Requirements

- reliable auth and purchase flows in release build
- crash-free baseline acceptable for beta
- low-friction onboarding
- secure default failure modes
- supportable with a small team/founder workflow
- observability sufficient to diagnose auth, billing, upload, and AI-generation issues
- failure states must be clear to users and safe by default

## Dependencies

- Supabase
- Stripe
- Google Play Console
- Google Play Billing integration path
- hosting for legal pages
- support inbox/domain
- analytics/crash reporting provider if not already present
- Android build/signing pipeline

## Launch Blockers

The following block beta submission:

- placeholder auth still present in release flow
- placeholder payment/premium unlock still present in release flow
- premium access controlled only by local/client state
- missing account deletion path
- missing privacy policy URL
- missing Play-compatible billing path for Android digital goods
- exposed privileged Supabase/service keys
- broken RLS or cross-user file access
- release build fails install/signing
- reviewer cannot access app functionality

## Exit Criteria for Beta Submission

CVScan is ready for beta submission when:

- auth is restored and production-safe
- Android billing is implemented or explicitly confirmed as compliant
- legal/compliance pages are live
- deletion flow is live
- core RLS and storage protections are verified
- premium gating is backend-verified
- Play assets and forms are completed
- closed test build is available
- no unresolved launch blockers remain
