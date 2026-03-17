# CVScan MVP Blueprint v2.0
## Job Search Command Center - Built by Claude Code

---

# Overview

## Product Vision

> **"CVScan is your AI career coach that scores, tailors, and coaches you through every job application - from discovery to offer."**

## Core Value Loop

```
DISCOVER → SCORE → TAILOR → APPLY → INTERVIEW → WIN
    ↑                                              │
    └──────────── Learn & Improve ←────────────────┘
```

## Key Differentiators

| Feature | ChatGPT | Jobscan | CVScan |
|---------|---------|---------|-----------|
| ATS Scoring | ❌ | ✅ | ✅ |
| Tailored Generation | Generic | ❌ | ✅ Contextual |
| Metric Mining (AI Interview) | ❌ | ❌ | ✅ |
| Tailor-Diff Visualization | ❌ | ❌ | ✅ |
| Cultural Alignment | ❌ | ❌ | ✅ |
| Company Research | Manual | ❌ | ✅ Auto |
| Interview Practice | ❌ | ❌ | ✅ |
| Job Discovery | ❌ | ❌ | ✅ |
| Post-Interview CRM | ❌ | ❌ | ✅ |
| Browser Extension | ❌ | ✅ | ✅ |

---

# Pricing Model

## Credit Costs

| Action | Credits | Model Used |
|--------|---------|------------|
| ATS Scan | Free (3/day) then 1 | Flash |
| Tailored Bullets | 2 | Pro |
| Cover Letter | 2 | Pro |
| Interview Prep | 3 | Pro |
| Interview Practice (10 min) | 1 | Flash |
| Company Research | 1 | Flash + Search |
| Application Q&A | 1 | Flash |
| Job Discovery Search | 1 | Flash |
| Copilot Chat (per conversation) | 0.5 | Flash |
| **Complete Job Pack** | **5** | Mixed |
| **Job Pack + Interview** | **7** | Mixed |

| Tier | Price | Credits | ~Applications |
|------|-------|---------|---------------|
| Starter Pack | $2.99 | 20 | 4-5 |
| Popular Pack | $4.99 | 50 | 10-12 |
| Pro Pack | $7.99 | 100 | 20-25 |

## Free Tier
- 3 credits on signup
- 3 ATS scans/day (forever)
- Profile creation (unlimited)
- Application tracker (10 active)
- Daily job digest email

---

# Feature Specifications

## F1: Master Profile + Metric Mining Agent

### Metric Mining Flow
```
User: "I managed a team"

AI: "Great! Let me help you quantify that:
    1. How many people were on the team?
    2. Did team performance improve? By what metric?
    3. Any cost savings or revenue impact?
    4. Did you reduce turnover? Improve satisfaction scores?"

User: "12 people, reduced turnover 15%, improved velocity 30%"

AI: "Here's your enhanced bullet:
    'Led a cross-functional team of 12 engineers, reducing turnover by 15% 
    and improving sprint velocity by 30% through mentorship and process optimization'"
```

### Profile Schema
```yaml
MasterProfile:
  personal: {name, email, phone, location, linkedin, portfolio, headline}
  
  experience[]:
    company, title, dates, location
    description
    bullets[]:
      raw_text: "Managed a team"
      mined_metrics: {team_size: 12, turnover_reduction: "15%", velocity_improvement: "30%"}
      enhanced_text: "Led cross-functional team of 12..."
      skills: ["leadership", "mentorship"]
      times_used: 5
      interview_success_rate: 0.4
      
  education[]: {institution, degree, field, dates, gpa, honors}
  
  skills:
    technical[]: {name, proficiency, years}
    soft[]: {name, evidence_bullets[]}
    tools[]: {name, proficiency}
    certifications[]: {name, issuer, date, url}
    
  star_stories[]:
    title, situation, task, action, result
    tags: ["leadership", "conflict", "failure"]
    source_experience_id
    
  career_goals:
    target_roles[], target_industries[], target_companies[]
    salary: {min, target, max}
    location_prefs[], remote_pref, deal_breakers[]
```

---

## F2: ATS Scanner + Tailor-Diff Visualization

### ATS Output
```yaml
ATSScan:
  overall_score: 78
  breakdown:
    hard_skills: 82
    soft_skills: 70
    experience_match: 85
    education_match: 75
    
  keywords:
    found[]: {keyword, count, importance, your_evidence}
    missing[]: {keyword, importance, suggestion}
    to_emphasize[]: {keyword, current_prominence, suggestion}
    
  cultural_alignment:
    detected_tone: "fast-paced startup"
    tone_keywords: ["move fast", "ownership", "scrappy"]
    your_tone: "corporate formal"
    mismatch_warning: "Your bullets sound too formal for this culture"
    adjustment_suggestions[]
    
  recommendations[]:
    priority, type, text, example
```

### Tailor-Diff View
```
┌─────────────────────────────────────────────────────────────────┐
│ TAILOR-DIFF: Your Resume → Stripe PM Role                       │
├────────────────────────────┬────────────────────────────────────┤
│ YOUR MASTER RESUME         │ TAILORED FOR THIS JOB             │
├────────────────────────────┼────────────────────────────────────┤
│ Led product strategy for   │ Led product strategy for          │
│ mobile app                 │ [PAYMENTS] mobile app              │
│                            │ ^^^^^^^^^ (from JD)               │
├────────────────────────────┼────────────────────────────────────┤
│ Increased user retention   │ Increased user retention 40%,     │
│ 40%                        │ driving [ARR GROWTH] through      │
│                            │ [API INTEGRATION] features        │
│                            │ ^^^^^^^^^^^ ^^^^^^^^^^^^^^        │
├────────────────────────────┼────────────────────────────────────┤
│ Keywords Integrated: 8/12 must-have, 5/8 nice-to-have          │
│ Cultural Tone: Adjusted from Formal → Startup                   │
│ Score Improvement: 58% → 84% (+26 points)                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## F3: Job Search Copilot (Chatbot)

### Capabilities
| Command | Action | Credits |
|---------|--------|---------|
| "Score this job: [paste/url]" | ATS scan | Free/1 |
| "Find jobs for me" | Search aggregators, rank by fit | 1 |
| "Research [Company]" | Full company brief | 1 |
| "Prep me for [Company] interview" | Interview prep | 3 |
| "Practice interview for [Company]" | Mock interview | 1/10min |
| "Help me answer: [question]" | Application Q&A | 0.5 |
| "Draft follow-up for [Company]" | Email generation | 0.5 |
| "What's my match for [saved job]?" | Quick analysis | Free |
| "Compare my offers" | Offer comparison | Free |
| "Why am I a fit for [Company]?" | Talking points | Free |

### Context Awareness
Copilot has access to:
- Full Master Profile
- All tracked applications
- Company research cache
- Interview history
- Generated content history

---

## F4: Company Research Agent

### Auto-Generated Research
```yaml
CompanyBrief:
  overview:
    description, website, linkedin
    founded, hq, employees, industry
    
  funding:
    stage, total_raised, last_round, valuation
    investors[]
    
  culture:
    glassdoor_rating, review_count
    pros_summary, cons_summary
    culture_keywords: ["fast-paced", "collaborative"]
    work_life_balance_rating
    
  interview_intel:
    difficulty_rating
    process_stages[]
    common_questions[]
    timeline_days
    tips[]
    
  recent_news[]:
    title, date, summary, url
    
  competitors[]:
    name, how_they_differ
    
  why_join:
    ai_generated_reasons[]
```

---

## F5: Interview Practice Chatbot

### Practice Flow
```
User: Start practice for Stripe PM interview

AI: Starting behavioral interview practice for Stripe PM.
    I'll ask 5 questions, then give feedback.
    
    Question 1: "Tell me about a time you had to make a decision 
    with incomplete data. How did you approach it?"
    
    [User responds verbally or text]
    
AI: Good answer! Here's my feedback:
    ✅ Strong: You gave specific context
    ⚠️ Improve: Add the quantified outcome
    💡 Suggestion: Mention the framework you used
    
    Your STAR structure score: 7/10
    
    Ready for question 2?
```

### Practice Modes
- **Behavioral**: STAR-format questions
- **Technical PM**: Product sense, estimation
- **Case Study**: Business problems
- **Rapid Fire**: Quick Q&A

---

## F6: Post-Interview Memory Bank

### Interview Log
```yaml
InterviewLog:
  application_id
  stage: "Technical Round 1"
  date, duration
  
  interviewers[]:
    name, title, linkedin
    personality_notes: "Very focused on metrics"
    
  raw_notes: "User's brain dump after interview"
  
  ai_structured:
    topics_discussed[]
    questions_asked[]
    your_answers_summary[]
    their_concerns[]
    positive_signals[]
    next_steps_mentioned
    
  generated_content:
    thank_you_email: "Personalized based on discussion"
    follow_up_points[]
    prep_for_next_round[]
```

### Thank-You Email Generation
```
Input: "Talked with Sarah about growth metrics, she seemed 
       interested in my A/B testing experience, mentioned 
       they're expanding to enterprise"

Output:
Subject: Thank you - PM Interview Discussion

Hi Sarah,

Thank you for taking the time to speak with me today about the 
PM role at Stripe. I particularly enjoyed our discussion about 
growth metrics and your team's approach to experimentation.

Your mention of the enterprise expansion plans was exciting - 
my experience driving a 40% conversion improvement through 
systematic A/B testing at [Company] would directly apply to 
optimizing enterprise onboarding flows.

I'm very enthusiastic about the opportunity to contribute to 
Stripe's growth. Please let me know if you need any additional 
information.

Best regards,
[Name]
```

---

## F7: Job Discovery + Aggregator

### Data Sources
- **Adzuna API**: Global job listings
- **RemoteOK API**: Remote jobs
- **HN Who's Hiring**: Startup jobs
- **Company career pages**: Targeted parsing

### Daily Digest Email
```
Subject: 🎯 8 New Jobs Match Your Profile (3 High Matches)

Hi [Name],

Here are today's best matches for "Remote PM at Series B+":

🔥 HIGH MATCHES (80%+)
1. Notion - Senior PM, Growth (Remote) - 87% match
   Salary: $180-220K | Why: Your PLG + growth metrics experience
   [Score] [Create Job Pack] [Save]

2. Linear - Product Manager (Remote) - 84% match
   Salary: $160-200K | Why: Dev tools background
   [Score] [Create Job Pack] [Save]

📊 GOOD MATCHES (70-79%)
3. Loom - PM, Core Product - 76% match
4. Retool - PM, Growth - 74% match

💡 TIP: Adding "video/media" skills would improve matches for Loom

[View All Jobs] [Adjust Search]
```

---

## F8: Browser Extension

### Supported Sites
- LinkedIn Jobs, Indeed, Glassdoor
- Wellfound/AngelList
- Lever/Greenhouse job pages
- Generic career pages

### Extension Popup
```
┌─────────────────────────────────────────┐
│ 🎯 CVScan                           [x] │
├─────────────────────────────────────────┤
│ Detected: Senior PM at Stripe           │
│                                         │
│ Your Match: 84% ████████████████░░      │
│                                         │
│ ✅ Strong: PLG, Growth, B2B            │
│ ⚠️ Gap: Payments experience            │
│ Cultural Fit: Startup ✓                 │
│                                         │
│ [Create Job Pack - 5 credits]           │
│ [Quick Bullets - 2 credits]             │
│ [Save to Tracker]                       │
│                                         │
│ Credits: 23 remaining                   │
└─────────────────────────────────────────┘
```

---

## F9: Salary Intelligence

### Data Display
```
┌─────────────────────────────────────────────────────────────┐
│ 💰 PM Salary: San Francisco, 5 YOE                          │
├─────────────────────────────────────────────────────────────┤
│ Market Range:                                               │
│ $140K ────[═══════════════]──── $250K                      │
│      25th   50th:$185K   75th                              │
│                                                             │
│ By Company Stage:                                           │
│ FAANG:      $200K - $350K (median $250K + equity)          │
│ Series D+:  $170K - $240K (median $195K)                   │
│ Series B-C: $150K - $200K (median $175K)                   │
│                                                             │
│ Your Stripe Offer: $195K base + $150K equity               │
│ Assessment: ✅ 65th percentile for stage                   │
└─────────────────────────────────────────────────────────────┘
```

---

## F10: Application Q&A Answerer

### Common Questions Handled
- "Why do you want to work here?"
- "What's your greatest weakness?"
- "Where do you see yourself in 5 years?"
- "Why are you leaving your current job?"
- "Tell me about yourself"
- Custom questions from applications

---

# Database Schema

```sql
-- Core tables (essential fields only, full implementation in code)

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name VARCHAR(255),
  headline VARCHAR(255),
  location JSONB,
  contact JSONB,
  career_goals JSONB,
  profile_strength INTEGER DEFAULT 0,
  settings JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  dates JSONB NOT NULL,
  location VARCHAR(255),
  description TEXT,
  tools TEXT[],
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE bullets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id UUID REFERENCES experiences(id) ON DELETE CASCADE,
  raw_text TEXT NOT NULL,
  enhanced_text TEXT,
  mined_metrics JSONB,
  skills TEXT[],
  times_used INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  institution VARCHAR(255) NOT NULL,
  degree VARCHAR(100),
  field VARCHAR(255),
  dates JSONB,
  gpa DECIMAL(3,2),
  honors TEXT[],
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  proficiency VARCHAR(50),
  years INTEGER,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE star_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content JSONB NOT NULL,
  tags TEXT[],
  source_experience_id UUID REFERENCES experiences(id),
  times_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  url VARCHAR(500),
  job_description TEXT,
  location VARCHAR(255),
  salary_range JSONB,
  source VARCHAR(100),
  status VARCHAR(50) DEFAULT 'saved',
  priority VARCHAR(20) DEFAULT 'medium',
  applied_at DATE,
  ats_score INTEGER,
  cultural_score INTEGER,
  notes TEXT,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE application_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  stage_type VARCHAR(50) NOT NULL,
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  interviewers JSONB,
  raw_notes TEXT,
  ai_structured JSONB,
  outcome VARCHAR(50),
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE generated_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id UUID REFERENCES application_stages(id) ON DELETE CASCADE,
  email_type VARCHAR(50),
  content TEXT NOT NULL,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE job_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  application_id UUID REFERENCES applications(id),
  job_description TEXT NOT NULL,
  company VARCHAR(255),
  title VARCHAR(255),
  ats_score INTEGER,
  ats_breakdown JSONB,
  keywords JSONB,
  cultural_analysis JSONB,
  tailored_bullets JSONB,
  cover_letter TEXT,
  application_answers JSONB,
  diff_data JSONB,
  pack_type VARCHAR(50),
  credits_charged INTEGER,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE interview_preps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  application_id UUID REFERENCES applications(id),
  interview_type VARCHAR(50),
  content JSONB NOT NULL,
  practice_count INTEGER DEFAULT 0,
  last_practiced TIMESTAMPTZ,
  credits_charged INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE company_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_normalized VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(255),
  data JSONB NOT NULL,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  ttl_days INTEGER DEFAULT 7
);

CREATE TABLE saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  filters JSONB NOT NULL,
  notify BOOLEAN DEFAULT TRUE,
  notify_frequency VARCHAR(20) DEFAULT 'daily',
  last_run TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE discovered_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  search_id UUID REFERENCES saved_searches(id),
  external_id VARCHAR(255),
  source VARCHAR(100),
  data JSONB NOT NULL,
  match_score INTEGER,
  match_reasons JSONB,
  status VARCHAR(50) DEFAULT 'new',
  discovered_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  context JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  description VARCHAR(255),
  reference_type VARCHAR(50),
  reference_id UUID,
  stripe_id VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE referral_codes (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  code VARCHAR(10) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES auth.users(id),
  referee_id UUID REFERENCES auth.users(id),
  code VARCHAR(10),
  signed_up_at TIMESTAMPTZ,
  purchased_at TIMESTAMPTZ,
  credits_awarded INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  application_id UUID REFERENCES applications(id),
  title VARCHAR(255) NOT NULL,
  message TEXT,
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Essential indexes
CREATE INDEX idx_experiences_user ON experiences(user_id);
CREATE INDEX idx_bullets_exp ON bullets(experience_id);
CREATE INDEX idx_applications_user ON applications(user_id);
CREATE INDEX idx_applications_status ON applications(user_id, status);
CREATE INDEX idx_stages_app ON application_stages(application_id);
CREATE INDEX idx_job_packs_user ON job_packs(user_id);
CREATE INDEX idx_company_cache_name ON company_cache(name_normalized);
CREATE INDEX idx_discovered_user ON discovered_jobs(user_id, status);
CREATE INDEX idx_conversations_user ON conversations(user_id);
CREATE INDEX idx_messages_conv ON messages(conversation_id);
CREATE INDEX idx_transactions_user ON credit_transactions(user_id);
```

---

# Implementation Phases

## Token Optimization Strategy

| Task Type | Model | Why |
|-----------|-------|-----|
| ATS keyword extraction | Flash | Structured output |
| Cultural tone analysis | Flash | Pattern matching |
| Bullet generation | Pro | Quality matters |
| Cover letter | Pro | Quality matters |
| Company research | Flash + Search | Aggregation |
| Metric mining questions | Flash | Conversational |
| Interview practice | Flash | Speed needed |
| Thank-you emails | Flash | Template-based |
| Job matching | Flash | Batch processing |

---

## Phase 0: Foundation
**Duration:** 3-4 days | **Commit:** `v0.1.0-foundation`

### Features
1. Database Migration - Full schema
2. Master Profile CRUD
3. Metric Mining Agent
4. Credit System

### Tasks
```
□ Deploy Supabase schema
□ Create RLS policies
□ Profile API (CRUD)
□ Experience + bullets API
□ Education + skills API
□ Metric Mining prompt + flow
□ Credit balance API
□ Credit deduction middleware
□ Profile strength calculator
□ Basic tests
```

### Key Prompt: Metric Mining
```
You help users quantify resume achievements. 
Given "{bullet}", ask 2-3 specific questions about:
- Numbers (team size, users, revenue, %)
- Timeframes (how long, deadlines)
- Comparisons (before/after)
Return JSON array of questions.
```

**COMMIT AFTER PHASE 0 COMPLETE**

---

## Phase 1: Intelligence Core
**Duration:** 5-6 days | **Commit:** `v0.2.0-intelligence`

### Features
1. Job Search Copilot (chatbot)
2. Company Research Agent
3. Job Discovery (Adzuna integration)
4. Daily Job Digest emails

### Tasks
```
□ Copilot chat API + streaming
□ Conversation storage
□ Context builder (profile + apps)
□ Company research prompts
□ Company cache (7 day TTL)
□ Adzuna API integration
□ Job matching algorithm
□ Saved searches CRUD
□ Daily digest email (Resend)
□ Digest cron job
□ Copilot UI
□ Job discovery UI
```

### Key Prompt: Company Research
```
Research {company} using web search. Return structured JSON:
- Overview: description, founded, HQ, size, industry
- Funding: stage, raised, valuation
- Culture: Glassdoor rating, pros/cons
- Interview: questions, process, difficulty
- News: last 3 items
Don't fabricate - use null for unavailable data.
```

**COMMIT AFTER PHASE 1 COMPLETE**

---

## Phase 2: Job Pack System
**Duration:** 5-6 days | **Commit:** `v0.3.0-jobpacks`

### Features
1. ATS Scanner (full analysis)
2. Tailor-Diff Visualization
3. Cultural Alignment Scoring
4. Job Pack Generator (bullets + cover letter)

### Tasks
```
□ ATS scanning prompt + API
□ Keyword extraction (found/missing)
□ Cultural tone detection
□ Tailored bullet generation
□ Cover letter generation
□ Tailor-diff computation
□ Job Pack bundling
□ PDF/DOCX export
□ Free scan rate limiting
□ Job Pack wizard UI
□ Tailor-diff component
□ Cultural warnings UI
```

### Key Prompt: ATS + Cultural
```
Analyze job description for ATS and cultural fit.

Return JSON:
- extracted: {title, company, years_required}
- keywords: {hard_skills[], soft_skills[], tools[]}
- scores: {hard, soft, experience, education, overall}
- cultural: {detected_tone, candidate_tone, alignment_score, warnings[], suggestions[]}
- recommendations[]
```

**COMMIT AFTER PHASE 2 COMPLETE**

---

## Phase 3: Application Tracking
**Duration:** 4-5 days | **Commit:** `v0.4.0-tracker`

### Features
1. Application Tracker (Kanban + list)
2. Interview Stage Management
3. Post-Interview Memory Bank
4. Thank-You Email Generator

### Tasks
```
□ Application CRUD API
□ Status pipeline logic
□ Stage management API
□ Raw notes storage
□ AI note structuring
□ Thank-you email generation
□ Follow-up email generation
□ Reminder scheduling
□ Kanban board UI
□ List view UI
□ Stage detail modal
□ Email preview UI
```

### Key Prompt: Structure Notes
```
Process raw interview notes into structured data:
- topics_discussed[]
- questions_they_asked[]
- their_concerns[]
- positive_signals[]
- next_steps_mentioned
- follow_up_points[]
```

### Key Prompt: Thank-You Email
```
Write personalized thank-you referencing specific discussion.
Address concerns raised. Professional but warm, under 200 words.
```

**COMMIT AFTER PHASE 3 COMPLETE**

---

## Phase 4: Interview & Salary
**Duration:** 5-6 days | **Commit:** `v0.5.0-interview`

### Features
1. Interview Practice Chatbot
2. Salary Intelligence
3. Application Q&A Answerer
4. Success Analytics

### Tasks
```
□ Practice session management
□ Question generation prompt
□ Response evaluation prompt
□ STAR scoring
□ Practice summary
□ Salary data aggregation
□ Salary display API
□ Negotiation tips
□ Application Q&A prompt
□ Analytics calculations
□ Practice chatbot UI
□ Salary UI
□ Analytics dashboard
```

### Key Prompt: Evaluate Response
```
Score interview response on STAR (1-10).
Return: strengths[], improvements[], missing_elements[], 
suggested_addition, relevant_story_hint
```

**COMMIT AFTER PHASE 4 COMPLETE**

---

## Phase 5: Browser Extension
**Duration:** 5-6 days | **Commit:** `v0.6.0-extension`

### Features
1. Chrome Extension core
2. Job Page Detection (multi-site)
3. One-Click Operations
4. Web App Sync

### Tasks
```
□ Extension manifest
□ Auth token management
□ Job page content scripts
□ LinkedIn detector
□ Indeed detector
□ Glassdoor detector
□ Greenhouse/Lever detector
□ Generic page detector
□ Job description extractor
□ Extension popup UI
□ Quick ATS display
□ Save/create actions
□ Sync service
□ Chrome Web Store prep
```

### Detection Config
```javascript
const DETECTORS = {
  linkedin: { 
    pattern: /linkedin\.com\/jobs/,
    selectors: { title: '.job-title', company: '.company-name', desc: '.description' }
  },
  indeed: { pattern: /indeed\.com\/viewjob/, selectors: {...} },
  greenhouse: { pattern: /boards\.greenhouse\.io/, selectors: {...} },
  lever: { pattern: /jobs\.lever\.co/, selectors: {...} },
  generic: { pattern: /.*/, selectors: {...} }
};
```

**COMMIT AFTER PHASE 5 COMPLETE**

---

## Phase 6: Growth & Automation
**Duration:** 4-5 days | **Commit:** `v0.7.0-growth`

### Features
1. Free Public ATS Scanner
2. Resume Roast (viral)
3. Referral System
4. SEO Pages (first 20)

### Tasks
```
□ Public ATS endpoint (no auth)
□ IP rate limiting
□ Shareable results page
□ OG image generation
□ Resume roast prompt
□ Roast results page
□ Referral code generation
□ Referral tracking
□ Credit awarding
□ Referral dashboard
□ SEO page templates
□ Generate 20 SEO pages
□ Public scanner landing
□ Roast landing
```

### Key Prompt: Resume Roast
```
Roast this resume humorously but helpfully.
Grade A-F. 3 good things, 3 bad things, 3 brutal observations.
End constructively with CTA.
```

**COMMIT AFTER PHASE 6 COMPLETE**

---

## Phase 7: Polish & Launch
**Duration:** 3-4 days | **Commit:** `v1.0.0-launch`

### Tasks
```
□ End-to-end testing
□ Error handling audit
□ Loading states audit
□ Mobile responsiveness
□ Performance optimization
□ Security audit
□ Analytics verification
□ Monitoring setup (Sentry)
□ Documentation
□ Launch checklist
□ Product Hunt prep
```

### Launch Checklist
- [ ] All features working E2E
- [ ] Stripe webhooks production
- [ ] Emails tested
- [ ] Extension in Chrome Store
- [ ] SEO pages indexed
- [ ] Error monitoring active
- [ ] Support email configured

**COMMIT v1.0.0 AND LAUNCH**

---

# API Reference

```yaml
Auth:
  POST /auth/signup, /login, /logout
  GET  /auth/session

Profile:
  GET/PUT /profile
  CRUD /profile/experiences/:id
  CRUD /profile/bullets/:id
  CRUD /profile/education/:id
  CRUD /profile/skills/:id
  CRUD /profile/stories/:id
  POST /profile/mine-metrics

Applications:
  GET/POST /applications
  GET/PUT/DELETE /applications/:id
  PUT /applications/:id/status
  CRUD /applications/:id/stages/:stageId
  POST /applications/:id/stages/:stageId/notes
  POST /applications/:id/stages/:stageId/email

Job Packs:
  POST /job-packs
  GET /job-packs/:id
  GET /job-packs/:id/diff
  GET /job-packs/:id/export/:format

ATS:
  POST /ats/scan
  GET /ats/scan/:id
  POST /ats/scan/:id/share
  GET /public/ats/:token

Interview:
  POST /interview-prep
  GET /interview-prep/:id
  POST /interview-prep/:id/practice/start
  POST /interview-prep/:id/practice/respond
  POST /interview-prep/:id/practice/end

Copilot:
  POST /copilot/chat
  GET /copilot/conversations/:id

Company:
  GET /company/:name
  POST /company/:name/refresh

Jobs:
  GET /jobs/discover
  CRUD /jobs/searches/:id
  POST /jobs/discovered/:id/action

Salary:
  GET /salary?title=&location=&yoe=

Analytics:
  GET /analytics/funnel
  GET /analytics/trends
  GET /analytics/insights

Credits:
  GET /credits/balance
  GET /credits/transactions
  POST /credits/purchase

Referrals:
  GET /referrals/code
  GET /referrals/stats

Public:
  POST /public/ats-scan
  POST /public/roast
```

---

# Claude Code Instructions

## Workflow Per Phase

```bash
# Start phase
git checkout -b phase-X-name

# During development - commit frequently
git commit -m "feat: description"

# End of phase
npm run test && npm run lint && npm run build
git tag vX.X.X-phase-name
git checkout main && git merge phase-X-name
git push origin main --tags
```

## File Structure

```
/lib/prompts/          # All AI prompts
  ats-analysis.ts
  bullet-generation.ts
  cover-letter.ts
  cultural-analysis.ts
  company-research.ts
  interview-practice.ts
  metric-mining.ts
  roast.ts

/lib/ai/
  model-selector.ts    # Flash vs Pro selection
  context-builder.ts   # Build user context for AI
```

## Model Selection

```typescript
const FLASH_TASKS = [
  'ats-keywords', 'cultural-tone', 'company-research',
  'metric-mining', 'interview-practice', 'thank-you-email',
  'job-matching', 'roast'
];

const PRO_TASKS = [
  'bullet-generation', 'cover-letter', 'star-story'
];

export const getModel = (task: string) => 
  FLASH_TASKS.includes(task) ? 'flash' : 'pro';
```

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GOOGLE_AI_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
RESEND_API_KEY=
ADZUNA_APP_ID=
ADZUNA_API_KEY=
```

---

# Success Metrics

| Phase | Key Metric | Target |
|-------|------------|--------|
| 0 | Profile completion | 60% |
| 1 | Copilot messages/user | 3+ |
| 2 | Job Packs/paying user | 5+ |
| 3 | Applications tracked | 10+ |
| 4 | Practice sessions | 2+ |
| 5 | Extension installs | 500+ |
| 6 | Organic signups | 30% |
| 7 | Paying customers | 100+ |

## North Stars
- Weekly Active Users: 60%+
- Free → Paid: 15%
- 30-Day Retention: 45%
- LTV: $25+

---

*Version: 2.0 | Ready for Claude Code Implementation*
