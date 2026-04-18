# CVScan — Agent Handover

> **Purpose:** This is the single handover file for a chained vibe-coding workflow.  
> Every agent reads this file before starting.  
> Every agent updates this file before finishing.

## 1. Execution rule

`docs/Build_Spec.md` and later `docs/Build_Spec*` files are the single source of truth for implementation.  
If this handover file is less specific than the Build Spec, the Build Spec wins.

## 2. How each agent works

Each agent must:
1. Read `docs/Build_Spec.md`
2. Read this file
3. Work only on the assigned work package(s)
4. Avoid unrelated refactors
5. Leave the repo in a clean state
6. Update the handover block before finishing

Do not take extra tasks just because they look nearby.  
The point of this chain is narrow, clean, low-context execution.

---

## Current session block

### Current phase
[fill in]

### Branch worked on
[fill in]

### Agent ID
[fill in, e.g. Agent 4]

### Assigned work package(s)
[fill in, e.g. WP04]

### Files touched
- [fill in]
- [fill in]

### What was completed
- [fill in]
- [fill in]
- [fill in]

### What was not completed
- [fill in]
- [fill in]

### Schema / migration changes
- [fill in or write "none"]

### New env vars
- [fill in or write "none"]

### Known issues / blockers
- [fill in]
- [fill in]

### Tests run
- [fill in]
- [fill in]

### Notes for next agent
- [fill in]
- [fill in]

### Recommended next work package
[fill in, e.g. WP05]

---

## 3. Strict handoff convention

Before finishing, each agent must update:
- Current phase
- Branch worked on
- Agent ID
- Assigned work package(s)
- Files touched
- What was completed
- What was not completed
- Schema / migration changes
- New env vars
- Known issues / blockers
- Tests run
- Notes for next agent
- Recommended next work package

If a work package is only partially complete, say exactly what remains.  
Do not write vague summaries.

---

## 4. Example handoff entry

### Current phase
Phase B — Decisioning and tracker

### Branch worked on
codex/wp04-apply-stretch-skip

### Agent ID
Agent 4

### Assigned work package(s)
WP04

### Files touched
- app/lib/fit-score.ts
- app/components/job/VerdictBadge.tsx
- app/components/job/VerdictPanel.tsx

### What was completed
- Added Apply / Stretch / Skip verdict enum
- Added rules for matched requirements, missing must-haves, and seniority mismatch
- Added verdict badge and reasoning panel

### What was not completed
- Confidence scoring still needs tuning
- Visa mismatch logic not yet added

### Schema / migration changes
- none

### New env vars
- none

### Known issues / blockers
- Current job parser does not always structure requirements cleanly enough for verdict reasons
- Better company/location normalization will improve results

### Tests run
- npm test
- manual happy-path test on saved job details page

### Notes for next agent
- Use existing verdict enum, do not rename
- Extend reasoning inputs only if normalized requirement data improves

### Recommended next work package
WP05

---

## 5. Merge discipline

- Never merge unrelated work into the assigned package
- Prefer small commits
- Keep naming stable
- Do not rewrite handoff history casually
- If you changed a contract or schema, state it explicitly

---

## 6. Final rule

If unsure what to do next, stop and check `docs/Build_Spec.md`.  
That file governs the chain.
