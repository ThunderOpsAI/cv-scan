# CVScan — Build Spec
## Scope: 6 Small Wins + 3-Step Job Search Layer

> **Source of truth for execution:** This file is the implementation source of truth for Codex / vibe-coding agents.  
> If there is any conflict between this file and PRD/SRS wording, this file governs execution order, acceptance criteria, and task boundaries.

## 1. Delivery principles

- Keep each agent on a narrow, low-context slice
- No agent should take more than 2–4 tightly related tasks in one session
- Prefer vertical slices that can be tested quickly
- Do not mix schema work, OCR work, search ranking work, and UI polish in one agent pass unless explicitly assigned
- Every agent must update `Agent_Handover.md` before finishing

## 2. Phase map

### Phase A — Foundation and ingestion
- WP01 Resume suggestions
- WP02 Job URL import
- WP03 Screenshot-to-job parser

### Phase B — Decisioning and tracker
- WP04 Apply / Stretch / Skip engine
- WP05 Unified tracker source model
- WP06 Duplicate detection and merge flow

### Phase C — Job inbox productization
- WP07 Universal Job Inbox UI and orchestration

### Phase D — Aggregation and search
- WP08 Light aggregation pipeline
- WP09 Unified search index
- WP10 Search ranking and filters
- WP11 Saved searches and alerts

### Phase E — AU tuning and hardening
- WP12 AU-specific normalization, QA, analytics, and release hardening

---

## 3. Work packages

## WP01 — Resume-to-job-match instant suggestions
**Goal:** After resume upload or resume photo extraction, immediately suggest likely role targets and search prompts.

**Primary owner:** Agent 1  
**Dependencies:** existing resume/profile extraction

### Tasks
- Inspect current resume upload / parsing flow
- Add role-target inference step
- Add suggested job titles
- Add suggested search terms
- Add likely seniority and industry hints
- Allow one-click save of suggested searches

### Out of scope
- full search engine work
- tracker changes
- OCR improvements unrelated to resume extraction

### Acceptance criteria
- Suggestions appear after successful resume parse
- User can edit suggestions
- User can save at least one suggested search

---

## WP02 — Paste job URL import
**Goal:** Create a structured job record from a pasted job link.

**Primary owner:** Agent 2  
**Dependencies:** none beyond existing app infra

### Tasks
- Add `Paste job URL` entry point
- Build fetch + parse pipeline for supported/public job pages
- Extract core fields
- Create review screen before save
- Persist normalized job draft

### Acceptance criteria
- User can paste a URL
- Parsed data is visible and editable
- Job can be saved into tracker draft/canonical flow

### Risks
- inconsistent page markup
- network timeouts
- partial parse failures

---

## WP03 — Screenshot-to-job parser
**Goal:** Let users upload a screenshot or image of a job ad and extract a structured draft.

**Primary owner:** Agent 3  
**Dependencies:** file upload flow; OCR capability

### Tasks
- Add image upload entry point for jobs
- Run OCR on uploaded image
- Extract title, company, location, requirements, salary if present
- Mark low-confidence fields
- Add edit-before-save flow

### Acceptance criteria
- PNG/JPG/JPEG/WEBP supported
- Draft job record is created
- User can fix fields before saving

### Risks
- OCR noise
- mobile screenshots with awkward crops
- salary extraction ambiguity

---

## WP04 — Apply / Stretch / Skip engine
**Goal:** Replace generic fit presentation with a clear recommendation and reasoning layer.

**Primary owner:** Agent 4  
**Dependencies:** normalized user profile and normalized job record

### Tasks
- Define verdict rules and confidence structure
- Map matched requirements
- Detect likely blockers
- Generate 3–5 plain-English reasons
- Add verdict badge component and details panel

### Acceptance criteria
- Every analyzed job gets one verdict
- Reasons are shown
- User can override and proceed anyway

### Guardrails
- Never present verdict as guaranteed job outcome
- Reasons must be explainable

---

## WP05 — Unified tracker source model
**Goal:** Store jobs from all sources in one tracker with source metadata.

**Primary owner:** Agent 5  
**Dependencies:** WP02 and WP03 can land before or alongside

### Tasks
- Review current tracker schema
- Add source metadata fields
- Add extraction method and confidence fields
- Ensure URL-imported and screenshot-imported jobs save correctly
- Add source badge in tracker UI
- Add source filter

### Acceptance criteria
- All supported job capture methods land in the same tracker
- Source is visible
- Status updates still work

---

## WP06 — Duplicate detection and merge flow
**Goal:** Merge the same job from multiple sources into a single canonical record.

**Primary owner:** Agent 6  
**Dependencies:** WP05

### Tasks
- Add duplicate scoring logic
- Compare title, company, location, URL, recency, description
- Create canonical job record behavior
- Preserve alternate source links
- Add manual unmerge or override path

### Acceptance criteria
- High-confidence duplicates merge automatically
- Alternate source links remain visible
- User can undo incorrect merge

### Risks
- false merges
- poor company name normalization

---

## WP07 — Universal Job Inbox UI and orchestration
**Goal:** Create one obvious place where users bring in jobs from anywhere.

**Primary owner:** Agent 7  
**Dependencies:** WP02, WP03, WP04, WP05

### Tasks
- Build `Add Job` entry point
- Present options: paste link, upload screenshot, add manually
- Orchestrate review -> verdict -> save -> tailor next actions
- Add “next best action” panel after save

### Acceptance criteria
- User sees one clear job ingestion flow
- Post-ingestion actions are obvious
- Saved jobs feed naturally into existing CVScan workflows

---

## WP08 — Light aggregation pipeline
**Goal:** Add limited discovery from safer and maintainable sources.

**Primary owner:** Agent 8  
**Dependencies:** WP05

### Tasks
- Define approved source list
- Add ingestion for employer career pages and public structured job pages
- Normalize external job data into shared schema
- Add freshness metadata
- Add company watchlist seed flow if simple enough

### Acceptance criteria
- Aggregated jobs can be stored in normalized schema
- Aggregated jobs are distinguishable by source
- No restricted-platform mirroring logic is introduced

---

## WP09 — Unified search index
**Goal:** Create searchable storage/index over approved and normalized jobs.

**Primary owner:** Agent 9  
**Dependencies:** WP08

### Tasks
- Define indexing strategy
- Build search endpoint / query layer
- Query across approved aggregated jobs plus user-relevant saved items where appropriate
- Return normalized result objects

### Acceptance criteria
- Search returns normalized dedupable job results
- Response structure is stable for UI consumption

---

## WP10 — Search ranking and filters
**Goal:** Make search useful, not just technically functional.

**Primary owner:** Agent 10  
**Dependencies:** WP09, WP04

### Tasks
- Add ranking signals: relevance, freshness, fit, source quality
- Add AU-first filters: location, remote type, salary, seniority, industry, sponsorship if known, source
- Add result cards with fit/verdict summaries where appropriate

### Acceptance criteria
- Search results are filterable
- Ranking feels sensible on test dataset
- AU-specific filtering works

---

## WP11 — Saved searches and alerts
**Goal:** Turn search into retention.

**Primary owner:** Agent 11  
**Dependencies:** WP09, WP10

### Tasks
- Add save-search flow
- Add alert preference storage
- Add simple alert generation logic
- Expose alerts in app, email later if infrastructure already exists

### Acceptance criteria
- User can save a search
- User can see alert-ready matching logic
- Core saved-search data model is stable

---

## WP12 — AU normalization, analytics, and release hardening
**Goal:** Make the feature set stable enough to ship.

**Primary owner:** Agent 12  
**Dependencies:** prior work packages

### Tasks
- Improve AU location normalization
- Standardize AUD salary formatting where possible
- Add analytics events for resume suggestions, job import, verdict, save, duplicate merge, search, and saved search
- Add QA pass across happy paths
- Fix release-critical bugs only

### Acceptance criteria
- Core paths are instrumented
- AU-specific behavior is acceptable
- No P0 blockers remain

---

## 4. Suggested agent chain

### Minimal 6-agent chain
- Agent 1: WP01 + light QA
- Agent 2: WP02
- Agent 3: WP03
- Agent 4: WP04
- Agent 5: WP05 + WP06
- Agent 6: WP07, then hand off to later search agents

### Preferred 8-agent chain
- Agent 1: WP01
- Agent 2: WP02
- Agent 3: WP03
- Agent 4: WP04
- Agent 5: WP05
- Agent 6: WP06
- Agent 7: WP07
- Agent 8: WP08

### Full 12-agent chain
- One work package per agent from WP01 to WP12

---

## 5. Shared implementation notes

- Use migrations for schema changes
- Keep write operations idempotent where repeated ingestion is possible
- Preserve auditability of source and extraction method
- Never fabricate profile facts or claim unsupported fit evidence
- Keep all generated reasoning grounded in known user data and parsed job data
- Do not expand into unauthorized scraping

---

## 6. Done definition

This build spec is complete when:
- all six small wins are delivered
- the three-step job search layer is implemented in staged form
- the tracker is multi-source
- duplicate handling exists
- verdicting is live
- saved searches and AU-first tuning are in place
- all handovers are documented cleanly in `Agent_Handover.md`
