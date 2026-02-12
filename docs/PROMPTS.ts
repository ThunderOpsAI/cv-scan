/**
 * CVScan AI Prompts
 * Copy these into lib/ai/prompts/ as needed
 * Use Gemini Flash unless marked [PRO]
 */

// ============================================
// PHASE 0: Metric Mining
// ============================================

export const METRIC_MINING_QUESTIONS = `
Given this resume bullet: "{bullet}"

Ask 2-3 specific questions to extract metrics:
- Numbers (team size, users, revenue, percentages)
- Timeframes (duration, deadlines met)
- Comparisons (before/after, vs benchmark)
- Scope (budget, geographic reach)

Return JSON only:
{ "questions": ["question1", "question2", "question3"] }
`;

// [PRO] - Quality matters for final bullet
export const ENHANCE_BULLET = `
Original bullet: "{raw_bullet}"
User's answers: {answers}

Rewrite using XYZ format: "Accomplished [X] as measured by [Y], by doing [Z]"

Rules:
- Start with strong action verb
- Include all provided metrics naturally
- Keep under 2 lines
- Make ATS-friendly (no fancy formatting)

Return JSON only:
{
  "enhanced_text": "the improved bullet",
  "skills": ["skill1", "skill2"],
  "metrics": {"metric_name": "value"}
}
`;

// ============================================
// PHASE 1: Copilot & Research
// ============================================

export const COPILOT_SYSTEM = `
You are a job search assistant for CVScan. You have context about the user.

USER PROFILE:
{profile_summary}

ACTIVE APPLICATIONS:
{applications_summary}

Available commands (user can say naturally):
- Score a job (ATS analysis)
- Find jobs (search job boards)
- Research a company
- Prep for interview
- Practice interview
- Draft follow-up email
- Help with application questions

Be helpful and concise. For paid actions, confirm credits first.
Don't use markdown formatting in responses.
`;

export const COMPANY_RESEARCH = `
Research {company} and return structured information.

Find:
1. Overview: description, founded year, HQ location, employee count, industry
2. Funding: stage, total raised, last round, valuation (if available)
3. Culture: Glassdoor rating, top pros, top cons
4. Interview: difficulty rating, common questions, process stages
5. Recent news: last 2-3 relevant items

Return JSON only:
{
  "overview": {
    "description": "",
    "founded": null,
    "hq": "",
    "employees": "",
    "industry": ""
  },
  "funding": {
    "stage": "",
    "raised": "",
    "valuation": ""
  },
  "culture": {
    "rating": null,
    "pros": [""],
    "cons": [""]
  },
  "interview": {
    "difficulty": null,
    "questions": [""],
    "process": [""]
  },
  "news": [{"title": "", "date": "", "summary": ""}]
}

Use null for unavailable data. Do not fabricate.
`;

export const JOB_MATCHING = `
Score how well this candidate matches the job.

JOB:
{job_description}

CANDIDATE PROFILE:
{profile_summary}

Return JSON only:
{
  "score": 0-100,
  "strong_matches": ["reason1", "reason2"],
  "gaps": ["gap1", "gap2"],
  "one_liner": "One sentence why they match"
}
`;

// ============================================
// PHASE 2: ATS & Job Packs
// ============================================

export const ATS_ANALYSIS = `
Analyze this job description for ATS optimization.

JOB DESCRIPTION:
{job_description}

CANDIDATE RESUME/PROFILE:
{profile_summary}

Return JSON only:
{
  "extracted": {
    "title": "",
    "company": "",
    "years_required": null,
    "education_required": ""
  },
  "keywords": {
    "hard_skills": [{"skill": "", "importance": "high|med|low", "found": true|false}],
    "soft_skills": [{"skill": "", "importance": "", "found": true|false}],
    "tools": [{"tool": "", "importance": "", "found": true|false}]
  },
  "scores": {
    "hard_skills": 0-100,
    "soft_skills": 0-100,
    "experience": 0-100,
    "education": 0-100,
    "overall": 0-100
  },
  "recommendations": [
    {"priority": 1, "type": "add|emphasize|remove", "text": ""}
  ]
}
`;

export const CULTURAL_ANALYSIS = `
Analyze the cultural tone of this job description.

JOB DESCRIPTION:
{job_description}

CANDIDATE'S WRITING SAMPLE:
{sample_bullets}

Return JSON only:
{
  "detected_tone": "startup|corporate|academic|sales|technical",
  "tone_evidence": ["quote from JD showing tone"],
  "candidate_tone": "startup|corporate|academic|sales|technical",
  "alignment_score": 0-100,
  "warnings": ["warning if mismatch"],
  "suggestions": ["how to adjust"]
}
`;

// [PRO] - Quality matters
export const TAILOR_BULLETS = `
Tailor these resume bullets for the specific job.

ORIGINAL BULLETS:
{bullets}

JOB DESCRIPTION:
{job_description}

KEYWORDS TO INTEGRATE:
{keywords}

CULTURAL TONE TARGET:
{target_tone}

Rules:
- Integrate keywords naturally (don't stuff)
- Adjust tone to match company culture
- Keep achievements and metrics
- Don't fabricate new accomplishments

Return JSON only:
{
  "tailored": [
    {
      "original": "",
      "tailored": "",
      "keywords_added": [],
      "changes": "brief description of what changed"
    }
  ]
}
`;

// [PRO] - Quality matters
export const COVER_LETTER = `
Write a cover letter for this job application.

JOB:
{job_title} at {company}

JOB DESCRIPTION:
{job_description}

CANDIDATE PROFILE:
{profile_summary}

TOP MATCHING POINTS:
{match_points}

COMPANY RESEARCH:
{company_brief}

Rules:
- 3-4 paragraphs, under 300 words
- Opening: Hook + specific interest in THIS company
- Middle: 2-3 specific qualifications that match their needs
- Close: Enthusiasm + call to action
- Match the cultural tone ({tone})
- Don't repeat the resume, add context/personality

Return the cover letter text only, no JSON.
`;

// ============================================
// PHASE 3: Interview Notes & Emails
// ============================================

export const STRUCTURE_INTERVIEW_NOTES = `
Process these raw interview notes into structured insights.

RAW NOTES:
{raw_notes}

CONTEXT:
Company: {company}
Role: {role}
Interviewer: {interviewer_name}, {interviewer_title}

Return JSON only:
{
  "topics_discussed": ["topic1", "topic2"],
  "questions_asked": ["question1", "question2"],
  "your_answers_summary": ["brief summary of your answers"],
  "their_concerns": ["any hesitation or concerns you noticed"],
  "positive_signals": ["signs of interest"],
  "next_steps": "what they said about next steps",
  "follow_up_points": ["things to emphasize in follow-up"]
}
`;

export const THANK_YOU_EMAIL = `
Write a thank-you email after an interview.

INTERVIEW NOTES:
{structured_notes}

CANDIDATE: {candidate_name}
INTERVIEWER: {interviewer_name}
COMPANY: {company}
ROLE: {role}

Rules:
- Reference 1-2 specific topics discussed
- Address any concerns they raised (subtly)
- Reinforce your fit
- Professional but warm tone
- Under 150 words

Return JSON only:
{
  "subject": "email subject line",
  "body": "email body text"
}
`;

export const FOLLOW_UP_EMAIL = `
Write a follow-up email for a job application.

CONTEXT:
Days since last contact: {days}
Last interaction: {last_interaction}
Company: {company}
Role: {role}

Rules:
- Brief and respectful of their time
- Show continued interest
- Don't be pushy
- Under 100 words

Return JSON only:
{
  "subject": "",
  "body": ""
}
`;

// ============================================
// PHASE 4: Interview Practice
// ============================================

export const GENERATE_INTERVIEW_QUESTION = `
Generate an interview question for practice.

CONTEXT:
Role: {job_title} at {company}
Interview type: {type} (behavioral/technical/case)
Questions already asked: {previous_questions}
Company culture: {cultural_keywords}

Return JSON only:
{
  "question": "the full question",
  "category": "leadership|conflict|failure|success|technical|product",
  "what_theyre_testing": "brief explanation",
  "suggested_star_tags": ["tags that match user's STAR stories"]
}
`;

export const EVALUATE_INTERVIEW_RESPONSE = `
Evaluate this interview response.

QUESTION: {question}
CANDIDATE'S RESPONSE: {response}
WHAT THEY'RE TESTING: {testing}
CANDIDATE'S STAR STORIES: {stories}

Return JSON only:
{
  "star_score": 1-10,
  "strengths": ["what they did well"],
  "improvements": ["specific suggestions"],
  "missing_elements": ["STAR components missing"],
  "suggested_addition": "one sentence to strengthen the answer",
  "relevant_story_hint": "if they have a better story for this"
}
`;

export const PRACTICE_SESSION_SUMMARY = `
Summarize this interview practice session.

QUESTIONS AND RESPONSES:
{qa_pairs}

Return JSON only:
{
  "overall_score": 1-10,
  "strongest_area": "",
  "weakest_area": "",
  "patterns": ["patterns noticed across answers"],
  "priority_improvements": ["top 3 things to work on"],
  "stories_to_prepare": ["STAR stories they should develop"]
}
`;

// ============================================
// PHASE 4: Application Q&A
// ============================================

export const ANSWER_APPLICATION_QUESTION = `
Help answer this job application question.

QUESTION: {question}
JOB: {job_title} at {company}
JOB DESCRIPTION: {job_description}
CANDIDATE PROFILE: {profile_summary}

Rules:
- Be specific to THIS job and company
- Draw from candidate's actual experience
- Be concise but complete
- Sound human, not AI-generated

Return the answer text only, no JSON. Keep under 200 words.
`;

// ============================================
// PHASE 6: Resume Roast
// ============================================

export const RESUME_ROAST = `
Roast this resume humorously but helpfully.

RESUME:
{resume_text}

Rules:
- Be funny but not cruel
- Don't mock personal details or career choices
- Focus on writing quality, formatting, clarity
- Actually be helpful underneath the humor
- End constructively

Return JSON only:
{
  "grade": "A|B|C|D|F",
  "tagline": "Witty one-liner about this resume",
  "good": ["3 genuine positives"],
  "bad": ["3 real problems"],
  "brutal": ["2-3 brutal but fair observations"],
  "verdict": "2-3 sentence summary",
  "cta": "Constructive call to action"
}
`;
