# CVScan Analytics

Phase 1.4 stores server-side product events in `analytics_events`.

Do not put resume text, job descriptions, cover letters, email addresses, names, URLs, tokens, or raw messages in analytics properties. Event properties should be small counts, booleans, status values, IDs, and non-sensitive workflow metadata.

## Core Event Taxonomy

- `user_signed_up`
- `resume_imported`
- `facts_reviewed`
- `job_fit_run`
- `tailoring_run`
- `cover_letter_run`
- `application_saved`
- `interview_prep_run`
- `credit_purchased`
- `credit_spent`
- `critical_error`

## Funnel Query

Run with service-role/admin database access:

```sql
SELECT
  COUNT(DISTINCT user_id) FILTER (WHERE event_name = 'user_signed_up') AS signups,
  COUNT(DISTINCT user_id) FILTER (WHERE event_name = 'job_fit_run') AS activations,
  COUNT(DISTINCT user_id) FILTER (WHERE event_name = 'credit_purchased') AS first_purchases
FROM analytics_events
WHERE created_at >= NOW() - INTERVAL '30 days';
```

For daily trend reporting:

```sql
SELECT
  DATE_TRUNC('day', created_at) AS day,
  event_name,
  COUNT(*) AS events,
  COUNT(DISTINCT user_id) AS users
FROM analytics_events
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY 1, 2
ORDER BY 1 DESC, 2;
```
