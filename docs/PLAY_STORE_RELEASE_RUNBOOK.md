# Google Play Store Release Runbook

This runbook covers the end-to-end procedure for packaging, signing, verifying, and publishing **CVScan** (`com.cvscan.app`) to Google Play Closed Testing.

---

## 1. Architecture Overview

- **Native Wrapper:** Capacitor 7 (`android/` project)
- **Application ID:** `com.cvscan.app`
- **Target SDK:** Android 36 (`compileSdkVersion 36`, `targetSdkVersion 36`, `minSdkVersion 24`)
- **Billing Architecture:**
  - In Android client: `@capgo/native-purchases` directly invokes Google Play BillingClient (`com.android.billingclient.api`).
  - Purchases trigger server-side verification at `POST /api/google-play/verify`.
  - Authoritative grant: Supabase `addCredits` with idempotent reference `googleplay:<orderId|token>`.
  - Consumable credit packs are consumed via Google Play Developer API v3 upon verification.
  - Web checkout (Stripe) is completely suppressed on Android devices to comply with Google Play Payments Policy.

---

## 2. Release Keystore Generation (One-Time Setup)

To prepare for Play App Signing:

```bash
# Generate release upload keystore
keytool -genkey -v -keystore release-upload.jks -keyalg RSA -keysize 2048 -validity 10000 -alias cvscan-upload
```

Keep this keystore safe and **never commit it to git**.

### Encode Keystore for GitHub Actions (Automated Release Builds):

```bash
base64 -i release-upload.jks | pbcopy
```
Paste this into your GitHub Repository Secrets as `KEYSTORE_BASE64`.

Set the companion secrets:
- `KEYSTORE_PASSWORD`: `<your-keystore-password>`
- `KEY_ALIAS`: `cvscan-upload`
- `KEY_PASSWORD`: `<your-key-password>`

---

## 3. Building Release Artifacts

### Option A: Via GitHub Actions CI (Recommended)
1. Go to GitHub Actions -> **Android Release AAB Build**.
2. Select **Run workflow** -> choose `aab` (or tag a release commit `git tag v1.0.0 && git push origin v1.0.0`).
3. Download the built `app-release-aab` artifact (`app-release.aab`).

### Option B: Local Machine Build
Requires:
- Java JDK 17+ (`export JAVA_HOME=...`)
- Android SDK with API 36 platform and build-tools installed (`export ANDROID_HOME=...`)

Commands:
```bash
# From repository root:
npx cap sync android

cd android
./gradlew bundleRelease
```
The output AAB will be generated at:
`android/app/build/outputs/bundle/release/app-release.aab`

---

## 4. Google Play Console Setup

### 4.1 In-App Products Configuration
In Play Console under **Monetize > In-app products**, create the 3 one-time credit products:

| Product ID | Type | Default Title | Description | Pricing Suggestion |
|---|---|---|---|---|
| `starter` | One-time / Consumable | Starter Pack | 20 CVScan Credits | $4.99 AUD / USD |
| `popular` | One-time / Consumable | Launch Pack | 50 CVScan Credits | $9.99 AUD / USD |
| `pro` | One-time / Consumable | Pro Pack | 150 CVScan Credits | $15.99 AUD / USD |

*Note: Ensure status is set to Active.*

### 4.2 Google Cloud Service Account & RTDN
1. Go to Google Cloud Console -> IAM & Admin -> Service Accounts.
2. Create service account `play-billing-service@<project>.iam.gserviceaccount.com`.
3. In Google Play Console -> **API access**, link the Google Cloud project and grant the service account permissions:
   - View app information and download bulk reports (read-only)
   - View financial data, orders, and cancellation survey responses
   - Manage orders and subscriptions
4. Generate a JSON key for this service account.
5. In production environment (e.g. Vercel), set:
   - `GOOGLE_PLAY_PACKAGE_NAME`: `com.cvscan.app`
   - `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`: `<escaped-or-base64-json-key>`
   - `GOOGLE_PLAY_WEBHOOK_TOKEN`: `<random-secure-secret-token>`
6. In Google Cloud Pub/Sub, configure Real-time Developer Notifications (RTDN) pointing to:
   `https://cvscan.com.au/api/google-play/webhook?token=<GOOGLE_PLAY_WEBHOOK_TOKEN>`

---

## 5. Android App Links (Digital Asset Links)

1. Under Play Console -> **Setup > App integrity**, find the **Play App Signing** section.
2. Copy the **SHA-256 certificate fingerprint** of the App Signing key.
3. Update `app/public/.well-known/assetlinks.json`:
   ```json
   [
     {
       "relation": ["delegate_permission/common.handle_all_urls"],
       "target": {
         "namespace": "android_app",
         "package_name": "com.cvscan.app",
         "sha256_cert_fingerprints": [
           "<PASTE_SHA256_FINGERPRINT_FROM_PLAY_CONSOLE_HERE>"
         ]
       }
     }
   ]
   ```
4. Deploy to Vercel and verify `https://cvscan.com.au/.well-known/assetlinks.json` returns HTTP 200 with the exact fingerprint.

---

## 6. Closed Testing Track Workflow

1. In Play Console, go to **Testing > Closed testing**.
2. Create track: **Alpha / Closed Testing**.
3. Upload `app-release.aab`.
4. Add Closed Testing testers (email list or Google Group).
5. For new personal Play Developer accounts:
   - Must have **12 opted-in testers for 14 continuous days** before production rollout can be applied for.
6. Provide tester feedback URL: `https://cvscan.com.au/contact` or Play Console internal testing feedback channel.
