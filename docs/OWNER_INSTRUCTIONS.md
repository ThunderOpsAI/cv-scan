# CVScan — Owner Instructions

> **Agent:** Agent 4 — Phase 3 (Polish + Play Store Readiness)
> **Date:** April 28, 2026
> **Purpose:** Everything you need to do manually before submitting to Google Play.

---

## Section 1: Environment & Secrets

### Required Environment Variables

All secrets must be set in **Vercel** (project → Settings → Environment Variables) for production, and in `app/.env.local` for local development.

| Variable | Where | Required? | Notes |
|----------|-------|-----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel + local | ✅ Yes | Your Supabase project URL (e.g. `https://xxx.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel + local | ✅ Yes | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel only | ✅ Yes | **Never expose client-side.** Used for admin operations (delete account, credit seeding). |
| `NEXTAUTH_SECRET` | Vercel + local | ✅ Yes | Generate with `openssl rand -base64 32`. Must be stable across deploys. |
| `NEXTAUTH_URL` | Vercel + local | ✅ Yes | `https://cvscan.com.au` in production. `http://localhost:3000` locally. |
| `GOOGLE_CLIENT_ID` | Vercel + local | Optional | Google OAuth client ID (if offering Google sign-in). |
| `GOOGLE_CLIENT_SECRET` | Vercel + local | Optional | Google OAuth client secret. |
| `STRIPE_SECRET_KEY` | Vercel only | ✅ Yes | Stripe secret key. Use `sk_test_...` for test mode, `sk_live_...` for production. |
| `STRIPE_PUBLISHABLE_KEY` | Vercel + local | ✅ Yes | Stripe publishable key. |
| `STRIPE_WEBHOOK_SECRET` | Vercel only | ✅ Yes | Webhook signing secret from Stripe dashboard. |
| `STRIPE_PRICE_STARTER` | Vercel only | ✅ Yes | Stripe Price ID for Starter subscription tier. |
| `STRIPE_PRICE_PRO` | Vercel only | ✅ Yes | Stripe Price ID for Pro subscription tier. |
| `STRIPE_PRICE_ENTERPRISE` | Vercel only | Optional | Stripe Price ID for Enterprise tier (if applicable). |
| `GEMINI_API_KEY` | Vercel only | ✅ Yes | Google Gemini API key for AI generation. |
| `OPENAI_API_KEY` | Vercel only | ✅ Yes | OpenAI API key for AI generation. |
| `RESEND_API_KEY` | Vercel only | ✅ Yes | Resend API key for magic-link sign-in emails. |
| `EMAIL_FROM` | Vercel only | Optional | Sender address for magic-link emails. Default: `noreply@cvscan.com.au`. |
| `NEXT_PUBLIC_APP_URL` | Vercel + local | Optional | App base URL. Default: `https://cvscan.com.au`. |

### API Keys That Need Rotation or Creation

- **Resend:** Create a Resend account at [resend.com](https://resend.com), verify your `cvscan.com.au` domain, and generate an API key.
- **Stripe:** If still using test keys (`sk_test_...`), create live keys and update all `STRIPE_*` variables when ready for real payments.
- **Gemini / OpenAI:** Rotate keys if they were previously shared with other projects or agents.

### What's Vercel-Only vs Local

- All `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and AI API keys should **only** be in Vercel (and your local `.env.local` for development). Never commit these to git.
- `NEXT_PUBLIC_*` keys are safe in both environments since they're designed to be public.

---

## Section 2: Domain & DNS

### Step 1: Verify `cvscan.com.au` Is Live

```bash
# Check DNS resolution
curl -I -L https://cvscan.com.au

# Expected: HTTP/2 200 with Vercel headers
```

If the domain is not resolving:

1. Log in to your domain registrar for `cvscan.com.au`
2. Add/verify the following DNS records pointing to Vercel:
   - **A record:** `76.76.21.21`
   - **CNAME record:** `cname.vercel-dns.com` (for `www` subdomain if desired)
3. In **Vercel** → Project → Settings → Domains:
   - Add `cvscan.com.au` as the primary domain
   - Add `www.cvscan.com.au` (optional, redirects to root)
4. Wait for DNS propagation (typically 5–30 minutes)

### Step 2: SSL Certificate

Vercel automatically provisions and manages SSL certificates. After adding the domain:

1. Check the domain status in Vercel → Settings → Domains
2. Confirm the SSL column shows ✅ (auto-provisioned via Let's Encrypt)
3. Verify HTTPS works: `curl -I https://cvscan.com.au/privacy`

### Step 3: Verify Critical URLs

After domain is live, confirm all three mandatory Play Store URLs return `200`:

```bash
curl -o /dev/null -sw '%{http_code}' https://cvscan.com.au/privacy
curl -o /dev/null -sw '%{http_code}' https://cvscan.com.au/terms
curl -o /dev/null -sw '%{http_code}' https://cvscan.com.au/delete-account
```

All three must return `200`.

---

## Section 3: Supabase Operations

### Seed Reviewer Account

Run the following in Supabase SQL Editor (or via Admin API). **Do not commit this to the codebase.**

```sql
-- 1. Create the user via Supabase Dashboard → Authentication → Users → Add User
--    Email: reviewer@cvscan-test.com
--    Password: generate a strong random password and store in 1Password/Bitwarden
--    NOTE: The auth.users row is created automatically by the dashboard.

-- 2. After creating the auth user, note their UUID from the dashboard.

-- 3. Seed the public.users row (replace <auth_user_uuid> with the actual UUID):
INSERT INTO public.users (id, email, name, created_at, updated_at)
VALUES (
  '<auth_user_uuid>',
  'reviewer@cvscan-test.com',
  'Play Reviewer',
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;

-- 4. Grant 500 review credits:
INSERT INTO credit_transactions (user_id, amount, type, description, created_at)
VALUES (
  '<auth_user_uuid>',
  500,
  'admin_grant',
  'Pre-loaded review credits for Google Play review team',
  now()
);

-- 5. Verify final balance:
SELECT SUM(amount) AS balance FROM credit_transactions WHERE user_id = '<auth_user_uuid>';
-- Expected: 500
```

### Verify RLS Policies

```sql
-- Check that RLS is enabled on key tables:
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('users', 'credit_transactions', 'profile_facts', 'generations');
-- All rows should show rowsecurity = true

-- Verify storage bucket RLS:
SELECT id, name, public FROM storage.buckets WHERE name = 'resume_uploads';
-- Should show public = false
```

### Verify Storage Bucket Permissions

1. Go to Supabase Dashboard → Storage → `resume_uploads` bucket
2. Confirm the bucket is **not public**
3. Confirm RLS policies exist that restrict access to `auth.uid() = (storage.foldername(name))[1]`

### Set Up analytics_events TTL (If Not Done)

A SQL script is provided at `app/database/phase-0-analytics-retention.sql`. Run it in the Supabase SQL Editor to create the 12-month purge function:

```sql
-- Run this in Supabase SQL Editor:
-- Copy contents from app/database/phase-0-analytics-retention.sql
-- Then optionally schedule with pg_cron:
-- SELECT cron.schedule('purge-old-analytics', '0 3 1 * *', $$SELECT purge_old_analytics_events(interval '12 months')$$);
```

---

## Section 4: Stripe Configuration

### Webhook Endpoint URL

Configure the following webhook in Stripe Dashboard → Developers → Webhooks:

| Field | Value |
|-------|-------|
| **Endpoint URL** | `https://cvscan.com.au/api/stripe/webhook` |
| **API version** | `2024-06-20` (or latest) |
| **Signing secret** | Copy to `STRIPE_WEBHOOK_SECRET` env var |

### Required Webhook Events

Subscribe to these events:

- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`

### Test Mode vs Live Mode

1. **Before launch:** Use test mode keys (`sk_test_...`, `pk_test_...`)
2. **For Google Play reviewer:** The reviewer account has pre-loaded credits, so they won't need to make actual payments
3. **When ready for real payments:**
   - Create live pricing in Stripe Dashboard → Products
   - Generate live API keys
   - Update all `STRIPE_*` env vars in Vercel
   - Create a live webhook endpoint with the same URL
   - Test a real purchase with your own card before going live

### Create Subscription Products

In Stripe Dashboard → Products, create:

| Product | Price Type | Recommended Price |
|---------|-----------|------------------|
| CVScan Starter | Recurring (monthly) | $4.99/month |
| CVScan Pro | Recurring (monthly) | $14.99/month |
| CVScan Enterprise | Recurring (monthly) | $29.99/month |

Copy each Price ID to the corresponding `STRIPE_PRICE_*` env var.

---

## Section 5: Google Play Console

### Step-by-Step Play Console Setup

#### 5.1 Create the App

1. Go to [play.google.com/console](https://play.google.com/console)
2. Click **"Create app"**
3. Fill in:
   - **App name:** `CVScan — AI Resume Coach`
   - **Default language:** English (Australia)
   - **App or game:** App
   - **Free or paid:** Free (with in-app purchases)
4. Accept the declarations and click **"Create app"**

#### 5.2 Complete the Store Listing

Copy the listing content from `docs/PLAY_STORE_METADATA.md`:

| Field | Source |
|-------|--------|
| App name | `CVScan — AI Resume Coach` |
| Short description | Section 1 of `PLAY_STORE_METADATA.md` |
| Full description | Section 2 of `PLAY_STORE_METADATA.md` |
| Category | **Productivity** |
| Tags | resume, career, jobs, AI, cover letter |

#### 5.3 Enter Reviewer Credentials

1. Go to **App Content → App access**
2. Select **"All or some functionality is restricted"**
3. Click **"+ Add new instructions"**
4. Copy the reviewer instructions verbatim from `docs/REVIEWER_ACCESS.md` Section 3
5. Save

#### 5.4 Set Up Closed Testing Track

1. Go to **Testing → Closed testing**
2. Click **"Create track"** → name it `beta-au-nz`
3. Under **"Testers"**, create a new testers list
4. Add tester email addresses (minimum 12 — see Section 7 below)
5. Keep the track in **"Closed"** mode

#### 5.5 Add Licence Testers

1. Go to **Settings → License testing**
2. Add `reviewer@cvscan-test.com` to the licence testers list
3. This allows the reviewer to make test purchases without charge

#### 5.6 Upload AAB

1. Go to **Testing → Closed testing → beta-au-nz → Releases**
2. Click **"Create new release"**
3. If using Google-managed signing: click **"Continue"** on the app signing prompt
4. Upload the `.aab` file
5. Enter release notes from `PLAY_STORE_METADATA.md` Section 3
6. Click **"Review release"** → **"Start rollout"**

#### 5.7 Content Rating Questionnaire

1. Go to **App Content → Content rating**
2. Start the **IARC questionnaire**
3. Answer all questions — expected rating: **Everyone**
4. Key answers:
   - Violence: No
   - Sexual content: No
   - Language: No
   - Controlled substances: No
   - User-generated content: No (AI-generated content is controlled)

#### 5.8 Data Safety Form

1. Go to **App Content → Data safety**
2. Transcribe answers from `docs/PLAY_STORE_METADATA.md` Section 6:

| Question | Answer |
|----------|--------|
| Does your app collect or share user data? | Yes |
| Is all user data encrypted in transit? | Yes |
| Can users request deletion? | Yes — in-app and at `https://cvscan.com.au/delete-account` |
| Financial info collected? | Yes — credit history. Shared with Stripe (web), Google Play (Android) |
| Personal info collected? | Yes — name, email, location, phone, profile photo |
| Photos/videos collected? | Yes — resume uploads (PDF/DOCX). Purpose: core functionality |
| App activity collected? | Yes — feature usage analytics. Purpose: analytics |
| Device or other IDs? | No |

---

## Section 6: Design Assets Needed

### App Icon (512×512 PNG)

**Spec:**
- **Size:** 512 × 512 px
- **Format:** PNG, no alpha channel, no rounded corners (Play adds masking)
- **Design direction:** Dark background with the "CV" monogram in cyan-to-violet gradient, matching the app's premium dark theme
- **Do not:** Use thin strokes below 4dp, include text other than the monogram

If you don't have a designer, use the following prompt in an image generation tool:
> "A minimal, premium app icon at 512x512px. Dark navy/charcoal background. Bold 'CV' monogram in the centre using a cyan-to-violet gradient. Clean, modern, no borders. Flat design suitable for adaptive icon format."

### Feature Graphic (1024×500)

**Spec:**
- **Size:** 1024 × 500 px
- **Format:** JPG or PNG (≤ 1 MB)
- **Design direction:** Dark premium background with subtle gradient mesh. Include the app name "CVScan" and tagline "AI Resume Coach". Keep text minimal — most is cropped on mobile. Avoid critical content in the outer 10% margins.

### Screenshots (Minimum 2)

**Spec:**
- **Size:** 1080 × 1920 px (16:9 portrait)
- **Minimum:** 2, recommended 4–6
- **Format:** PNG (max 8 MB each)

**How to capture:**

1. Deploy the latest code to Vercel
2. Open Chrome DevTools → Toggle Device Toolbar → Select "Pixel 7" (or any 1080×1920 device)
3. Sign in with a test account that has credits
4. Capture these screens:
   - **Screenshot 1:** Landing page (the premium hero)
   - **Screenshot 2:** Dashboard (with insight cards visible)
   - **Screenshot 3:** Scanner page (with scan results / score gauge)
   - **Screenshot 4:** Cover letter generation (with before/after comparison)
   - **Screenshot 5:** Interview simulator (with chat messages)
   - **Screenshot 6:** Buy credits page

> **Tip:** Use [screely.com](https://screely.com) or [shots.so](https://shots.so) to add device frames around your screenshots for a premium look — but Play Store does not require frames.

---

## Section 7: Beta Tester Recruitment

### How Many Testers

- **Minimum:** 12 opted-in testers
- **Recommended:** 15 (12 + 3 reserves for dropouts)
- **Google requirement:** 12 testers must confirm opt-in before the 14-day closed beta clock becomes meaningful

### Where to Recruit

1. **Personal network:** Friends, family, colleagues who are job-seeking or career-curious
2. **LinkedIn:** Post asking for AU/NZ beta testers
3. **Reddit:** r/resumes, r/cscareerquestions, r/australia
4. **Discord:** Job-search or career development communities
5. **Email list:** If you have a waitlist from the landing page

### How to Send Invites

1. In Play Console → Testing → Closed testing → beta-au-nz
2. Copy the **opt-in URL** from the testers section
3. Send to each tester with a brief message:

```
Hi! I'm looking for beta testers for CVScan — an AI resume coach app.

You'll get early access and your feedback will shape the product.

To join the beta:
1. Open this link on your Android device: [opt-in URL]
2. Click "Become a tester"
3. Install the app from the Play Store listing

Please email beta@cvscan.com.au if you hit any issues.
Thanks!
```

### 14-Day Clock Tracking

- **Day 0:** Record the date when 12+ testers have confirmed opt-in
- **Day 14:** You are eligible to submit for production review
- **Track in:** A simple spreadsheet or note:
  - `Beta start date: [DATE]`
  - `Eligible for production: [DATE + 14]`
  - `Testers confirmed: [COUNT]`

---

## Section 8: DPA & Legal Actions

### Data Processing Agreements Required

Before going live with real user data, confirm DPA status with AI sub-processors:

| Provider | Data Sent | DPA Required? | How to Obtain |
|----------|-----------|---------------|---------------|
| **Google Gemini** | Resume text, job descriptions | ✅ Yes | Visit [cloud.google.com/terms/data-processing-addendum](https://cloud.google.com/terms/data-processing-addendum). Sign the standard GCP DPA if using Gemini via Vertex AI, or review the API-specific terms at [ai.google.dev/terms](https://ai.google.dev/terms). |
| **OpenAI** | Resume text, job descriptions | ✅ Yes | Visit [openai.com/policies/data-processing-addendum](https://openai.com/policies/data-processing-addendum). For API usage, data is not used for training by default — but confirm the DPA covers your use case. |

### What If DPA Cannot Be Obtained

| Scenario | Action |
|----------|--------|
| DPA is available and signed | ✅ Proceed to launch |
| DPA is available but pending signature | ⚠️ You can launch the closed beta if all data is being processed under standard API terms (which typically include adequate data protection), but sign the DPA before open/production release |
| DPA cannot be obtained | 🚫 You must either (a) formally accept the risk and document your reasoning, or (b) remove that provider and use only the provider with confirmed DPA status |

### Current Status

- **BA-1 (CRITICAL):** No DPA artifacts exist in the repo. Owner must confirm Google Gemini and OpenAI DPA status before production launch.
- **BA-3 (HIGH):** No authoritative AI sub-processor retention-window proof in repo. Verify with each provider's DPA documentation.

---

## Section 9: Go/No-Go Checklist

Run through this checklist before clicking **"Submit for Review"** in Play Console. Every item must be ✅ or have a documented risk acceptance.

| # | Check | Done? |
|---|-------|-------|
| 1 | `cvscan.com.au` resolves and returns 200 on `/`, `/privacy`, `/terms`, `/delete-account` | ☐ |
| 2 | All environment variables are set in Vercel (Section 1) | ☐ |
| 3 | Magic-link email sign-in works end-to-end (send link → receive email → click → land on dashboard) | ☐ |
| 4 | Google sign-in works (if enabled) | ☐ |
| 5 | Credit purchase works in Stripe test mode (checkout → webhook → credits appear) | ☐ |
| 6 | Reviewer account `reviewer@cvscan-test.com` can sign in and has 500 credits | ☐ |
| 7 | At least one generation (bullets, cover letter, or scan) completes successfully with credits deducted | ☐ |
| 8 | Account deletion works (Dashboard → Profile → Delete Account removes all data) | ☐ |
| 9 | No placeholder text visible on any page ("TODO", "Lorem ipsum", "test") | ☐ |
| 10 | No debug logging or hardcoded secrets in the codebase | ☐ |
| 11 | DPA agreements with Gemini and OpenAI are confirmed or risk-accepted (Section 8) | ☐ |
| 12 | Stripe webhook is configured at `https://cvscan.com.au/api/stripe/webhook` | ☐ |
| 13 | Store listing content is transcribed from `PLAY_STORE_METADATA.md` | ☐ |
| 14 | App icon (512×512) and feature graphic (1024×500) are uploaded | ☐ |
| 15 | At least 2 phone screenshots (1080×1920) are uploaded | ☐ |
| 16 | Content rating questionnaire is completed | ☐ |
| 17 | Data safety form is completed (Section 5.8) | ☐ |
| 18 | Reviewer instructions are entered in Play Console (Section 5.3) | ☐ |
| 19 | Closed testing track has 12+ confirmed testers | ☐ |
| 20 | 14-day closed beta clock has elapsed | ☐ |
| 21 | Reviewer email added to licence tester list | ☐ |
| 22 | AAB is uploaded and release notes are entered | ☐ |
| 23 | `npm run build` exits 0 with no TypeScript errors | ☐ |

**If any item is ☐ and cannot be resolved, do NOT submit for review.** Fix the blocker or document a risk acceptance decision first.

---

## Section 10: Post-Submission

### What to Expect from Google Play Review

| Item | Detail |
|------|--------|
| **Timeline** | Typically 3–7 business days for initial review. Can be up to 14 days for the first submission. |
| **Common rejection reasons** | Missing privacy policy, unclear data safety forms, reviewer unable to sign in, broken critical flow, policy violations |
| **Review status** | Check in Play Console → Publishing overview → look for status messages |

### How to Respond to Reviewer Questions

1. Check Play Console → Publishing overview for rejection details
2. The rejection email includes specific policy citations
3. Fix the cited issues, update the release, and resubmit
4. Do NOT change the reviewer credentials between review cycles — they may continue using the same session

### When to Rotate Reviewer Credentials

- **After review approval:** Rotate the reviewer account password or disable access
- **Between review cycles:** Keep credentials stable (reviewer may re-use them)
- **For re-review:** Re-check that the reviewer account still has adequate credits (re-seed to 500 if depleted)

### How to Monitor Crash Reports

1. Play Console → Quality → Android Vitals → Crashes & ANRs
2. For the web app: Vercel → Project → Logs tab
3. Consider adding [Sentry](https://sentry.io) for structured error tracking post-launch

### Handle First User Support Emails

1. Set up a mailbox for `support@cvscan.com.au` and `beta@cvscan.com.au`
2. Expected support categories:
   - **Sign-in issues:** Check if Resend is delivering emails. Verify the user exists in Supabase.
   - **Credit questions:** Check the `credit_transactions` table for the user's balance.
   - **Generation failures:** Check Vercel logs. Usually an AI API quota or timeout issue.
   - **Account deletion:** Direct them to `https://cvscan.com.au/delete-account` or the in-app path.
3. Response time target: < 24 hours for beta, < 48 hours for production

---

## Quick Reference: Critical File Paths

| File | Purpose |
|------|---------|
| `docs/PLAY_STORE_METADATA.md` | Store listing copy, asset specs, data safety answers |
| `docs/REVIEWER_ACCESS.md` | Reviewer account setup, Play Console instructions |
| `docs/PRE_SUBMISSION_CHECKLIST.md` | 50+ item engineering checklist |
| `docs/V_REPORT.md` | Phase 0 verification results |
| `docs/LAUNCH_AGENT_HANDOVER.md` | Full agent history and blocker log |
| `app/.env.example` | Environment variable template |
| `app/database/phase-0-analytics-retention.sql` | Analytics TTL purge function |
| `app/database/schema.sql` | Database schema (reference) |
| `app/database/cvscan-full-schema.sql` | Full schema including RLS |
