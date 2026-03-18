# Required APIs for Job Aggregator

To power the current Job Discovery flow, add the following keys to `.env.local`.

The implemented providers in the repo are:
- Adzuna
- JSearch (via RapidAPI)
- RemoteOK

## 1. Adzuna API
Adzuna is the primary structured job source in the current implementation.

- Signup URL: https://developer.adzuna.com/
- Required env vars:
  - `ADZUNA_APP_ID=`
  - `ADZUNA_API_KEY=`

## 2. JSearch via RapidAPI
This is the current "multi-board" provider used in code for broader coverage.

- Signup URL: https://rapidapi.com/letscrape-6bRBa3QG1q/api/jsearch
- Required env vars:
  - `RAPIDAPI_KEY=`

## 3. RemoteOK
RemoteOK is already wired as a no-key provider for remote roles.

- Feed URL: `https://remoteok.com/api`
- Required env vars:
  - None

## Notes

- Jooble is **not** currently wired into `app/api/jobs/discover/route.ts`.
- The route currently imports and runs `searchJobs`, `searchRemoteOk`, and `searchJSearch` in parallel.
- If Adzuna or RapidAPI keys are missing, the aggregator will either error for that provider or return fewer results.

## Related non-job APIs you will still need elsewhere in the app

These are not part of the job aggregator itself, but they matter for the broader walkthrough:
- `GEMINI_API_KEY=`
- `NEXT_PUBLIC_SUPABASE_URL=`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=`
- `SUPABASE_SERVICE_ROLE_KEY=`
- `NEXTAUTH_SECRET=`
- `NEXTAUTH_URL=`
- `GOOGLE_CLIENT_ID=`
- `GOOGLE_CLIENT_SECRET=`
