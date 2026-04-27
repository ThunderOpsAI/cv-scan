# CVScan — Pre-Submission Checklist

> **Prepared by:** Agent 6 — April 2026
> **Version:** Closed Beta (AU/NZ)
> **Verified against:** Play Console requirements, AGENT_HANDOVER.md (Agents 1–6)

---

## ⬛ Section 1: Build & Versioning

| # | Check | Status | Notes |
|---|---|---|---|
| 1.1 | `versionCode` incremented from previous build | ☐ | Must be strictly increasing integer (e.g., 1) |
| 1.2 | `versionName` set to semantic version (e.g., `0.1.0-beta.1`) | ☐ | Human-readable only |
| 1.3 | Build variant is `release` (not `debug`) | ☐ | Debug builds cannot be published |
| 1.4 | ProGuard / R8 minification enabled for release | ☐ | Check `minifyEnabled true` in release build config |
| 1.5 | No debug logging, test credentials, or hardcoded secrets in release build | ☐ | Search for `TODO`, `FIXME`, `console.log`, hardcoded tokens |
| 1.6 | `android:debuggable="false"` in release manifest | ☐ | Confirmed by release build type |
| 1.7 | Target SDK meets Play minimum (currently API 34 for new apps as of 2024) | ☐ | Check in `build.gradle`: `targetSdk 34` |
| 1.8 | Minimum SDK set appropriately (recommend API 26 / Android 8.0+) | ☐ | |

---

## ⬛ Section 2: App Signing (AAB)

| # | Check | Status | Notes |
|---|---|---|---|
| 2.1 | App signed with Play App Signing (Google-managed key) | ☐ | Recommended for production; avoids keystore loss risk |
| 2.2 | Upload key (developer key) stored securely in password manager | ☐ | NEVER commit keystore to repository |
| 2.3 | `.aab` format uploaded (not `.apk`) | ☐ | Play Console requires AAB for new apps since 2021 |
| 2.4 | AAB passes Play Console pre-launch validation | ☐ | Check "Pre-launch report" in Play Console |
| 2.5 | Keystore alias, key alias, and store password documented securely | ☐ | Store in 1Password / Bitwarden — NOT in repo |
| 2.6 | `google-services.json` for production project (not dev/staging) | ☐ | Confirm Firebase project if applicable |

---

## ⬛ Section 3: Play Console Required URLs

All URLs must be publicly accessible **without login** at time of submission.

| # | URL | Required? | Current Status |
|---|---|---|---|
| 3.1 | **Privacy Policy** → `https://cvscan.com/privacy` | ✅ Mandatory | Implemented ✅ |
| 3.2 | **External Deletion URL** → `https://cvscan.com/delete-account` | ✅ Mandatory | Implemented ✅ (Agent 6) |
| 3.3 | **Support URL/Email** → `https://cvscan.com` or `mailto:support@cvscan.com` | ✅ Mandatory | Pending domain live |
| 3.4 | **Terms of Service** → `https://cvscan.com/terms` | Highly recommended | Implemented ✅ |
| 3.5 | **App website** → `https://cvscan.com` | Recommended | Pending domain live |

> **Domain readiness blocker:** All URLs above depend on `cvscan.com` resolving in production. Confirm deployment and domain DNS before submission.

---

## ⬛ Section 4: Play Console Listing Content

| # | Check | Status | Notes |
|---|---|---|---|
| 4.1 | App name entered (`CV Scan — AI Resume Coach`) | ☐ | See `PLAY_STORE_METADATA.md` |
| 4.2 | Short description entered (≤ 80 chars) | ☐ | See `PLAY_STORE_METADATA.md` |
| 4.3 | Long description entered (≤ 4,000 chars) | ☐ | See `PLAY_STORE_METADATA.md` |
| 4.4 | Category set to **Productivity** | ☐ | |
| 4.5 | Content rating questionnaire completed | ☐ | Expected: Everyone |
| 4.6 | Data Safety form completed | ☐ | See Agent 5 Handover, Section 3.4 |
| 4.7 | At least 2 phone screenshots uploaded | ☐ | See `PLAY_STORE_METADATA.md` Section 4.3 |
| 4.8 | Feature graphic uploaded (1,024 × 500 px) | ☐ | |
| 4.9 | App icon uploaded (512 × 512 px, PNG) | ☐ | |
| 4.10 | Release notes entered for this build | ☐ | See `PLAY_STORE_METADATA.md` Section 3 |

---

## ⬛ Section 5: Compliance & Legal

| # | Check | Status | Notes |
|---|---|---|---|
| 5.1 | Privacy Policy text accurately reflects production behavior | ✅ Done | Verified by Agent 5 |
| 5.2 | Terms of Service accurately reflects production behavior | ✅ Done | Verified by Agent 5 |
| 5.3 | External account deletion URL live and functional | ✅ Done | `/delete-account` page — Agent 6 |
| 5.4 | In-app deletion path verified (Dashboard → Profile → Delete Account) | ✅ Done | Verified by Agent 5 |
| 5.5 | `auth.users` deleted on account deletion (GDPR erasure) | ✅ Done | BA-2 resolved — Agent 6 |
| 5.6 | Storage bucket files deleted on account deletion | ✅ Done | Patched by Agent 5 |
| 5.7 | Stripe billing retention disclosed in Privacy Policy | ✅ Done | Added by Agent 6 |
| 5.8 | **BA-1:** DPA agreements with AI sub-processors confirmed | ☐ **BLOCKING** | Product Owner action required before production |
| 5.9 | **BA-3:** AI sub-processor retention windows verified against current DPA | ☐ HIGH | Product Owner action |
| 5.10 | **BA-4:** `analytics_events` table TTL policy (recommend 12 months) | ☐ MEDIUM | Engineering action |
| 5.11 | **BA-6:** Stripe billing retention language in Privacy Policy | ✅ Done | Added by Agent 6 |

---

## ⬛ Section 6: Authentication & Security

| # | Check | Status | Notes |
|---|---|---|---|
| 6.1 | Email/password sign-in functional in release build | ☐ | Restored by Agent 2 |
| 6.2 | Google sign-in functional in release build | ☐ | Restored by Agent 2 |
| 6.3 | Password reset flow functional | ☐ | Restored by Agent 2 |
| 6.4 | Protected routes reject unauthenticated requests | ☐ | Verified by Agent 4 |
| 6.5 | `SUPABASE_SERVICE_ROLE_KEY` is server-only (not in client bundles) | ☐ | Confirmed in lib/supabase/server.ts |
| 6.6 | No placeholder auth (`session = { user: 'test' }`) in any release path | ☐ | Verified by Agent 2 |
| 6.7 | RLS enabled on all tables containing user data | ☐ | Verified by Agent 4 |
| 6.8 | `resume_uploads` storage bucket is private (owner-only RLS) | ☐ | Verified by Agent 4 |

---

## ⬛ Section 7: Billing & Entitlement

| # | Check | Status | Notes |
|---|---|---|---|
| 7.1 | Credit check active on all generation API routes | ☐ | Backend-enforced — Agent 3 |
| 7.2 | `402` returned when credit balance is zero | ☐ | Verified by Agent 3 |
| 7.3 | Premium unlock cannot be achieved from client state alone | ☐ | Agent 3 requirement |
| 7.4 | Stripe webhook signature verification enabled | ☐ | Agent 3 requirement |
| 7.5 | Google Play purchase verification path scaffolded | ☐ | Agent 3 — verify completion status |
| 7.6 | Android in-app purchases use Google Play Billing (not Stripe) | ☐ | Policy compliance blocker if not met |
| 7.7 | Reviewer test account seeded with 500 credits | ☐ | See `REVIEWER_ACCESS.md` |
| 7.8 | Reviewer email added to Play licence tester list | ☐ | See `REVIEWER_ACCESS.md` Section 4 |

---

## ⬛ Section 8: Reviewer Access

| # | Check | Status | Notes |
|---|---|---|---|
| 8.1 | Reviewer account created in Supabase (`reviewer@cvscan-test.com`) | ☐ | See `REVIEWER_ACCESS.md` |
| 8.2 | 500 credits seeded to reviewer account | ☐ | |
| 8.3 | Reviewer sign-in verified manually before submission | ☐ | |
| 8.4 | Reviewer instructions entered in Play Console → App Access | ☐ | Copy from `REVIEWER_ACCESS.md` Section 3 |
| 8.5 | Reviewer credentials stored in secure password manager | ☐ | NOT in repo |

---

## ⬛ Section 9: Closed Beta Setup

| # | Check | Status | Notes |
|---|---|---|---|
| 9.1 | Closed testing track created in Play Console | ☐ | |
| 9.2 | Tester email list populated (minimum 12 + 3 reserves) | ☐ | See `BETA_TRACK.md` |
| 9.3 | Testers notified with opt-in invite link | ☐ | |
| 9.4 | Minimum 12 testers have confirmed opt-in | ☐ | **Required before 14-day clock is meaningful** |
| 9.5 | 14-day clock start date recorded | ☐ | See `BETA_TRACK.md` Section 6 |
| 9.6 | Beta feedback channel established (email: `beta@cvscan.com`) | ☐ | |

---

## ⬛ Section 10: Go / No-Go Decision

### Critical Blockers (MUST resolve before ANY submission)

| Blocker | Resolution | Resolved? |
|---|---|---|
| Missing external deletion URL | `/delete-account` page created | ✅ Agent 6 |
| `auth.users` not deleted on account deletion | `auth.admin.deleteUser()` added | ✅ Agent 6 |
| Missing Privacy Policy URL | `/privacy` exists and is updated | ✅ Agent 5 |
| Reviewer cannot access premium features | Test account + 500 credits strategy defined | ☐ Ops action |
| Android purchase not Play-compliant | Play Billing path scaffolded by Agent 3 | ☐ Verify |
| DPA agreements with AI sub-processors (BA-1) | Product Owner must confirm | ☐ BLOCKING |

### Verdict Checkboxes

- [ ] All **Section 1–2** (Build) checks pass
- [ ] All **Section 3** (URLs) are live and accessible
- [ ] All **Section 5** compliance checks pass (BA-1 either resolved or formally risk-accepted)
- [ ] **Section 6** auth security verified by Agent 7
- [ ] **Section 7** billing verified by Agent 7
- [ ] **Section 8** reviewer access confirmed manually
- [ ] **Section 9** beta track confirmed with ≥ 12 opted-in testers

**✅ READY FOR SUBMISSION** when all boxes in this section are checked.

---

## Appendix: Key File References

| File | Purpose |
|---|---|
| `docs/PLAY_STORE_METADATA.md` | Store listing copy, release notes, asset specs |
| `docs/REVIEWER_ACCESS.md` | Reviewer account setup and Play Console instructions |
| `docs/BETA_TRACK.md` | Tester list, onboarding, 14-day tracking |
| `docs/AGENT_HANDOVER.md` | Full agent history, blocking assumptions, compliance matrix |
| `app/app/delete-account/page.tsx` | Public deletion page (BA-5) |
| `app/app/api/profile/delete-account/route.ts` | Deletion API (BA-2 patched) |
| `app/app/privacy/page.tsx` | Privacy Policy (updated by Agents 5 & 6) |
| `app/app/terms/page.tsx` | Terms of Service (updated by Agent 5) |
