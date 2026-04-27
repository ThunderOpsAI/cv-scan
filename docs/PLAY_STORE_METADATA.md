# CVScan — Play Store Metadata

> **Status:** Ready for transcription to Play Console (pending final asset upload)
> **Prepared by:** Agent 6 — April 2026
> **Target track:** Internal → Closed Beta (AU/NZ)

---

## 1. Short Description (≤ 80 characters)

```
AI resume scorer, tailor, and cover letter generator for every job.
```

*Alternate (if character count permits):*
```
Land more interviews with AI-powered resume tailoring & scoring.
```

---

## 2. Long Description (≤ 4,000 characters)

```
CVScan is your AI-powered career coach — built to help you score, 
tailor, and land your dream job faster.

Stop guessing why your resume isn't getting callbacks. CVScan reads 
your resume and the job description, then gives you an instant ATS 
fit score plus a clear action plan to close the gap. Every 
generation is grounded in your verified Career Memory — so outputs 
are accurate, on-brand, and genuinely yours.

──────────────────────────────
WHAT YOU CAN DO
──────────────────────────────

▸ RESUME SCORER
  Upload or paste your resume and a job description. Get an 
  instant ATS compatibility score, keyword gap analysis, and 
  specific improvement suggestions.

▸ RESUME TAILOR
  Automatically rewrite and tailor resume bullet points to match 
  the language and priorities of any specific role — without 
  fabricating experience.

▸ COVER LETTER GENERATOR
  Generate tailored, professional cover letters in seconds. 
  Grounded in your real career history, never generic.

▸ CAREER MEMORY
  Build a private, verified profile of your career facts — skills, 
  experience, education, and goals. Every AI output draws from this 
  source of truth, keeping your applications consistent and honest.

▸ JOB FIT ANALYSIS
  Paste any job description and get a detailed compatibility 
  breakdown: your strengths, your gaps, and what to highlight 
  in your application.

▸ JOB PACK GENERATOR
  Generate a complete application pack — tailored resume bullets, 
  cover letter, and interview prep — for any job in one tap.

▸ INTERVIEW COPILOT
  Practice answering interview questions with AI-generated STAR 
  story suggestions based on your real experience.

▸ RESUME SCANNER (OCR)
  Scan a physical resume using your camera — no typing required. 
  Extract and import your existing resume content into your 
  Career Memory automatically.

──────────────────────────────
BUILT FOR PRIVACY
──────────────────────────────

Your data stays yours. Resume content and career facts are stored 
in strictly isolated, owner-only storage. We do not sell your 
personal data or use your information to train AI models.

Full account deletion is available at any time — directly in the 
app or at cvscan.com/delete-account.

──────────────────────────────
PLANS & CREDITS
──────────────────────────────

CVScan uses a credit system. New accounts include free starter 
credits. Additional credits can be purchased via Google Play. 
Purchased credits do not expire.

──────────────────────────────

For support, visit cvscan.com or email support@cvscan.com.
Privacy Policy: cvscan.com/privacy
Terms of Service: cvscan.com/terms
Account Deletion: cvscan.com/delete-account
```

**Character count:** ~2,400 of 4,000 ✅

---

## 3. Release Notes Template

### Closed Beta — Initial Release (v0.1.0)

```
Welcome to the CVScan closed beta!

This is our first beta build. We're testing core features 
end-to-end before our wider launch.

What's included in this build:
• Resume scoring & ATS fit analysis
• Resume tailoring & bullet generation
• Cover letter generator
• Career Memory profile builder
• Job Fit analysis
• Job Pack generator
• Interview Copilot
• Resume Scanner (OCR)
• Credit purchase via Google Play

Known limitations in this beta build:
• Some UI elements are pending final polish
• Support contact is email-only (in-app chat coming)

Found a bug? Email beta@cvscan.com with your device model 
and a description of the issue. Thank you for helping us 
test!
```

### Production Release Notes Template (v1.0.0)

```
CVScan 1.0 — General Availability

We're live! Thank you to our beta testers. Here's what's 
included in our 1.0 release:

[INSERT key highlights from beta → 1.0 improvements]

• Improved ATS scoring accuracy
• Faster cover letter generation
• Refined onboarding experience
• Bug fixes reported by beta testers

Questions? Visit cvscan.com or email support@cvscan.com.
```

---

## 4. Store Asset Requirements

### 4.1 App Icon

| Asset | Spec | Format |
|---|---|---|
| High-res icon | **512 × 512 px** | PNG, no alpha, no rounded corners (Play adds masking) |
| Adaptive icon foreground | **108 × 108 dp** (export at 432 × 432 px for xxxhdpi) | PNG with transparency |
| Adaptive icon background | **108 × 108 dp** | PNG, solid colour or simple pattern |

> **Design note:** Icon should be usable on both light and dark wallpapers. Avoid thin strokes below 4dp.

---

### 4.2 Feature Graphic

| Asset | Spec | Format |
|---|---|---|
| Feature graphic | **1,024 × 500 px** | JPG or PNG (≤ 1 MB) |

> Shown at the top of the Play Store listing. Keep text minimal — most users see it cropped on small screens. Avoid placing important content in the outer 10% margins.

---

### 4.3 Screenshots

Google Play **requires** at least 2 screenshots per device type. For beta, target phone only.

| Device Type | Required Dimensions | Notes |
|---|---|---|
| Phone (portrait) | **1080 × 1920 px** (or any 16:9 ratio) | Minimum 2, maximum 8 |
| Phone (landscape) | **1920 × 1080 px** | Optional for beta |
| 7-inch tablet | **1200 × 1920 px** | Optional for beta |
| 10-inch tablet | **1600 × 2560 px** | Optional for beta |
| Chromebook | **1280 × 800 px** | Optional |

**Recommended screenshot set (minimum viable for closed beta):**

| # | Screen | Content |
|---|---|---|
| 1 | Onboarding / Home | Value proposition — "Your AI career coach" |
| 2 | Resume Scorer | Fit score result with keyword analysis |
| 3 | Cover Letter output | Generated letter preview |
| 4 | Career Memory / Profile | Profile builder view |
| 5 | Job Pack | Full application pack result |
| 6 | Pricing / Credits | Plan selection or credit store |

> **Format:** PNG preferred. Max file size: 8 MB per image. No device frames required by Play (but recommended for visual context).

---

### 4.4 Promo Video (Optional for Beta)

| Asset | Spec |
|---|---|
| YouTube URL | Unlisted video accepted. 30–120 seconds recommended. |
| Thumbnail | Auto-generated from video or custom 1,280 × 720 px |

---

## 5. Play Console Listing Fields

| Field | Value |
|---|---|
| App name | `CVScan — AI Resume Coach` |
| Developer name | [Product Owner to confirm] |
| Category | **Productivity** |
| Tags | resume, career, jobs, AI, cover letter |
| Content rating | Everyone (no violence, no mature content) |
| Privacy Policy URL | `https://cvscan.com/privacy` |
| Support URL | `https://cvscan.com` or `mailto:support@cvscan.com` |
| External deletion URL | `https://cvscan.com/delete-account` ✅ |
| App website | `https://cvscan.com` |

---

## 6. Data Safety Form Summary

> Transcribe directly from Agent 5 Handover, Section 3.4 of `AGENT_HANDOVER.md`.

| Question | Answer |
|---|---|
| Does your app collect or share any of the required user data types? | **Yes** |
| Is all user data encrypted in transit? | **Yes** |
| Do you provide a way for users to request data deletion? | **Yes** — In-app and at `https://cvscan.com/delete-account` |
| Financial info collected? | **Yes** — credit history. Shared with Stripe (web), Google Play (Android) |
| Personal info collected? | **Yes** — name, email, location, phone, profile photo |
| Health and fitness data? | **No** |
| Messages collected? | **No** |
| Photos and videos collected? | **Yes** — resume file uploads (PDF/DOCX). Purpose: Core functionality |
| App activity collected? | **Yes** — feature usage analytics. Purpose: Analytics |
| Device or other IDs collected? | **No** |
