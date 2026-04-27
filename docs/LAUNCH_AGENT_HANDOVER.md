# CVScan — Launch Agent Handover

> **Version:** 1.0 — April 27, 2026
> **Governing Document:** `docs/BUILDSPEC.md`
> **Agents:** 4 total (Phase 0–3)
> **Domain:** cvscan.com.au

---

## Introduction

This document coordinates 4 agents to take CVScan from a production-hardened MVP to a premium, launch-ready product submitted to Google Play.

**Background:** CVScan has already undergone a 6-agent hardening cycle (documented in `docs/Agent_Handover.md`) that restored auth (NextAuth + Supabase), payments (Stripe), credit gating, compliance pages (Privacy Policy, Terms, Delete Account), and Play Store documentation from a beta-stripped state. That work is assumed complete but **must be verified in Phase 0** before any visual changes begin.

**The app is a Next.js 16 + React 19 web app using Tailwind CSS, deployed on Vercel, with Supabase for auth/data/storage and Stripe for billing. The target is a Google Play closed beta in AU/NZ.**

### How This Document Works

1. Each agent reads the **full intro**, their **phase section**, and the **previous agent's handover notes**
2. Each agent completes their phase and fills in their handover section below
3. Each agent commits everything, pushes nothing, runs no tests against production
4. Each agent outputs a summary to the owner AND a copy-pasteable prompt for the next agent
5. **Agent 4** additionally outputs `docs/OWNER_INSTRUCTIONS.md`

### Key Files

| File | Purpose |
|------|---------|
| `docs/BUILDSPEC.md` | Source of truth for all phase requirements, acceptance criteria, and constraints |
| `docs/Agent_Handover.md` | Legacy handover from the 6-agent hardening cycle (Agents 1–6) — context only |
| `docs/PRE_SUBMISSION_CHECKLIST.md` | 50+ item Play Store checklist — Agent 1 verifies, Agent 4 finalizes |
| `docs/PLAY_STORE_METADATA.md` | Store listing copy, asset specs, Data Safety answers |
| `docs/REVIEWER_ACCESS.md` | Reviewer account strategy and Play Console instructions |
| `docs/BETA_TRACK.md` | Tester list, onboarding, 14-day policy documentation |
| `docs/SRS.md` | Software Requirements Specification |
| `docs/Build_Spec.md` | Legacy build spec (WP01–WP12 job search layer) — deferred, not in scope |

### Global Rules

- **Tailwind CSS only** — do NOT convert to vanilla CSS
- **Commit everything, push nothing, test nothing against production**
- **Do not make product-scope decisions** — all decisions are in BUILDSPEC.md
- **Do not add new paid features** — only verify existing ones or add visual polish
- **Domain is `cvscan.com.au`** — update any references to `cvscan.com`
- **Framer Motion** is pre-approved for Phase 1+ (install via `npm install framer-motion`)

---

## Agent 1 — Phase 0: Baseline Verification & Hardening

### Your Mission

You are the quality gate. Verify that every production-critical system works end-to-end. Fix what's broken. Document what you can't fix. Do NOT change any styling or add features.

### What To Do

1. Read `docs/BUILDSPEC.md` Phase 0 in full
2. Run `cd app && npm install && npm run build` — must succeed
3. Run `npm run dev` and verify the app starts
4. Work through **every item** in the Phase 0 Verification Checklist (V1–V6)
5. Fix any broken items you find
6. Update all `cvscan.com` references to `cvscan.com.au` across the codebase
7. Create `docs/V_REPORT.md` with pass/fail for every verification item
8. Fill in your handover section below
9. Commit everything

### What NOT To Do

- Do NOT change UI/UX styling
- Do NOT add new features
- Do NOT restructure the database
- Do NOT bypass any security hardening

### Acceptance Criteria

See `docs/BUILDSPEC.md` → Phase 0 → Acceptance Criteria

---

### Agent 1 Handover Notes

> **Status:** `[PENDING | COMPLETE | BLOCKED]`
> **Date:** `[Agent fills in]`

#### What I Inspected
`[Agent fills in]`

#### What I Changed (Files)
`[Agent fills in]`

#### What I Fixed
`[Agent fills in]`

#### What I Couldn't Fix (Blockers)
`[Agent fills in]`

#### Assumptions Made
`[Agent fills in]`

#### Verification Results Summary
`[Agent fills in — e.g., "V1: 6/7 PASS, V2: 5/7 PASS, V3: 4/6 PASS..."]`

#### Environment Variables Required
`[Agent fills in — list any env vars needed]`

#### Dependencies
`[Agent fills in — any npm packages added]`

---

## Agent 2 — Phase 1: Visual Excellence (Landing + Dashboard)

### Your Mission

Transform CVScan's visual identity from "functional MVP" to "premium career platform." The user should be WOWed on first load. You are building the design system and applying it to the two most important pages: the landing page and the dashboard.

### What To Do

1. Read `docs/BUILDSPEC.md` Phase 1 in full
2. Read Agent 1's handover notes above — note any blockers or issues
3. Install Framer Motion: `cd app && npm install framer-motion`
4. Set up the design system (Google Font, design tokens, glass utilities)
5. Redesign the landing page (`app/app/page.tsx`) per BUILDSPEC specs
6. Overhaul the dashboard (`app/app/dashboard/page.tsx`) with glassmorphism
7. Create reusable UI components in `app/components/ui/`
8. Verify mobile responsiveness at 375px
9. Verify `npm run build` succeeds
10. Fill in your handover section below
11. Commit everything

### What NOT To Do

- Do NOT break auth, payment, or generation flows
- Do NOT change API routes or backend logic
- Do NOT add new features
- Do NOT use any CSS framework other than Tailwind

### Acceptance Criteria

See `docs/BUILDSPEC.md` → Phase 1 → Acceptance Criteria

---

### Agent 2 Handover Notes

> **Status:** `[PENDING | COMPLETE | BLOCKED]`
> **Date:** `[Agent fills in]`

#### What I Inspected
`[Agent fills in]`

#### What I Changed (Files)
`[Agent fills in]`

#### Design System Decisions
`[Agent fills in — fonts chosen, color palette, animation approach]`

#### New Components Created
`[Agent fills in]`

#### What I Couldn't Fix (Blockers)
`[Agent fills in]`

#### Assumptions Made
`[Agent fills in]`

#### Performance Notes
`[Agent fills in — bundle size impact, Lighthouse scores]`

#### Dependencies Added
`[Agent fills in]`

---

## Agent 3 — Phase 2: Magic UX (Scan + Insights + Tailor)

### Your Mission

Add the "magic moments" that make CVScan feel alive and differentiated. The Magic Scan animation, Insight Cards, and Tailor preview are the features users will remember and talk about.

### What To Do

1. Read `docs/BUILDSPEC.md` Phase 2 in full
2. Read Agent 2's handover notes — understand the design system and components available
3. Build the Magic Scan animation for the scanner page
4. Add Insight Cards to the dashboard
5. Build the Before/After split-screen component
6. Integrate Before/After into at least one generation page
7. Polish mobile camera capture if time permits
8. Verify all animations are smooth and functional
9. Verify `npm run build` succeeds
10. Fill in your handover section below
11. Commit everything

### What NOT To Do

- Do NOT change scan/generation API logic or AI prompts
- Do NOT modify auth or payment flows
- Do NOT add new paid features
- Do NOT break existing scan results data structure

### Acceptance Criteria

See `docs/BUILDSPEC.md` → Phase 2 → Acceptance Criteria

---

### Agent 3 Handover Notes

> **Status:** `[PENDING | COMPLETE | BLOCKED]`
> **Date:** `[Agent fills in]`

#### What I Inspected
`[Agent fills in]`

#### What I Changed (Files)
`[Agent fills in]`

#### New Components Created
`[Agent fills in]`

#### Animation Implementation Notes
`[Agent fills in — which animations use CSS vs Framer Motion, performance notes]`

#### What I Couldn't Complete
`[Agent fills in — e.g., QR flow was too complex for timeframe]`

#### Assumptions Made
`[Agent fills in]`

#### Mobile Testing Notes
`[Agent fills in]`

#### Dependencies Added
`[Agent fills in]`

---

## Agent 4 — Phase 3: Polish + Play Store Readiness

### Your Mission

You are the closer. Polish the interview simulator, add the toast notification system, run the final QA sweep, verify Play Store readiness, and **create `docs/OWNER_INSTRUCTIONS.md`** — the most important deliverable of this entire pipeline.

### What To Do

1. Read `docs/BUILDSPEC.md` Phase 3 in full
2. Read ALL previous agent handover notes — understand everything that was done and any open issues
3. Polish the interview simulator page
4. Implement the toast notification system
5. Run the full QA sweep (every user-facing page)
6. Verify all Play Store checklist items in `docs/PRE_SUBMISSION_CHECKLIST.md`
7. Update ALL doc references from `cvscan.com` to `cvscan.com.au`
8. **Create `docs/OWNER_INSTRUCTIONS.md`** with all 10 sections defined in BUILDSPEC.md
9. Fill in your handover section below
10. Commit everything

### What NOT To Do

- Do NOT add new paid features
- Do NOT change pricing or credit costs
- Do NOT modify auth or payment flows
- Do NOT deploy to production

### Critical Output

You MUST create `docs/OWNER_INSTRUCTIONS.md` — see `docs/BUILDSPEC.md` → Phase 3 → "Output: OWNER_INSTRUCTIONS.md" for the full spec of what this document must contain. This is what the owner uses to actually submit to Google Play.

### Acceptance Criteria

See `docs/BUILDSPEC.md` → Phase 3 → Acceptance Criteria

---

### Agent 4 Handover Notes

> **Status:** `[PENDING | COMPLETE | BLOCKED]`
> **Date:** `[Agent fills in]`

#### What I Inspected
`[Agent fills in]`

#### What I Changed (Files)
`[Agent fills in]`

#### QA Results Summary
`[Agent fills in — page-by-page results]`

#### Play Store Readiness Status
`[Agent fills in — checklist summary]`

#### OWNER_INSTRUCTIONS.md Status
`[Agent fills in — CREATED / sections completed]`

#### Remaining Blockers for Owner
`[Agent fills in]`

#### Assumptions Made
`[Agent fills in]`

#### Final Build Status
`[Agent fills in — npm run build result, TypeScript errors, lint warnings]`

---

## End-of-Pipeline Instructions

### For Every Agent

After completing your phase:

1. **Commit everything** with descriptive commit messages
2. **Push nothing** — the owner reviews and pushes
3. **Test nothing** against production Supabase/Stripe
4. **Output to owner** a summary of what you did, what's broken, and what's left
5. **Output a prompt** the owner can copy-paste to start the next agent:

```
--- COPY-PASTE PROMPT FOR NEXT AGENT ---

You are Agent [N+1] working on CVScan (Phase [N]).

Read the following files before doing anything:
1. docs/BUILDSPEC.md — your source of truth
2. docs/LAUNCH_AGENT_HANDOVER.md — read the intro and Agent [N]'s handover notes

Your phase is Phase [N]. Follow the instructions in BUILDSPEC.md exactly.

Key context from Agent [N]:
- [Insert 3-5 bullet points of critical context]
- [Any blockers they need to know about]
- [Any env vars or dependencies they need]

When you're done:
1. Fill in your handover section in docs/LAUNCH_AGENT_HANDOVER.md
2. Commit everything, push nothing, test nothing
3. Output a summary to the owner
4. Output a copy-paste prompt for the next agent

--- END PROMPT ---
```

### For Agent 4 (Final Agent)

In addition to the above, Agent 4 must:

1. Create `docs/OWNER_INSTRUCTIONS.md` (see BUILDSPEC.md for full spec)
2. Output a final summary that includes:
   - Overall project status (READY / NOT READY for submission)
   - List of remaining owner actions
   - List of remaining engineering issues (if any)
   - Estimated time for owner to complete their actions
