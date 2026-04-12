# CVScan — Credit cost map

Aligned with Build Spec Phase 3.2. Amounts are enforced in API routes and mirrored in `app/lib/billing/credit-costs.ts`. Product owner should confirm before going live; Stripe package sizes are separate from per-action costs.

| Action | Credits | API / notes |
|--------|---------|-------------|
| Job fit analysis | 1 | `POST /api/jobs/[jobId]/fit` |
| Tailored bullets (per job) | 1 | `POST /api/jobs/[jobId]/generate/bullets` |
| Tailored cover letter (per job) | 2 | `POST /api/jobs/[jobId]/generate/cover-letter` |
| Standalone bullets | 1 | `POST /api/generate/bullets` |
| Standalone cover letter | 2 | `POST /api/generate/cover-letter` |
| Follow-up email draft | 1 | `POST /api/generate/follow-up` |
| ATS scan | 1 | `POST /api/ats/scan` |
| Job pack | 5 | `POST /api/job-packs` |
| Copilot chat message | 1 | `POST /api/copilot/chat` |
| Interview prep chat | 1 credit per reply | `POST /api/interview/chat` — **also requires `plan_tier` ≥ Starter** (Build Spec 3.3); credits alone do not unlock this route. |
| Application email draft | 1 | `POST /api/applications/emails` |
| Company intel | 1 | `GET/POST /api/company/[name]` |
| Mine metrics | 1 | `POST /api/profile/mine-metrics` |

**Idempotency:** Debit RPCs accept `p_reference_id`. Clients may send `x-idempotency-key` on retried requests so the same reference is used and credits are not deducted twice.

**Ledger:** Balances are derived from `credit_ledger` (sum of signed `amount`); `users.credits` is kept in sync for compatibility.
