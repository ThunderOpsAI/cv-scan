# Required APIs for Job Aggregator

To power the Job Search / Aggregator feature, please sign up for these APIs and add their keys to our [.env.local](file:///Users/Thunderops/Documents/Projects/cv-scan/.env.local) file:

## 1. Adzuna API (Global Job Listings)
Adzuna provides a great global API for job search.
- **Signup URL:** https://developer.adzuna.com/
- **Required Env Vars:**
  - `ADZUNA_APP_ID=`
  - `ADZUNA_APP_KEY=`

## 2. Jooble API (Aggregator)
Jooble aggregates from many job boards.
- **Signup URL:** https://jooble.org/api/about
- **Required Env Vars:**
  - `JOOBLE_API_KEY=`

## 3. LinkedIn / Indeed / Seek (via RapidAPI or Scraper API)
Direct APIs for these platforms are heavily restricted. We recommend using a unified API from RapidAPI, such as "JSearch" or "Active Jobs DB".
- **Recommended (JSearch via RapidAPI):** https://rapidapi.com/letscrape-6bRBa3QG1q/api/jsearch
- **Required Env Vars:**
  - `RAPIDAPI_KEY=`

## 4. RemoteOK API (For Remote & Tech Jobs)
RemoteOK offers a free JSON feed without an explicit key.
- **URL:** `https://remoteok.com/api`
- No key strictly required, but setting a user-agent helps.

---
*Once you have these, I'll wire them up in [app/api/jobs/discover/route.ts](file:///Users/Thunderops/Documents/Projects/cv-scan/app/api/jobs/discover/route.ts).*
