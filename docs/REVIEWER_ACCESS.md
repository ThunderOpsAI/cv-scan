# CVScan — Google Play Reviewer Access Strategy

> **Prepared by:** Agent 6 — April 2026
> **Relates to:** Play Console → App Review → Reviewer Instructions

---

## Overview

Google Play reviewers must be able to fully exercise the app's premium functionality without making real payments. This document defines the strategy, required test account(s), and the step-by-step instructions to include in the Play Console submission notes.

---

## 1. Strategy Decision

### Recommended Approach: Pre-Loaded Test Account (No Code Changes Required)

The safest and most reviewable strategy is to **seed a dedicated reviewer account** in Supabase with:
- A confirmed email/password sign-in credential
- A pre-loaded credit balance sufficient to exercise all generation features

This avoids any code-level bypass logic that could weaken production entitlement checks.

> ⚠️ **Do NOT implement a code-level "reviewer mode" bypass** — this could create an exploitable path for production users to unlock premium features without payment, and is a policy risk with Google Play.

---

## 2. Test Account Setup (Product Owner Action Required)

### Step 1: Create the Reviewer User

In the production Supabase project, run the following **as a one-time ops task** (not committed to the codebase):

```sql
-- 1. Create the user in auth.users via Supabase dashboard or Admin API
-- Email: reviewer@cvscan-test.com
-- Password: [set a strong temporary password — record securely]
-- NOTE: Use the Supabase dashboard Auth tab or the Admin API to create this user.
-- Do NOT insert directly into auth.users.

-- 2. Once auth user is created and their UUID is known, seed the public.users row:
INSERT INTO public.users (id, email, name, created_at, updated_at)
VALUES (
  '<auth_user_uuid>',
  'reviewer@cvscan-test.com',
  'Play Reviewer',
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;

-- 3. Seed the credit balance (500 credits = ample for review)
INSERT INTO credit_transactions (user_id, amount, type, description, created_at)
VALUES (
  '<auth_user_uuid>',
  500,
  'admin_grant',
  'Pre-loaded review credits for Google Play review team',
  now()
);

-- 4. Confirm final balance
SELECT SUM(amount) AS balance FROM credit_transactions WHERE user_id = '<auth_user_uuid>';
-- Expected: 500
```

### Step 2: Verify Account Access

Before submitting to Play Console, verify:
- [ ] Sign in at `https://cvscan.com/auth/signin` with `reviewer@cvscan-test.com`
- [ ] Navigate Dashboard → verify credit balance shows 500
- [ ] Run one Resume Score generation — confirm credit deducts correctly
- [ ] Navigate Dashboard → Profile → confirm "Delete Account" button exists (do NOT delete)
- [ ] Sign out

### Step 3: Rotate Credentials After Review

Once the Play review window closes (typically 3–7 days):
- Reset the reviewer account password via the Supabase Auth dashboard
- Optionally: delete the account entirely via `DELETE /api/profile/delete-account` with the service role key

---

## 3. Reviewer Instructions (Copy-Paste to Play Console Notes)

> The following text should be entered verbatim into the **"Notes for reviewers"** field in Play Console → App Content → App Access.

---

```
REVIEWER ACCESS INSTRUCTIONS — CVScan

CVScan requires an account to access its core features. A pre-loaded 
test account with 500 review credits has been created for your use.

Sign-In Credentials:
  Email:    reviewer@cvscan-test.com
  Password: [INSERT FINAL PASSWORD HERE]
  URL:      https://cvscan.com/auth/signin

This account has been pre-loaded with 500 credits. Credits are used 
to generate resumes, cover letters, and job fit analyses. You have 
sufficient credits to fully exercise all features without making a 
real purchase.

Key features to review:
  1. Resume Scorer: Dashboard → Job Fit
  2. Resume Tailor: Dashboard → Tailor
  3. Cover Letter: Dashboard → Copilot
  4. Job Pack: Dashboard → Job Packs
  5. Interview Prep: Dashboard → Interview
  6. Career Memory: Dashboard → Profile (build your profile first)
  7. Credit Purchase: Dashboard → Buy Credits (test with Google Play 
     license testing — no real charge will be made with test accounts)
  8. Account Deletion: Dashboard → Profile → Delete Account 
     (also accessible without login at: https://cvscan.com/delete-account)

Privacy Policy: https://cvscan.com/privacy
Terms: https://cvscan.com/terms
Account Deletion URL: https://cvscan.com/delete-account
Support: support@cvscan.com
```

---

## 4. Google Play License Testing (For Billing Review)

To allow Play reviewers to exercise the in-app purchase flow without real charges:

1. In Play Console → **Monetisation setup → License testing**, add `reviewer@cvscan-test.com` as a licence tester.
2. This user will see the standard payment UI but all transactions will complete without charging.
3. The webhook at `POST /api/billing/play/webhook` will receive `SUBSCRIPTION_PURCHASED` / `ONE_TIME_PRODUCT_PURCHASED` events with test tokens — these will be processed normally by the billing engine.

> **Note:** The pre-loaded credit balance means reviewers can test generation features without going through purchase at all. The licence testing configuration is a belt-and-suspenders measure for reviewers who wish to test the purchase flow specifically.

---

## 5. Constraints

- No reviewer bypass code committed to the codebase
- Test account seeded via Supabase ops, not application logic
- Credits granted via `admin_grant` transaction type for clear audit trail
- Test account credentials stored securely (e.g. 1Password / Bitwarden) — not in the repository
- Reviewer credentials rotated after each review window
