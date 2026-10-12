# Verification & Test Evidence

This document logs all automated validations, compilation checks, builds, tests, and security audits executed for the Google Play submission readiness of **CVScan**.

---

## 1. ESLint Code Quality Check
- **Command:** `npm run lint` (inside `app/`)
- **Status:** **PASS (0 errors, 0 warnings)**
- **Baseline:** Started at 281 errors.
- **Resolution Strategy:**
  - Resolved all `any` usages across all 31 Supabase tables in `app/lib/supabase/types.ts`.
  - Strictly typed database RPC calls (`get_credit_balance`, `deduct_credits`, `add_credits`).
  - Corrected Stripe v20 options and types across all checkout and webhook endpoints.
  - Rewrote `lib/billing/google-play-client.ts` with strict Capacitor native types.
  - Resolved unused parameters, variables, and imports without disabling any ESLint rules.

---

## 2. TypeScript Compilation Check
- **Command:** `npx tsc --noEmit` (inside `app/`)
- **Status:** **PASS (0 errors)**
- **Coverage:** Full Next.js 16 App Router application, API routes, middleware, and client components.

---

## 3. Next.js Production Build
- **Command:** `npm run build` (inside `app/`)
- **Status:** **PASS (Exit code 0)**
- **Output:**
  - Compiled successfully with webpack in production mode.
  - 79 static pages generated.
  - Dynamic API routes properly bundled.
  - Verified zero missing modules or broken dynamic imports.

---

## 4. Google Play Billing & Security Tests
- **Test File:** `app/tests/play-billing.spec.ts`
- **Scenarios Covered:**
  - `POST /api/google-play/verify` rejects unauthenticated callers with HTTP 401.
  - `POST /api/google-play/verify` validates payload structure.
  - `POST /api/google-play/webhook` rejects calls missing valid webhook authentication token with HTTP 401.
  - `/.well-known/assetlinks.json` serves valid Digital Asset Links with package `com.cvscan.app`.
  - Public policy pages (`/privacy`, `/terms`, `/delete-account`) return HTTP 200.

---

## 5. Native Android Project Configuration
- **Application ID:** `com.cvscan.app`
- **Gradle Version / Wrapper:** Gradle 8.11.1
- **Android Target SDK:** API 36 (`targetSdkVersion = 36`, `compileSdkVersion = 36`)
- **Android Min SDK:** API 24 (`minSdkVersion = 24`, covering 95%+ of active devices)
- **R8 / ProGuard Optimization:** Enabled (`minifyEnabled true`, `shrinkResources true`).
- **ProGuard Rules:** Custom rules added in `android/app/proguard-rules.pro` protecting Capacitor bridge and Google Play BillingClient (`com.android.billingclient.api.**`).
- **Network Security Config:** `android/app/src/main/res/xml/network_security_config.xml` wired with strict cleartext disabled in production.
- **Billing Permissions:** `com.android.vending.BILLING` declared in `AndroidManifest.xml`.
- **App Links Intent Filter:** Configured in `AndroidManifest.xml` with `autoVerify="true"` for domain `cvscan.com.au`.

---

## 6. Play Store Branding Assets
- **Play Store App Icon:**
  - Path: `docs/assets/play_store_icon_512.png` & `app/public/play-icon-512.png`
  - Dimensions: 512x512 pixels
  - Color profile: RGB 24-bit, NO alpha channel (strictly complies with Play Console submission rules)
- **Play Store Feature Graphic:**
  - Path: `docs/assets/play_store_feature_graphic_1024x500.png`
  - Dimensions: 1024x500 pixels, no alpha channel
- **Android Adaptive & Round Launcher Icons:**
  - Generated across `mipmap-mdpi`, `mipmap-hdpi`, `mipmap-xhdpi`, `mipmap-xxhdpi`, `mipmap-xxxhdpi`.

---

## 7. CI/CD Automated Workflows
- **Web Verification:** `.github/workflows/web-ci.yml` (runs lint, tsc, and build on PR/push).
- **Android Release AAB:** `.github/workflows/android-release.yml` (automates Java 17, Android SDK 36, and Gradle bundleRelease signing into `app-release.aab`).
