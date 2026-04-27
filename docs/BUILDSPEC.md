# CVScan — Launch BuildSpec

> **Version:** 1.0 — April 27, 2026
> **Author:** Antigravity + Product Owner
> **Domain:** cvscan.com.au
> **Stack:** Next.js 16 · React 19 · Supabase · Stripe · Tailwind CSS · Vercel
> **Target:** Google Play closed beta (AU/NZ) with premium "wow factor" UX

---

## Context

CVScan has completed a 6-agent production hardening cycle (Agents 1–6) that restored auth, payments, credit gating, compliance pages, and Play Store documentation from the beta-stripped codebase. The application is functionally production-ready but visually MVP-tier.

This BuildSpec defines **4 phases (Phase 0–3)** executed by **4 agents** to:

1. Verify the existing hardening work actually runs correctly end-to-end
2. Transform the visual experience from "functional" to "premium"
3. Add signature UX moments that make users show the app to friends
4. Complete Play Store readiness and output owner instructions

### What This Replaces

This document **supersedes** the previous `docs/Build_Spec.md` (WP01–WP12 job search layer). The job search layer (URL import, screenshot-to-job, Apply/Stretch/Skip, unified tracker, saved searches) is **deferred to post-launch**. That roadmap remains valid but is not in scope for this launch cycle.

### Constraint: Tailwind CSS

The codebase uses Tailwind CSS throughout. **Do NOT convert to vanilla CSS.** All new styling must use Tailwind classes. Framer Motion may be added for animations via `npm install framer-motion`.

### Constraint: Performance

- All heavy animations must be client-side components (`"use client"`)
- Server components remain the default for data-fetching pages
- Framer Motion should be dynamically imported where possible (`next/dynamic`)
- No layout shift — skeleton loading states must match final layout dimensions
- Bundle impact of new dependencies must be noted in agent reports

### Constraint: Domain

The production domain is **cvscan.com.au** (purchased). All references to the legacy `.com` domain in existing docs should be updated to `cvscan.com.au`.

---

## Phase Map

| Phase | Agent | Focus | Outcome |
|-------|-------|-------|---------|
| **Phase 0** | Agent 1 | Baseline Verification & Hardening | Confirmed working: auth, payments, OCR scan, mobile capture, privacy policy, delete account, credit gating, domain resolution |
| **Phase 1** | Agent 2 | Visual Excellence — Landing + Dashboard | Premium landing page with Framer Motion hero, glassmorphism dashboard overhaul, premium typography, before/after interactive demo |
| **Phase 2** | Agent 3 | Magic UX — Scan + Tailor + Insights | "Magic Scan" animation, Insight Cards with actionable nudges, Tailor split-screen preview, mobile capture polish |
| **Phase 3** | Agent 4 | Polish + Play Store Readiness | Interview sim improvements, Smart Notifications, final QA, Play Store submission, **output `OWNER_INSTRUCTIONS.md`** |

---

## Phase 0 — Baseline Verification & Hardening

### Agent: Agent 1
### Objective

Verify that every production-critical system restored by Agents 1–6 actually works end-to-end in the current codebase. Do NOT assume prior agents' work is correct — test it. Fix what's broken. Document what you can't fix.

### Pre-Flight

Before testing anything:

1. Run `cd app && npm install && npm run build` — the build MUST succeed
2. Run `npm run dev` — the app MUST start without errors
3. Verify `.env.local` contains all required environment variables (see Section 7 of `docs/Agent_Handover.md`)

### Verification Checklist

#### V1: Authentication
- [ ] Magic-link email sign-in creates a new user in Supabase `auth.users` AND `public.users`
- [ ] Magic-link email sign-in works and redirects to `/dashboard`
- [ ] Google OAuth sign-in works (if `GOOGLE_CLIENT_ID` is configured)
- [ ] Protected routes (`/dashboard/*`, `/generate/*`, `/buy-credits`) redirect unauthenticated users to `/auth/signin`
- [ ] Sign-out clears session and redirects to `/`
- [ ] Deleted user cannot sign in after account deletion

#### V2: Payments & Credits
- [ ] `/buy-credits` page loads with Stripe checkout options
- [ ] Stripe checkout session creates successfully (test mode)
- [ ] Webhook at `/api/stripe/webhook` processes `checkout.session.completed` events
- [ ] Credits are added to user's balance after successful payment
- [ ] Credit balance displays correctly on dashboard
- [ ] Generation routes (`/api/generate/*`, `/api/ats/scan`, `/api/copilot/chat`, `/api/job-packs/*`) return `402` when credits = 0
- [ ] Credits deduct correctly on successful generation

#### V3: Resume Scan & OCR
- [ ] Resume upload accepts PDF/DOCX
- [ ] OCR extraction (Tesseract.js) processes uploaded images
- [ ] Extracted text populates profile fields
- [ ] Mobile camera capture works on Android Chrome
- [ ] Files are stored in `resume_uploads` bucket under `{user_id}/`
- [ ] Cross-user access to stored files is blocked (RLS)

#### V4: Privacy & Compliance
- [ ] `/privacy` page loads and contains accurate disclosures
- [ ] `/terms` page loads and contains accurate disclosures
- [ ] `/delete-account` page loads without authentication
- [ ] In-app deletion (Dashboard → Profile → Delete Account) deletes from `public.users`, `auth.users`, and `resume_uploads` bucket
- [ ] No beta placeholder text remains in any legal page

#### V5: Domain & Deployment
- [ ] `cvscan.com.au` resolves to the Vercel deployment
- [ ] `https://cvscan.com.au/privacy` is publicly accessible
- [ ] `https://cvscan.com.au/terms` is publicly accessible
- [ ] `https://cvscan.com.au/delete-account` is publicly accessible
- [ ] All internal references to the legacy `.com` domain are updated to `cvscan.com.au`

#### V6: Existing Blockers from Prior Agents
- [ ] **BA-1 (CRITICAL):** DPA status with AI sub-processors — document current state, escalate to owner if unresolved
- [ ] **BA-3 (HIGH):** AI sub-processor retention windows — verify or document
- [ ] **BA-4 (MEDIUM):** `analytics_events` TTL policy — implement 12-month retention purge if straightforward, else document
- [ ] All engineering blockers from `PRE_SUBMISSION_CHECKLIST.md` Sections 5–7 — verify or fix

### Deliverables

- `V_REPORT.md` — Pass/fail for every item above with reproduction notes for failures
- Fixes for any broken items (commit with descriptive messages)
- Updated domain references throughout codebase to `cvscan.com.au`
- Updated `AGENT_HANDOVER.md` with Phase 0 section

### Acceptance Criteria

- Build succeeds: `npm run build` exits 0
- Auth flow works end-to-end (signup → signin → dashboard → signout)
- At least one generation route processes successfully with credits
- Delete account removes all user data
- No placeholder text in release-facing pages
- Domain URLs resolve correctly

### Must Not

- Change UI/UX styling (that's Phase 1–2)
- Add new features
- Restructure the database schema unless fixing a verified bug
- Remove or bypass any security hardening from Agents 1–6

---

## Phase 1 — Visual Excellence: Landing Page 2.0 + Dashboard Refresh

### Agent: Agent 2
### Objective

Transform CVScan's visual identity from "functional MVP" to "premium career platform" that makes users say "wow" on first load. The user should be WOWed by the landing page and feel like they're using a high-end product from the dashboard.

### Dependencies

- Phase 0 complete (auth, payments, core flows verified working)

### Design System Setup

Before touching any pages, establish the design foundation:

1. **Install Framer Motion:** `npm install framer-motion`
2. **Add Google Font:** Add `Inter` (or `Outfit`) via `next/font/google` in `app/layout.tsx`
3. **Establish design tokens** in `globals.css` or a new `design-tokens.css`:
   - Color palette: refined dark mode with HSL-tuned blues, cyans, and accent colors (not plain blue-500)
   - Glass effect utilities: `backdrop-blur-xl`, refined `bg-white/[opacity]` values
   - Shadow system: layered, colored shadows (e.g., `shadow-blue-500/25`)
   - Border radius scale: consistent `rounded-2xl` / `rounded-3xl`
   - Transition defaults: `transition-all duration-300 ease-out`

### Landing Page 2.0 (`app/app/page.tsx`)

Transform the current landing page into a premium, animated experience:

#### Hero Section
- Animated gradient background (subtle movement, not distracting)
- Framer Motion staggered text entrance (fade-up with delay)
- Animated typing effect or word rotation for the value proposition
- Floating particle/dot effect behind the hero (subtle, performant)
- CTA buttons with hover glow effect and subtle scale animation
- Trust indicators: "No credit card required" with icon

#### Before/After Section
- Interactive toggle or slider between "Before" and "After" resume text
- Framer Motion `AnimatePresence` for smooth content swap
- Highlight keywords that changed with colored underlines
- Should feel like a live demo, not a static comparison

#### How It Works Section
- Cards with hover lift effect (translateY + shadow increase)
- Numbered steps with connecting line/path animation on scroll
- Each card reveals its icon with a subtle entrance animation
- Use `whileInView` from Framer Motion for scroll-triggered animations

#### Pricing Section
- Glassmorphism cards with refined borders
- "Most Popular" card with animated gradient border (conic-gradient rotation)
- Hover state: card lifts, shadow deepens, border glows
- Price numbers with count-up animation on scroll-into-view

#### Social Proof / Trust Section (NEW)
- Add a section between How It Works and Pricing
- Stats row: "X resumes improved" / "Y% average score increase" / "Z job seekers helped"
- Animated counters on scroll-into-view
- Subtle background pattern or gradient mesh

#### CTA Section
- Gradient background with subtle animated shimmer
- Large, confident CTA with hover animation
- Micro-copy reinforcing value ("Join thousands of job seekers")

#### Footer
- Clean, minimal footer with all required links
- Social links if available
- Domain: `cvscan.com.au`

### Dashboard Refresh (`app/app/dashboard/page.tsx`)

Overhaul the internal dashboard for a premium glassmorphism aesthetic:

#### Layout Changes
- Replace the flat card grid with glassmorphism cards (`backdrop-blur-xl bg-white/5 border border-white/10`)
- Add subtle gradient borders on hover (not on idle — keep it clean)
- Group cards under clear section headers with subtle separators
- Refine spacing and padding for breathing room

#### Welcome Header
- Animated greeting with time-of-day awareness ("Good morning, [Name]!")
- Credit balance displayed as a pill/badge with icon, not plain text
- Quick action buttons: "Scan Resume" / "New Cover Letter" / "Browse Jobs"

#### Feature Cards
- Each card gets a unique subtle gradient accent (not uniform blue)
- Icon area uses a frosted glass effect with colored icon
- Hover: card lifts 2px, border transitions to accent color, shadow deepens
- Credit cost displayed as a small badge, not inline text

#### Onboarding Card
- Progress indicator (if onboarding has steps)
- Animated entrance on first visit
- Dismissible after completion

### File Targets

| File | Action |
|------|--------|
| `app/app/layout.tsx` | Add Google Font, update metadata |
| `app/app/globals.css` | Add design tokens, glass utilities, animation keyframes |
| `app/app/page.tsx` | Full redesign of landing page |
| `app/app/dashboard/page.tsx` | Glassmorphism overhaul |
| `app/components/ui/` | Create reusable components: `GlassCard.tsx`, `AnimatedCounter.tsx`, `GradientButton.tsx` |
| `package.json` | Add `framer-motion` dependency |

### Acceptance Criteria

- Landing page loads with visible animations within 1 second
- No layout shift during animation entrance
- All existing links/CTAs still work (signin, pricing, dashboard)
- Dashboard loads with glass effect visible on all cards
- Mobile responsive: all elements work at 375px width
- Lighthouse Performance score >= 80 on landing page
- `npm run build` succeeds

### Must Not

- Break any auth/payment/generation flows
- Change API routes or backend logic
- Remove any existing functionality
- Add new features (only visual polish)
- Use any CSS framework other than Tailwind

---

## Phase 2 — Magic UX: Scan Animation + Insights + Tailor Preview

### Agent: Agent 3
### Objective

Add the "magic moments" that make CVScan feel alive. Users should feel like the app is doing something special when they scan a resume, see their results, and tailor their content.

### Dependencies

- Phase 1 complete (design system established, Framer Motion available)

### Magic Scan Experience (`app/app/dashboard/scanner/page.tsx`)

When a user uploads or scans a resume, replace the current loading spinner with a "Magic Scan" animation:

#### Upload State
- File drops into a stylized drop zone with dashed border animation
- On drop/select: file icon animates into position

#### Scanning State
- Animated laser-line sweeps across a document preview (CSS animation)
- Pulsing progress indicator with stage labels: "Reading document..." → "Extracting skills..." → "Building profile..."
- Keywords/skills "float" out of the document as they're extracted (Framer Motion `motion.span` with staggered delay)
- Subtle particle effect behind the scanning area

#### Results State
- Score reveals with a gauge/meter animation (animate from 0 to score)
- Keywords found are highlighted with colored badges that pop in sequentially
- "Missing keywords" shown with a different color, each with a tooltip explaining why it matters
- Overall match score with a satisfying "tick" animation on completion

### Insight Cards (Dashboard Enhancement)

Add actionable intelligence cards to the dashboard that tell users what to do next:

#### Card Types
- **"Add [Skill] to increase your match by X%"** — based on last scan results
- **"You have N applications pending"** — link to tracker
- **"Your profile is X% complete"** — link to profile builder
- **"Try scanning for [Job Title]"** — based on profile data

#### Implementation
- Cards appear below the welcome header
- Animated entrance (staggered fade-up)
- Dismissible (state persisted in localStorage)
- Maximum 3 visible at a time
- Data sourced from existing profile/scan data — no new API calls needed initially (can be static/derived)

### Tailor Split-Screen Preview

When a user generates tailored content (bullets, cover letter), show a before/after comparison:

#### Layout
- Split screen: original on left, tailored on right
- Side-by-side on desktop, stacked on mobile
- Diff highlighting: changed words/phrases highlighted in green
- Smooth transition when tailored content loads (fade-in from right)

#### Implementation
- Add to `/generate/bullets` result view
- Add to `/generate/cover-letter` result view
- Reusable `BeforeAfter.tsx` component

### Mobile Capture Polish

Improve the phone-based resume scan experience:

#### "Scan with Phone" QR Flow (if feasible in timeframe)
- Dashboard shows a QR code that opens the camera capture page on mobile
- On mobile: capture → OCR → results stream back to the web dashboard
- "Live Sync" indicator shows when mobile capture is active
- If QR/sync is too complex, improve the existing mobile camera UX instead:
  - Better camera viewfinder overlay
  - Auto-crop guides
  - Haptic feedback on capture (if available via API)
  - Clearer success/error states

### File Targets

| File | Action |
|------|--------|
| `app/app/dashboard/scanner/page.tsx` | Magic Scan animation overhaul |
| `app/app/dashboard/page.tsx` | Add Insight Cards section |
| `app/components/ui/InsightCard.tsx` | New: actionable insight card component |
| `app/components/ui/BeforeAfter.tsx` | New: split-screen comparison component |
| `app/components/ui/ScanAnimation.tsx` | New: laser-line scan animation component |
| `app/components/ui/ScoreGauge.tsx` | New: animated score gauge component |
| `app/app/generate/bullets/page.tsx` | Add before/after preview |
| `app/app/generate/cover-letter/page.tsx` | Add before/after preview |

### Acceptance Criteria

- Resume scan shows animated scanning experience (not a spinner)
- Score gauge animates from 0 to final score
- At least 2 Insight Cards appear on dashboard for a user with profile data
- Before/After comparison renders on at least one generation page
- All animations are smooth (60fps on mid-range Android device)
- No regression in scan/generation functionality
- Mobile camera capture works on Android Chrome
- `npm run build` succeeds

### Must Not

- Change scan/generation API logic or AI prompts
- Modify auth/payment flows
- Add new paid features
- Break existing scan results data structure

---

## Phase 3 — Polish + Play Store Readiness

### Agent: Agent 4
### Objective

Final QA pass, interview simulator improvements, any remaining polish, and complete Play Store submission readiness. **This agent outputs `OWNER_INSTRUCTIONS.md`.**

### Dependencies

- Phases 0–2 complete

### Interview Simulator Polish (`app/app/dashboard/interview/page.tsx`)

- Dark, focused UI theme for interview mode (reduce visual distractions)
- Typing indicator animation when AI is "thinking"
- Message bubbles with subtle entrance animations
- Clear visual distinction between interviewer and user messages
- Session summary at end of interview with key feedback points

### Smart Notifications (Dashboard)

- Toast notification system for key events:
  - "Payment successful" (already partially implemented)
  - "Profile updated"
  - "New scan complete"
  - "Credits running low" (when balance < 3)
- Notifications use the glassmorphism style from Phase 1
- Auto-dismiss after 5 seconds with progress bar

### Final QA Sweep

Run through every user-facing page and verify:

- [ ] All pages use the new design system (no old flat cards remaining)
- [ ] All animations work on mobile (375px viewport)
- [ ] All links navigate correctly
- [ ] No console errors on any page
- [ ] No placeholder text ("Lorem ipsum", "TODO", "test", etc.)
- [ ] Credit costs are displayed correctly on all feature cards
- [ ] Loading states use skeleton components, not spinners
- [ ] Error states are user-friendly, not raw error messages
- [ ] `npm run build` succeeds with no TypeScript errors
- [ ] `npm run lint` passes or has only non-blocking warnings

### Play Store Final Readiness

Verify all items in `docs/PRE_SUBMISSION_CHECKLIST.md` that are engineering-actionable:

- [ ] All domain URLs point to `cvscan.com.au`
- [ ] Privacy Policy, Terms, Delete Account pages are publicly accessible
- [ ] No debug logging or test credentials in codebase
- [ ] No `console.log` statements in production code paths
- [ ] Reviewer instructions in `REVIEWER_ACCESS.md` are accurate
- [ ] Play Store metadata in `PLAY_STORE_METADATA.md` is accurate
- [ ] Update all doc references from the legacy `.com` domain to `cvscan.com.au`

### Output: `OWNER_INSTRUCTIONS.md`

Agent 4 MUST create `docs/OWNER_INSTRUCTIONS.md` as their final deliverable. This document tells the Product Owner **everything they need to do manually** before submitting to Google Play. It must include:

#### Section 1: Environment & Secrets
- List of all required environment variables and where to set them
- Which secrets need to be in Vercel vs local only
- Any API keys that need rotation or creation

#### Section 2: Domain & DNS
- Steps to verify `cvscan.com.au` is live and resolving
- SSL certificate verification
- Vercel domain configuration steps if needed

#### Section 3: Supabase Operations
- SQL to seed reviewer account (`reviewer@cvscan-test.com` with 500 credits)
- How to verify RLS policies are active
- How to verify storage bucket permissions
- How to set up `analytics_events` TTL if not done

#### Section 4: Stripe Configuration
- Webhook endpoint URL to configure in Stripe dashboard
- Required webhook events to subscribe to
- Test mode vs live mode verification steps

#### Section 5: Google Play Console
- Step-by-step Play Console setup (app creation, listing, screenshots)
- Where to enter reviewer credentials
- How to set up closed testing track
- How to add licence testers
- How to upload AAB
- Content rating questionnaire guidance
- Data Safety form answers (copy from `PLAY_STORE_METADATA.md`)

#### Section 6: Design Assets Needed
- App icon spec (512x512 PNG) — generate one if possible, or provide exact spec
- Feature graphic spec (1024x500) — generate one if possible
- Screenshot requirements (minimum 2 phone screenshots at 1080x1920)
- Instructions for capturing screenshots from the app

#### Section 7: Beta Tester Recruitment
- How many testers needed (minimum 12)
- Where to recruit (from `BETA_TRACK.md`)
- How to send invites
- 14-day clock tracking

#### Section 8: DPA & Legal Actions
- Which DPA agreements need to be confirmed (Google Gemini, OpenAI)
- Where to find DPA forms for each provider
- What to do if DPA cannot be obtained (risk acceptance or provider removal)

#### Section 9: Go/No-Go Checklist
- Final checklist the owner runs through before hitting "Submit for Review"
- Every item is a yes/no with clear instructions if "no"

#### Section 10: Post-Submission
- What to expect from Google Play review (timeline, common rejection reasons)
- How to respond to reviewer questions
- When to rotate reviewer credentials
- How to monitor crash reports
- How to handle the first real user support emails

### Acceptance Criteria

- `OWNER_INSTRUCTIONS.md` exists and is comprehensive
- All engineering QA items pass
- `npm run build` succeeds
- No TypeScript errors
- No placeholder text anywhere in the app
- Interview page has improved visual polish
- Toast notification system works
- All docs reference `cvscan.com.au`

### Must Not

- Add new paid features
- Change pricing or credit costs
- Modify auth or payment flows
- Deploy to production (owner does this)

---

## Shared Rules for All Agents

### Git Discipline
- Commit everything with descriptive messages
- **Push nothing** — owner reviews and pushes
- **Run no tests** against production services

### Output Format
Every agent must output:
1. What they inspected
2. What they changed (files list)
3. What they couldn't fix (blockers)
4. What assumptions they made
5. Pass/fail against their acceptance criteria
6. **A copy-pasteable prompt for the next agent** (see `AGENT_HANDOVER.md`)

### File Naming
- New components: `PascalCase.tsx` in `app/components/ui/`
- New docs: `UPPER_SNAKE_CASE.md` in `docs/`
- No new top-level directories

### Dependencies
- Only add dependencies that are absolutely necessary
- Document any new `npm install` in the agent report
- Prefer CSS animations over JS animation libraries where possible
- Framer Motion is pre-approved for Phase 1+

---

## Exit Criteria

CVScan is ready for the owner to submit to Google Play when:

- [ ] Auth works end-to-end (signup → signin → use → signout → delete)
- [ ] Payments work in Stripe test mode
- [ ] Credit gating is enforced on all generation routes
- [ ] Landing page delivers a "wow" first impression
- [ ] Dashboard feels premium with glassmorphism and animations
- [ ] Resume scan has the "Magic Scan" animation
- [ ] At least one generation page shows before/after comparison
- [ ] All legal pages are live and accurate at `cvscan.com.au`
- [ ] `OWNER_INSTRUCTIONS.md` exists with complete submission guide
- [ ] `npm run build` exits 0
- [ ] No placeholder text, no debug logging, no exposed secrets
