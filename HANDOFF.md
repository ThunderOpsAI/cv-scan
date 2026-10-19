# AI CV Scan — Google Play Release & Verification Handoff

**Last Updated:** 19 October 2026 (Australia/Melbourne)  
**Product Name:** `AI CV Scan`  
**Package Name:** `com.cvscan.app`  
**Web Domain:** `https://www.aicvscan.com` *(Cloudflare + Vercel)*  
**Release Gate Status:** **Code & CI Secrets Ready — Pending Play Console & External Setup.** Local code/build verification, live HTTPS domain (`https://www.aicvscan.com`), and GitHub Actions signing secrets are configured. Play Console enrollment, App Signing fingerprint replacement, billing products, legal confirmations, and reviewer access remain on the follow-up list below.

---

## 1. Completed Release Gate Summary

The repository-controlled release checks and cloud infrastructure are in place:
- **Live Production Domain (`https://www.aicvscan.com`):** Deployed on Vercel behind Cloudflare; `/`, `/privacy`, `/terms`, `/delete-account`, and `/.well-known/assetlinks.json` all return HTTP 200 over HTTPS (`aicvscan.com` redirects via 307 to `https://www.aicvscan.com/`).
- **Capacitor & Android Configuration:** Configured for **AI CV Scan** (`com.cvscan.app`) pointing to `https://www.aicvscan.com` with Android App Links (`autoVerify="true"`) for `www.aicvscan.com` and `aicvscan.com`, plus a non-empty offline fallback page (`www/index.html`).
- **Java 21 (OpenJDK 21) & Android SDK:** Installed and active (Platform 36, Build-Tools 36.0.0, Platform-Tools 37.0.1).
- **Upload Keystore (`cvscan-upload`):** Generated, tested, and securely isolated in the gitignored `Important Info DO NOT COMMIT for my eyes only/` directory.
- **GitHub Actions Signing Secrets:** `KEYSTORE_BASE64`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, and `KEY_PASSWORD` are set on `ThunderOpsAI/cv-scan`.
- **Quality & Release Verification:**
  - `npm run quality` runs ESLint, TypeScript (`tsc --noEmit`), and Next.js production build.
  - `cd app && npm run e2e` runs all 8 Playwright tests.
  - `.github/workflows/android-release.yml` validates web quality, checks `scripts/verify-play-release.mjs` (blocking release until the Play App Signing SHA-256 placeholder in `assetlinks.json` is replaced), requires signing secrets, builds the release AAB, and verifies its signature with `jarsigner`.
- **Play Store Screenshots:** 3 phone screenshots (1080×1920) generated in `docs/assets/play-store-screenshots/` (`01-home.png`, `02-pricing.png`, `03-sign-in.png`).

---

## 2. Follow-Up List (Remaining Owner Actions)

These external items must be completed in Google Play Console, Google Cloud, Supabase, and Vercel to publish:

- [ ] **1. Create/Verify Google Play Developer Account & App (`com.cvscan.app`)**
  - Complete identity/organisation verification at <https://play.google.com/console>.
  - Create app: **AI CV Scan** (or **AI CV Scan — AI Resume Coach**), Free app with In-App Purchases, package ID `com.cvscan.app`.
- [ ] **2. Enrol in Play App Signing & Update `assetlinks.json`**
  - In Play Console → **Setup > App integrity**, activate Play App Signing.
  - Copy the Google-managed **App Signing key certificate (SHA-256 fingerprint)**.
  - Replace `REPLACE_WITH_PLAY_APP_SIGNING_SHA256_FINGERPRINT` in [`app/public/.well-known/assetlinks.json`](app/public/.well-known/assetlinks.json).
  - Commit and push to `main` so Vercel deploys `https://www.aicvscan.com/.well-known/assetlinks.json` with the real fingerprint (this also unlocks the CI release gate in `scripts/verify-play-release.mjs`).
- [ ] **3. Create & Activate the 3 Play Billing Products**
  - In Play Console → **Monetize > Products > In-app products**, create and activate:
    - `starter` — Starter Pack (20 AI CV Scan Credits) — `$4.99 AUD`
    - `popular` — Launch Pack (50 AI CV Scan Credits) — `$9.99 AUD`
    - `pro` — Pro Pack (150 AI CV Scan Credits) — `$15.99 AUD`
- [ ] **4. Configure Production Google Play API Credentials & RTDN**
  - Create a Google Cloud Service Account with Play Developer API permissions (`View app information`, `View financial data and orders`, `Manage orders and subscriptions`) and link it in Play Console → **API access**.
  - Add to Vercel production environment variables:
    - `GOOGLE_PLAY_PACKAGE_NAME=com.cvscan.app`
    - `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON=<service-account-json>`
    - `GOOGLE_PLAY_WEBHOOK_TOKEN=<strong-random-token>`
  - Configure Google Cloud Pub/Sub Push Subscription for Real-Time Developer Notifications (RTDN) to:
    `https://www.aicvscan.com/api/google-play/webhook?token=<GOOGLE_PLAY_WEBHOOK_TOKEN>`
- [ ] **5. Complete Play Console Store Listing, Questionnaires & Legal/DPA Confirmations**
  - Enter Store Listing copy and upload icons/feature graphic/screenshots from [`docs/PLAY_STORE_METADATA.md`](docs/PLAY_STORE_METADATA.md).
  - Set Privacy Policy URL (`https://www.aicvscan.com/privacy`) and Account Deletion URL (`https://www.aicvscan.com/delete-account`).
  - Complete Data safety, App content, Ads declaration ("No"), Age rating / Target audience (18+), and Financial features declarations.
  - Confirm Data Processing Addendums (DPAs) with AI/cloud sub-processors (Google Gemini/OpenAI, Supabase, Resend).
- [ ] **6. Create & Verify the Google Play Reviewer Account**
  - Follow [`docs/REVIEWER_ACCESS.md`](docs/REVIEWER_ACCESS.md) to create `reviewer@cvscan-test.com` in production Supabase and seed 500 credits (`admin_grant`).
  - Verify login at `https://www.aicvscan.com/auth/signin` and paste the reviewer instructions into Play Console → **App content > App access**.
- [ ] **7. Upload Fresh CI-Built Signed AAB to Internal Testing**
  - Once `assetlinks.json` has the real SHA-256 fingerprint, trigger the **Android Release AAB Build** workflow in GitHub Actions (or build locally) to produce a fresh signed `app-release.aab`.
  - Upload `app-release.aab` to **Testing > Internal testing** and review the Play Console Pre-launch report.
- [ ] **8. Closed Testing Requirement (If Applicable)**
  - If using a new personal developer account, run a Closed Testing track with at least **12 opted-in testers for 14 continuous days** before applying for production access (not required for verified Organisation accounts).
- [ ] **9. Optional Listing Polish: Authenticated Screenshots**
  - The 3 generated phone screenshots (`docs/assets/play-store-screenshots/`) satisfy the minimum store listing requirement; capture authenticated product-result screens (ATS score, tailored bullets, cover letter) once the seeded reviewer account is ready for a stronger final listing.

---

## 3. Local Machine Environment Details

The following toolchain is installed and active on this Mac:

| Component | Path / Details | Notes |
| :--- | :--- | :--- |
| **JDK (Java 21)** | `/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home` | Persisted in `~/.zshrc` |
| **Android SDK** | `/Users/thunderopsai/Library/Android/sdk` | Persisted in `~/.zshrc` and `android/local.properties` |
| **Android CLI** | `/Users/thunderopsai/.local/bin/android` | Official Google Android CLI tool |
| **Installed Platforms** | `platforms/android-36` | Target SDK: 36 |
| **Installed Build Tools**| `build-tools/36.0.0` | Build tools 36.0.0 |
| **Installed Platform Tools** | `platform-tools` (v37.0.1) | Includes `adb` |
| **Gradle** | `8.11.1` | Native wrapper at `android/gradlew` |

---

## 4. Upload Keystore & Signing Vault

> [!IMPORTANT]
> All signing keys and credentials are stored strictly in the gitignored directory `Important Info DO NOT COMMIT for my eyes only/`. Do not check these into version control.

- **Keystore File:** `Important Info DO NOT COMMIT for my eyes only/release-upload.jks`
- **Build Copy:** `android/app/release.keystore` *(gitignored)*
- **Alias:** `cvscan-upload`
- **Certificate SHA-256 Fingerprint:**
  `7D:E0:27:BC:A5:9B:7B:79:8E:D5:2D:79:2B:8A:CE:7C:7D:69:FE:CF:ED:1F:C1:76:2F:F5:E9:47:27:3B:06:A8`
- **Credentials File:** `Important Info DO NOT COMMIT for my eyes only/KEYSTORE_CREDENTIALS.txt`
- **Base64 Key for CI:** `Important Info DO NOT COMMIT for my eyes only/keystore_base64.txt`

---

## 5. Cloud CI/CD Status (GitHub Actions)

- Workflow file: [`.github/workflows/android-release.yml`](.github/workflows/android-release.yml)
- **Status:** Configured for manual execution (`workflow_dispatch`) and git tag pushes (`v*`).
- **Configured GitHub Secrets** (verified via `gh secret list` on `ThunderOpsAI/cv-scan`):
  - `KEYSTORE_BASE64` ✅
  - `KEYSTORE_PASSWORD` ✅
  - `KEY_ALIAS` (`cvscan-upload`) ✅
  - `KEY_PASSWORD` ✅

---

## 6. Verification Playbook

To re-verify the full build and signing pipeline locally:

```bash
export JAVA_HOME="/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home"
export ANDROID_HOME="/Users/thunderopsai/Library/Android/sdk"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:/Users/thunderopsai/.local/bin:$PATH"

# 1. Web lint, typecheck, and production build
npm run quality

# 2. Sync Capacitor Android project
npx cap sync android

# 3. Build and sign release AAB
export KEYSTORE_PATH="release.keystore"
export KEY_ALIAS="cvscan-upload"
export KEYSTORE_PASSWORD=$(grep "KEYSTORE_PASSWORD:" "Important Info DO NOT COMMIT for my eyes only/KEYSTORE_CREDENTIALS.txt" | awk '{print $2}')
export KEY_PASSWORD="$KEYSTORE_PASSWORD"
cd android && ./gradlew bundleRelease --stacktrace && cd ..

# 4. Verify AAB cryptographic signature
/opt/homebrew/opt/openjdk@21/bin/jarsigner -verify android/app/build/outputs/bundle/release/app-release.aab
```

---

## 7. Key Project References

- [`docs/OWNER_ACTIONS_REQUIRED.md`](docs/OWNER_ACTIONS_REQUIRED.md) — Account, billing, signing, and legal owner actions.
- [`docs/PLAY_CONSOLE_SETUP.md`](docs/PLAY_CONSOLE_SETUP.md) — Console products, RTDN, and policy questionnaires.
- [`docs/PLAY_STORE_RELEASE_RUNBOOK.md`](docs/PLAY_STORE_RELEASE_RUNBOOK.md) — End-to-end packaging, signing, and testing guide.
- [`docs/PRE_SUBMISSION_CHECKLIST.md`](docs/PRE_SUBMISSION_CHECKLIST.md) — Pre-flight audit checklist.
- [`docs/PLAY_STORE_METADATA.md`](docs/PLAY_STORE_METADATA.md) — Listing descriptions, store copy, and screenshot guidelines.
- [`docs/REVIEWER_ACCESS.md`](docs/REVIEWER_ACCESS.md) — Reviewer account SQL and Play Console instructions.
- [`app/public/.well-known/assetlinks.json`](app/public/.well-known/assetlinks.json) — Digital Asset Links file (update with Play App Signing SHA-256 fingerprint).
