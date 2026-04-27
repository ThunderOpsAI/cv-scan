# CVScan Launch Strategy — Summary

## Documents Created

Two documents have been created in `docs/`:

### 1. [BUILDSPEC.md](file:///Users/Thunderops/Documents/Projects/cv-scan/docs/BUILDSPEC.md)
The source of truth for all 4 phases. Contains detailed requirements, acceptance criteria, file targets, and constraints for each phase.

### 2. [LAUNCH_AGENT_HANDOVER.md](file:///Users/Thunderops/Documents/Projects/cv-scan/docs/LAUNCH_AGENT_HANDOVER.md)
The agent coordination document. Each agent reads this, completes their phase, fills in their handover notes, and outputs a prompt for the next agent.

---

## Phase Overview

| Phase | Agent | What They Do | Key Output |
|-------|-------|-------------|------------|
| **Phase 0** | Agent 1 | Verify everything works (auth, payments, OCR, compliance, domain) | `V_REPORT.md` — pass/fail for every system |
| **Phase 1** | Agent 2 | Landing page 2.0 + dashboard glassmorphism overhaul | Premium visual identity, design system, Framer Motion |
| **Phase 2** | Agent 3 | Magic Scan animation, Insight Cards, Tailor preview | Signature UX moments that differentiate CVScan |
| **Phase 3** | Agent 4 | Final QA, interview polish, Play Store readiness | **`OWNER_INSTRUCTIONS.md`** — your complete submission guide |

---

## Key Decisions Made

| Decision | Rationale |
|----------|-----------|
| **Tailwind CSS stays** | Entire codebase uses it — ripping it out would be destructive |
| **Job search layer (WP01-WP12) deferred** | Post-launch roadmap, not blocking for Play Store submission |
| **Domain is `cvscan.com.au`** | All docs and code refs need updating from the legacy `.com` domain |
| **4 agents, not 8** | Each phase is scoped to be completable in one agent session |
| **Agent 4 owns OWNER_INSTRUCTIONS.md** | Single comprehensive doc for everything the owner must do manually |
| **Framer Motion pre-approved** | Only new dependency, handles all animation needs |
| **No deployment by agents** | Owner reviews all commits and deploys manually |

---

## What You (Owner) Need To Do

These items are **not** agent-solvable:

| Action | When | Priority |
|--------|------|----------|
| Confirm DPA agreements with AI providers (Gemini, OpenAI) | Before production | **CRITICAL (BA-1)** |
| Set up `cvscan.com.au` DNS → Vercel | Before Phase 0 verification | HIGH |
| Design/create app icon (512×512 PNG) | Before Play Store submission | HIGH |
| Design/create feature graphic (1024×500) | Before Play Store submission | HIGH |
| Capture ≥2 phone screenshots (1080×1920) | After Phase 2 (with new UX) | HIGH |
| Seed reviewer account in production Supabase | Before Play Store submission | HIGH |
| Recruit ≥12 beta testers | Before 14-day clock starts | HIGH |
| Review and push all agent commits | After each phase | MEDIUM |

---

## How To Start

To kick off Phase 0, copy-paste this prompt to your next agent:

```
You are Agent 1 working on CVScan (Phase 0 — Baseline Verification & Hardening).

Read the following files before doing anything:
1. docs/BUILDSPEC.md — your source of truth (Phase 0 section)
2. docs/LAUNCH_AGENT_HANDOVER.md — read the full intro and your Agent 1 section

Your job is to verify every production-critical system works end-to-end. 
Fix what's broken. Document what you can't fix.

Key context:
- The app underwent a 6-agent hardening cycle — see docs/Agent_Handover.md for history
- Auth was restored from beta placeholders (NextAuth + Supabase)
- Payments were restored (Stripe)
- Compliance pages exist (Privacy, Terms, Delete Account)
- Domain is cvscan.com.au — update all legacy `.com` domain references
- BA-1 (DPA agreements) is still a CRITICAL open blocker — escalate to owner

When you're done:
1. Create docs/V_REPORT.md with pass/fail for every verification item
2. Fill in your handover section in docs/LAUNCH_AGENT_HANDOVER.md
3. Commit everything, push nothing, test nothing
4. Output a summary to the owner
5. Output a copy-paste prompt for Agent 2
```

> [!IMPORTANT]
> Review both documents before starting. If any phase scope, priority, or constraint doesn't match your vision, adjust the BUILDSPEC.md before handing it to agents.
