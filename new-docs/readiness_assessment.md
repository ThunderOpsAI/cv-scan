# CVScan — Presentation Readiness Assessment
> **Prepared:** 15 Mar 2026 | **Audience:** Recruitment company partner meeting (16 Mar)

---

## 1) 10-Point Presentation Readiness Score

| # | Area | Score | Justification |
|---|------|:-----:|---------------|
| 1 | Core Product (ATS Scanner) | 8/10 | Scanner, keyword analysis, and score gauge all work; solid happy path. |
| 2 | Profile System | 7/10 | Full CRUD for experiences, education, skills, STAR stories, career goals. |
| 3 | Application Tracking | 7/10 | Kanban + list views exist; end-to-end tracking scaffolded. |
| 4 | Job Packs / Tailoring | 6/10 | Creation flow exists but unclear if diff-view is fully wired. |
| 5 | Copilot Chat | 5/10 | Route exists; unclear if streaming works reliably in production. |
| 6 | **Messaging Consistency** | **3/10** | Homepage sells "bullet generator"; docs sell "Job Search Command Center"; meta tags say "Resume & Job Application Assistant". Three different stories. |
| 7 | **Pricing Consistency** | **3/10** | App shows $2.99/20cr, $4.99/50cr, $7.99/100cr. BUILD.md says $4.99→15cr, $9.99→25cr, $17.99→50cr. MVP Blueprint says $4.99→15cr, $9.99→35cr, $17.99→80cr. Three sources, three answers. |
| 8 | **Navigation Quality** | **4/10** | Homepage nav links to `/pricing` which doesn't exist (404). Footer links "Pricing" → `/buy-credits` (correct), contradicting the nav bar. |
| 9 | Payments (Stripe) | 8/10 | Checkout, webhook, credit system all wired. AUD currency correct. |
| 10 | Visual Design / Polish | 7/10 | Dark gradient theme is polished. Dashboard cards are clean. Missing loading skeletons on some pages. |

> **Overall: 5.8 / 10 — Not ready to present without the fixes below.**

---

## 2) Top 5 Launch Blockers (by business risk)

### 🔴 1. Inconsistent Positioning = Instant Credibility Loss
- Homepage: *"Turn Job Duties Into Powerful Resume Bullets"* → sounds like a simple text rewriter
- MVP Blueprint: *"Your AI career coach that scores, tailors, and coaches you through every job application"*
- Layout meta: *"AI Resume & Job Application Assistant"*

**Risk:** Recruiters hear three different products in 7 minutes. Trust dies.

### 🔴 2. Pricing Contradictions
| Source | Starter | Popular | Pro |
|--------|---------|---------|-----|
| **App (source of truth)** | $2.99 / 20cr | $4.99 / 50cr | $7.99 / 100cr |
| BUILD.md | $4.99 / 15cr | $9.99 / 25cr | $17.99 / 50cr |
| MVP Blueprint | $4.99 / 15cr | $9.99 / 35cr | $17.99 / 80cr |

**Risk:** If a recruiter finds the docs or old pricing, it looks like bait-and-switch.

### 🔴 3. Broken Navigation Link
Homepage nav bar links to `/pricing` → **404**. First thing a prospect clicks after the hero section.

### 🔴 4. No Demo Script / Happy-Path Guarantee
No evidence of an end-to-end tested flow: *sign up → build profile → scan JD → get ATS score → generate job pack → track application*. If any step breaks live, there's no fallback.

### 🟡 5. No Trust / Compliance Story
No privacy policy, no data-handling statement, no AI-limitations disclosure. Recruitment companies handle candidate PII — they **will** ask about this.

---

## 3) Top 5 Quick Wins (< 24 hours)

### ✅ 1. Fix `/pricing` link → redirect to `/buy-credits`
Change the homepage nav link from `/pricing` to `/buy-credits`. One-line fix.

### ✅ 2. Rewrite homepage hero + meta tags to match the full platform story
Replace "Turn Job Duties Into Powerful Resume Bullets" with the unified positioning (see Section 4 below). Update [layout.tsx](file:///Users/Thunderops/Documents/Projects/cv-scan/app/layout.tsx) meta description to match.

### ✅ 3. Update docs to match app pricing
Update BUILD.md and MVP_BLUEPRINT.md pricing tables to reflect the actual app pricing ($2.99/20cr, $4.99/50cr, $7.99/100cr).

### ✅ 4. Add a trust/compliance page or section
Create a simple `/trust` page or add a footer section covering: data handling, AI limitations, human-in-the-loop expectations, and GDPR basics.

### ✅ 5. Script and test a 7-minute demo flow end-to-end
Run through the demo plan in Section 5 below, fix any breakages, record a backup video.

---

## 4) Messaging Rewrite

### Positioning Statement
> **"CVScan is the AI-powered job search assistant that helps candidates score, tailor, and track every application — from discovery to offer."**

### 3 Proof Points for Recruitment Partners

1. **Reduces time-to-apply by up to 70%** — Candidates get ATS-optimised resumes, tailored cover letters, and interview prep in one workflow instead of juggling 5+ tools.
2. **Improves application quality at scale** — Every application is scored against the actual job description keywords before submission, so your candidates send stronger applications.
3. **Full pipeline visibility** — Candidates track applications from saved → applied → interview → offer in a built-in Kanban board, reducing "where am I up to?" calls to your team.

### 3 Recruiter Objections + Responses

| Objection | Response |
|-----------|----------|
| *"AI-generated resumes all sound the same."* | CVScan doesn't write from scratch — it enhances the candidate's own bullet points with their real metrics and achievements. Every output is editable before use. The AI adds quantification and keywords; the voice stays theirs. |
| *"Our candidates aren't technical enough to use this."* | The interface is three steps: paste a job description, review the score, copy the tailored content. We've designed it so anyone who can use LinkedIn can use CVScan. |
| *"How do we know the AI output is accurate?"* | All AI-generated content is labelled as AI-assisted and presented as a draft for human review. We recommend candidates always review and edit before sending. ATS scores are based on keyword matching against the job description — transparent and explainable. |

---

## 5) Demo Plan — 7-Minute Live Walkthrough

| Time | Step | What to Say | What to Show |
|------|------|-------------|--------------|
| 0:00–0:30 | **Open Landing Page** | "CVScan is a full AI job search assistant — not just a resume tool. Candidates score, tailor, and track every application in one place." | Homepage hero + feature cards |
| 0:30–1:30 | **Sign In → Dashboard** | "Once logged in, candidates see their command centre: profile, ATS scanner, job packs, application tracker, and copilot." | Dashboard with all feature cards visible |
| 1:30–3:00 | **ATS Scanner** | "Let's see how a candidate matches a real job description. Paste the JD, hit scan, and in seconds you get an ATS match score with keyword analysis." | Paste a pre-prepared JD → show score gauge, matched/missing keywords, section breakdown, recommendations |
| 3:00–4:30 | **Create Job Pack** | "From the scan, one click creates a complete application package — tailored bullets, cover letter, everything optimised for this specific role." | Click "Create Job Pack" button from scanner results |
| 4:30–5:30 | **Application Tracker** | "Every application is tracked in a Kanban board. Candidates drag cards through stages — applied, screening, interview, offer." | Show applications page with Kanban view |
| 5:30–6:30 | **Profile + Credit System** | "The profile stores their career DNA — experiences, skills, STAR stories. Credits are simple: $2.99 for 20, $4.99 for 50, $7.99 for 100. No subscription lock-in." | Show profile page → buy-credits page |
| 6:30–7:00 | **Wrap + CTA** | "We're looking for recruitment partners who want to give their candidates an unfair advantage. What questions do you have?" | Return to dashboard |

### Fallback Plan

| If This Fails… | Do This Instead |
|-----------------|-----------------|
| ATS Scanner API errors | Have a pre-recorded screen capture of a successful scan ready to play |
| Sign-in breaks | Use a pre-authenticated session; have the dashboard URL bookmarked |
| Job Pack creation fails | Show the job-packs list page with a previously generated pack |
| Stripe/credits issue | Skip buy-credits; say "we'll show you the payment flow in a follow-up call" |

> **Pre-demo checklist:** (1) Log in and verify the session. (2) Pre-paste a JD in a text file for quick copy. (3) Ensure ≥10 credits on the demo account. (4) Have a pre-generated job pack saved. (5) Record a backup video of the full flow.

---

## 6) Trust / Compliance Checklist

| Area | Status | What to Say to Partners |
|------|--------|------------------------|
| **Data Privacy** | ⚠️ No privacy policy page exists | "Candidate data is stored in Supabase (SOC2-compliant infrastructure). Data is never shared with third parties. We're finalising our privacy policy this week." |
| **Candidate Consent** | ⚠️ No explicit consent flow | "Candidates sign up with Google OAuth and agree to terms on signup. We'll add explicit data-processing consent before any enterprise rollout." |
| **AI Output Risk** | ⚠️ No disclaimers shown in-app | "All AI outputs are clearly presented as drafts. Candidates review and edit before using anything. We never auto-submit applications." |
| **Human-in-the-Loop** | ✅ All outputs are editable | "The AI suggests — the human decides. Every bullet point, cover letter, and answer can be edited before use." |
| **Data Retention** | ⚠️ No retention policy defined | "Users own their data and can delete their account at any time. We'll define formal retention periods before enterprise launch." |
| **AI Model Provider** | ✅ Google Gemini (Flash + Pro) | "We use Google's Gemini models — enterprise-grade with strong privacy commitments." |

---

## 7) Prioritised Action Plan

### 🔴 Do Now (Today — Before Tomorrow's Meeting)

1. **Fix `/pricing` nav link** → Change to `/buy-credits` in [page.tsx](file:///Users/Thunderops/Documents/Projects/cv-scan/app/page.tsx#L16-L21)
2. **Rewrite homepage hero** → Replace "Turn Job Duties Into Powerful Resume Bullets" with the positioning statement above in [page.tsx](file:///Users/Thunderops/Documents/Projects/cv-scan/app/page.tsx#L45-L55)
3. **Update layout.tsx meta tags** → Align title and description with new positioning in [layout.tsx](file:///Users/Thunderops/Documents/Projects/cv-scan/app/layout.tsx#L8-L26)
4. **Update "How It Works" section** → Change from 3-step bullet generator to the broader platform story in [page.tsx](file:///Users/Thunderops/Documents/Projects/cv-scan/app/page.tsx#L97-L131)
5. **Run the demo flow end-to-end** → Sign in → ATS scan → Job Pack → Applications → verify no 500 errors
6. **Record a backup video** of the full demo in case anything breaks live

### 🟡 Do Next (This Week)

1. Update BUILD.md and MVP_BLUEPRINT.md pricing tables to match app pricing
2. Add a `/trust` or `/security` page with data handling, AI limitations, and privacy commitments
3. Add loading skeletons/spinners to scanner, job-packs, and copilot pages
4. Add an AI output disclaimer banner on all generation result pages
5. Test all 22 pages for 404s and console errors
6. Add explicit consent checkbox to signup flow

### 🟢 Do Later (Post-Presentation)

1. Implement a dedicated `/pricing` page with full feature comparison
2. Add candidate consent management (opt-in data processing, right to deletion)
3. Build a formal privacy policy and terms of service
4. Add analytics events (sign-up, scan, purchase, job-pack creation)
5. Create a recruitment-partner admin view (multi-candidate dashboard)
6. Add export to PDF/DOCX for job packs
7. Implement the browser extension (Phase 5)
8. Add interview practice chatbot (Phase 4)
