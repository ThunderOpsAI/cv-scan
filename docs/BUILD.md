# CVScan Build Guide

## § Existing (DO NOT REBUILD)

**Auth** ✅ NextAuth + Google OAuth → `lib/auth/`, `app/(auth)/`
**DB** ✅ Supabase + RLS → `lib/supabase/`
**Payments** ✅ Stripe ($2.99→20cr, $4.99→50cr, $7.99→100cr) → `app/api/stripe/`, `lib/stripe/`
**AI** ✅ Gemini (bullets 1cr, cover letter 2cr) → `lib/ai/`, `app/api/generate/`
**Email** ✅ Resend (welcome, receipt, low credit) → `lib/email/`
**Landing** ✅ Dark blue gradient, pricing, before/after → `app/page.tsx`
**Dashboard** ✅ Credit balance, basic generation → `app/(dashboard)/`

**Existing Tables:** `users(id, email, name, credits, created_at, updated_at)` + NextAuth tables
**Existing Functions:** `add_credits()`, `deduct_credit()` — DO NOT MODIFY

---

## § Integrations (Copy-Paste These)

```typescript
// Auth
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
const session = await getServerSession(authOptions);
if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

// Credits
import { deductCredit } from '@/lib/supabase/credits';
const result = await deductCredit(userId, 2, 'job_pack', 'description');
if (!result.success) return { error: 'Insufficient credits' };

// Database
import { createClient } from '@/lib/supabase/server';
const supabase = createClient();

// AI
import { generateWithGemini } from '@/lib/ai/gemini';
const result = await generateWithGemini({ prompt, model: 'flash' }); // or 'pro'
```

---

## § Phase 0: Foundation `v0.1.0-foundation`
Profile system + Metric Mining

**DB:** profiles, experiences, bullets (mined_metrics JSONB), education, skills, star_stories + RLS

**API:**
- `GET/PUT /api/profile`
- `POST/PUT/DELETE /api/profile/experiences`
- `POST/PUT/DELETE /api/profile/bullets`
- `POST /api/profile/mine-metrics` (AI asks questions → enhanced bullet)
- `GET /api/profile/strength`

**UI:** ProfileWizard, ExperienceForm, BulletEditor, MetricMiningDialog, ProfileStrength, SkillsManager

**Pages:** `/dashboard/profile`, `/dashboard/profile/experience`, `/dashboard/profile/education`, `/dashboard/profile/skills`

**Done:** User can create profile, metric mining improves bullets, strength % shows

---

## § Phase 1: Intelligence `v0.2.0-intelligence`
Copilot + Company Research + Job Discovery

**DB:** conversations, messages, company_cache (7d TTL), saved_searches, discovered_jobs

**API:**
- `POST /api/copilot/chat` (streaming, 0.5cr)
- `GET /api/copilot/conversations`, `GET /api/copilot/conversations/[id]`
- `GET /api/company/[name]` (1cr, cached 7d)
- `POST /api/company/[name]/refresh`
- `GET /api/jobs/discover` (Adzuna)
- `POST/GET /api/jobs/searches`

**UI:** CopilotChat, CopilotMessage, CompanyBrief, JobDiscoveryList, SavedSearchForm, JobCard

**Pages:** `/dashboard/copilot`, `/dashboard/jobs`, `/dashboard/jobs/searches`

**Done:** Chat with copilot, company research cached, job discovery with match scores, daily digest

---

## § Phase 2: Job Packs `v0.3.0-jobpacks`
ATS Scanner + Tailor-Diff + Cultural Alignment

**DB:** job_packs, ats_scans

**API:**
- `POST /api/ats/scan` (free 3/day then 1cr)
- `GET /api/ats/scan/[id]`
- `POST /api/ats/scan/[id]/share`
- `POST /api/job-packs` (5cr complete)
- `GET /api/job-packs/[id]`
- `GET /api/job-packs/[id]/diff`
- `GET /api/job-packs/[id]/export/[format]` (PDF/DOCX)

**UI:** ATSScanner, ScoreGauge, KeywordList, CulturalWarnings, TailorDiff, JobPackWizard

**Pages:** `/dashboard/scanner`, `/dashboard/job-packs`, `/dashboard/job-packs/[id]`, `/dashboard/job-packs/new`

**Done:** Scan any JD, ATS score breakdown, cultural warnings, tailor-diff shows changes, export works

---

## § Phase 3: Tracking `v0.4.0-tracker`
Application Tracker + Memory Bank + Emails

**DB:** applications, application_stages, generated_emails, reminders

**API:**
- `GET/POST /api/applications`
- `GET/PUT/DELETE /api/applications/[id]`
- `PUT /api/applications/[id]/status`
- `POST/PUT/DELETE /api/applications/[id]/stages`
- `POST /api/applications/stages/[id]/notes` (AI structures)
- `POST /api/applications/stages/[id]/email` (thank-you/follow-up)

**Statuses:** saved → applied → screening → phone → technical → onsite → offer → accepted/declined/rejected/ghosted/withdrawn

**UI:** KanbanBoard, ApplicationList, ApplicationCard, ApplicationForm, StageTimeline, InterviewNotesInput, StructuredNotes, EmailPreview, ReminderList

**Pages:** `/dashboard/applications`, `/dashboard/applications/[id]`, `/dashboard/applications/new`

**Done:** Track apps end-to-end, kanban drag-drop, notes auto-structure, thank-you emails from notes

---

## § Phase 4: Interview `v0.5.0-interview`
Practice Chatbot + Salary + Q&A + Analytics

**DB:** interview_preps (practice_count, last_practiced)

**API:**
- `POST /api/interview-prep` (3cr)
- `GET /api/interview-prep/[id]`
- `POST /api/interview-prep/[id]/practice/start|respond|end` (1cr/10min)
- `GET /api/salary?title&location&yoe`
- `POST /api/qa/answer` (0.5cr)
- `GET /api/analytics/funnel|trends|insights`

**UI:** InterviewPrepView, PracticeChat, ResponseFeedback, PracticeSummary, SalaryChart, NegotiationTips, QAHelper, AnalyticsDashboard, FunnelChart

**Pages:** `/dashboard/interview-prep/[id]`, `/dashboard/interview-prep/[id]/practice`, `/dashboard/salary`, `/dashboard/analytics`

**Done:** Interview prep generates, practice with AI interviewer, STAR feedback, salary data, Q&A helper, analytics

---

## § Phase 5: Extension `v0.6.0-extension`
Chrome Extension for one-click scanning

**Structure:** `extension/` in project root

**Files:**
- manifest.json (V3)
- icons/ (16, 48, 128px)
- popup/ (React UI)
- content-scripts/ (LinkedIn, Indeed, Glassdoor, Greenhouse, Lever detectors)
- background/ (service worker)

**API:**
- `POST /api/extension/score`
- `POST /api/extension/save`
- `POST /api/extension/sync`

**Done:** Extension installable, detects jobs on major sites, shows score in popup, saves to tracker

---

## § Phase 6: Growth `v0.7.0-growth`
Public Tools + Referrals + SEO

**API:**
- `POST /api/public/ats-scan` (IP limit 5/day)
- `GET /api/public/ats/[token]`
- `POST /api/public/roast` (IP limit 3/day)
- `GET /api/public/roast/[token]`
- `GET/POST /api/referrals/code|stats|track`

**DB:** referral_codes, referrals

**Pages:**
- `/tools/ats-checker` (public scanner)
- `/score/[token]` (shareable)
- `/roast`, `/roast/[token]`
- `/resume-tips/[industry]` (20 SEO pages)
- `/resume-examples/[job-title]`

**Landing updates:** Add public scanner section, roast CTA, social proof, referral mention

**Done:** Public ATS works (no auth), roast generates, shareable pages, referrals track, 20 SEO pages

---

## § Phase 7: Polish `v1.0.0-launch`
QA + Performance + Deploy

**Checklist:**
- [ ] Error handling: all API routes return proper errors, error boundaries, toasts
- [ ] Loading states: skeletons, spinners, optimistic UI
- [ ] Mobile: sidebar collapses, kanban scrolls, forms stack
- [ ] Performance: N+1 queries, indexes, lazy load, caching
- [ ] Security: auth on all routes, RLS tested, input sanitization, rate limiting
- [ ] SEO: titles, descriptions, OG images, sitemap, robots.txt
- [ ] Analytics: signup, profile_created, first_scan, purchase events
- [ ] Navigation: sidebar updated, breadcrumbs, empty states

**Deploy:**
- [ ] Vercel env vars
- [ ] Production Stripe webhook
- [ ] Google OAuth redirects
- [ ] Adzuna API key
- [ ] Resend domain verified
- [ ] Full E2E test
- [ ] Monitor 24h

---

## § Conventions

**Files:** `app/(dashboard)/[feature]/page.tsx`, `_components/`, `_actions/`
**API:** `app/api/[feature]/route.ts`
**Types:** `types/[feature].ts`

**Commits:** `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`
**Phase end:** `git tag vX.X.X-phase-name`

**Don't:**
- Use `any` without comment
- Leave console.log
- Skip error handling
- Hardcode secrets
- Rebuild existing features

**AI Models:**
- Flash: ATS, company research, metric mining, interview practice, emails, matching
- Pro: Bullet generation, cover letters only
