# Play Console Setup Guide

Step-by-step technical instructions for setting up Google Play Console for **CVScan** (`com.cvscan.app`).

---

## 1. App Details & Store Listing

- **App Name:** CVScan - AI Resume & ATS Coach
- **Short Description (max 80 chars):** Score, optimize, and tailor your resume for ATS systems to land top interviews.
- **Full Description:** See [PLAY_STORE_METADATA.md](file:///Users/thunderopsai/Documents/Workspace/01_Projects/cv-scan/docs/PLAY_STORE_METADATA.md).
- **Category:** Productivity / Business
- **Tags:** Resume builder, Job search, ATS scanner, Career coach, Cover letter generator

### Graphics Assets Generated & Available
- **App Icon (512x512, no alpha):** Located at `docs/assets/play_store_icon_512.png` and `app/public/play-icon-512.png`.
- **Feature Graphic (1024x500, no alpha):** Located at `docs/assets/play_store_feature_graphic_1024x500.png`.
- **Phone Screenshots:** Capture from Android device/emulator once deployed on test devices.

---

## 2. In-App Products Setup (Google Play Billing)

Navigate to **Monetize > Products > In-app products** in the Play Console:

1. **Starter Pack**
   - Product ID: `starter`
   - Name: Starter Pack (20 Credits)
   - Description: 20 CVScan credits for ATS resume scans, tailoring, and cover letters.
   - Price: $4.99 AUD (adjust for international tiers)
   - Status: Active

2. **Launch Pack (Popular)**
   - Product ID: `popular`
   - Name: Launch Pack (50 Credits)
   - Description: 50 CVScan credits for active job seekers.
   - Price: $9.99 AUD
   - Status: Active

3. **Pro Pack**
   - Product ID: `pro`
   - Name: Pro Pack (150 Credits)
   - Description: 150 CVScan credits with maximum value per scan.
   - Price: $15.99 AUD
   - Status: Active

---

## 3. Real-Time Developer Notifications (RTDN)

1. Enable Google Cloud Pub/Sub API in your GCP project.
2. Create a Topic: `projects/<your-gcp-project>/topics/play-billing-notifications`.
3. In Google Play Console -> **Monetize > Monetization setup**, enter the Topic name.
4. Create a Pub/Sub Push Subscription pointing to:
   `https://cvscan.com.au/api/google-play/webhook?token=<YOUR_GOOGLE_PLAY_WEBHOOK_TOKEN>`

---

## 4. App Content & Policy Questionnaires

- **Target Audience:** 18 and older.
- **Ads:** "No, my app does not contain ads".
- **Financial Features:** "Digital goods / In-app purchases via Google Play Billing only".
- **Privacy Policy URL:** `https://cvscan.com.au/privacy`
- **Account Deletion URL:** `https://cvscan.com.au/delete-account`
- **Data Safety:** Follow declarations detailed in [OWNER_ACTIONS_REQUIRED.md](file:///Users/thunderopsai/Documents/Workspace/01_Projects/cv-scan/docs/OWNER_ACTIONS_REQUIRED.md).
