# CVScan Software Requirements Specification

## 1. Overview

CVScan is an application that helps users improve resumes/CVs and related job application materials using AI-assisted workflows.

The production launch target is an Android closed beta distributed through Google Play in AU/NZ. The system must support secure authentication, document upload, premium access, compliant billing, account deletion, and accurate legal disclosures.

## 2. Objectives

The system shall:

- allow users to register and authenticate securely
- allow users to upload CV/resume documents
- protect user documents and account data
- allow users to purchase digital access/credits in policy-compliant ways
- enforce premium access via backend entitlement checks
- allow users to delete their account and associated user data
- provide legally required disclosures and support paths
- support Google Play closed beta review and tester onboarding

## 3. User Roles

### Guest

A user who has not signed in.

### Authenticated User

A signed-in user with access to free account-level functionality.

### Paid User

An authenticated user with a valid backend-verified entitlement.

### Reviewer/Tester

A controlled access user for Google Play review or closed beta testing.

### Operator/Admin

The founder/operator responsible for support, release management, logs, and operational checks.

## 4. Functional Requirements

## 4.1 Account Creation and Authentication

The system shall:

- support account creation with email/password
- support sign-in with email/password
- support password reset
- support Google sign-in
- persist authenticated sessions securely
- support logout
- block unauthenticated access to protected data/features
- support an account deletion entry point
- support reviewer/tester access instructions

The system should:

- notify users of login/reset failures without leaking sensitive information
- support future extension to Apple sign-in if iOS is later added

The system shall not:

- rely only on client-side state for authentication
- expose privileged authentication secrets to client/mobile builds
- allow deleted users to continue accessing protected features

## 4.2 User Data Management

The system shall:

- allow a user to upload supported CV/resume files
- associate uploaded documents only with the authenticated owner
- allow the user to view/manage their own uploaded content
- prevent access to other users’ documents or metadata
- store metadata needed for ownership, processing, and deletion

The system shall validate:

- allowed MIME/file types
- file size limits
- upload ownership and authorization
- storage bucket permissions
- backend processing authorization

The system shall fail safely when:

- file type is unsupported
- file size exceeds the configured limit
- upload ownership cannot be verified
- processing fails
- user entitlement cannot be verified for paid features

## 4.3 AI Processing

The system shall:

- process uploaded CV/resume content only for user-requested functionality
- associate AI-generated outputs with the authenticated user
- disclose AI processing behavior in privacy/legal documents
- avoid exposing user CV content in logs unless strictly necessary and sanitized

The system should:

- log processing status and errors without logging sensitive full document contents
- make AI failure states clear to the user

## 4.4 Billing and Premium Access

The system shall:

- support Google Play Billing for Android in-app digital purchases unless a compliant alternative is explicitly confirmed
- retain Stripe billing for supported web purchases
- normalize entitlement state in the backend
- restore Play purchases
- verify purchases server-side before granting access
- revoke access when entitlement is refunded, revoked, cancelled, or expires
- expose current account/access state to the user

The system shall not:

- rely solely on client-side state to determine premium access
- unlock paid features from unverified purchases
- keep premium access active after known revocation/refund/expiry

## 4.5 Entitlement Model

The system shall support at least the following entitlement states:

- `free`
- `paid_stripe`
- `paid_play`
- `expired`
- `cancelled`
- `refunded`
- `pending_verification`
- `verification_failed`

Each entitlement record should include:

- user ID
- source: `stripe`, `play`, or internal/admin if applicable
- product/plan/credit identifier
- status
- expiry timestamp where applicable
- purchase/transaction identifier
- verification timestamp
- last sync timestamp
- revocation/refund/cancellation metadata where applicable

Premium feature checks shall:

- query backend entitlement state
- fail closed if entitlement cannot be verified
- avoid trusting local/mobile state alone

## 4.6 Premium Feature Enforcement

The system shall:

- distinguish free vs paid entitlements
- gate premium features using backend-verified entitlement
- fail closed when entitlement cannot be verified
- expose current account/access state to the user clearly
- prevent client-side bypasses of premium functionality

## 4.7 Account Deletion

The system shall:

- provide an in-app path to request or perform account deletion
- provide an external web URL for account deletion information/action as required by Google Play
- delete or schedule deletion of user-owned data according to policy
- sign the user out after deletion completion where applicable
- prevent deleted users from accessing protected data/features

The system may retain limited records only when required for:

- security
- fraud prevention
- legal/accounting obligations
- payment dispute handling

Any retained data must be disclosed in policy documents.

## 4.8 Legal and Support Surfaces

The system shall provide:

- Privacy Policy
- Terms & Conditions
- support contact
- deletion information/path
- clear disclosure of data usage relevant to AI processing and payments
- clear disclosure of third-party processors such as Supabase, Stripe, Google Play, and AI providers where applicable

Legal/support pages shall be:

- publicly accessible
- linked from the app where appropriate
- consistent with actual app behavior
- available before Play review submission

## 4.9 Reviewer and Testing Access

The system shall:

- support a clear reviewer path for Play review
- support closed-beta tester onboarding
- allow app access instructions to be documented for Play Console
- include test credentials if reviewer access requires sign-in
- ensure reviewer credentials do not expose real user data

## 5. Security Requirements

The system shall:

- use secure transport for all network communication
- protect secrets from client exposure
- use row-level access restrictions for user-owned data
- restrict storage access appropriately
- rate limit auth and sensitive endpoints
- log relevant security and billing failures
- validate payment webhook authenticity
- validate upload inputs
- use least privilege for backend services
- ensure service-role keys are server-only
- avoid storing sensitive document contents in application logs

The system shall not:

- store plaintext passwords
- expose privileged API keys in client builds
- permit user-to-user data access
- permit premium unlock through client-only mutation
- allow unauthenticated upload or generation access

## 6. Privacy and Compliance Requirements

The system shall disclose:

- what user data is collected
- why it is collected
- which third parties process it
- retention and deletion behavior
- support/deletion contact paths
- payment processor usage
- AI processing behavior
- whether uploaded files or generated outputs are retained

The system shall align actual behavior with:

- Google Play Data Safety declarations
- account deletion requirements
- published Privacy Policy
- published Terms & Conditions
- billing behavior in the Android app and web app

## 7. Non-Functional Requirements

The system should:

- be stable enough for founder-led private beta support
- provide enough logging to diagnose auth, billing, upload, and AI-generation issues
- minimize user friction in onboarding and payment flows
- degrade safely during service failures
- avoid noisy or sensitive logs
- support manual support workflows during closed beta
- be maintainable by a small team/founder workflow

## 8. External Interfaces

The system interfaces with:

- Supabase for auth/data/storage
- Stripe for web billing
- Google Play Billing for Android billing
- email provider for auth/reset/support if applicable
- hosting platform for legal pages
- Google Play Console for app distribution and compliance
- AI provider for resume/CV processing where applicable
- analytics/crash reporting provider if implemented

## 9. Key Acceptance Scenarios

The system is acceptable when the following scenarios pass:

1. User signs up with email and accesses free features.
2. User signs in with Google and resumes prior account state.
3. User resets password successfully.
4. User uploads a valid CV and only they can access it.
5. User attempts invalid upload and receives safe rejection.
6. User attempts to access another user’s document and is blocked.
7. User purchases premium on Android and gains verified entitlement.
8. User purchases premium on web and gains verified entitlement.
9. User restores Android purchase on reinstall/device change.
10. User loses entitlement after refund/revocation/expiry.
11. User requests deletion and the data/process follows policy.
12. Play reviewer can access required functionality using provided instructions.
13. Beta testers can install and use the closed test build.
14. Premium feature access fails closed if entitlement verification fails.

## 10. Assumptions

- existing stack is Supabase + Stripe
- a prior MVP commit contains working auth/payment logic
- AU/NZ only for first launch
- Android closed beta precedes production
- iOS is deferred
- architecture should not block future Apple IAP support
- Play Billing is the safest default path for Android in-app digital goods
- legal/compliance pages can be hosted publicly before submission

## 11. Explicit Non-Requirements for This Release

This release does not require:

- iOS release
- Apple IAP
- full international legal/tax expansion
- advanced team/admin tooling
- broad subscription experimentation
- large-scale support automation
- enterprise dashboard
- multi-region compliance support
- advanced analytics experimentation
