# BulletPro Deployment Guide

## Prerequisites

1. ✅ Vercel account created
2. ✅ Resend account created
3. ✅ GitHub repository
4. ✅ Supabase database running
5. ✅ Stripe account (test mode)
6. ✅ Google OAuth credentials

---

## Step 1: Push to GitHub

```bash
git add .
git commit -m "feat: prepare for deployment"
git push origin main
```

---

## Step 2: Deploy to Vercel

### 2.1 Import Project
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Select the `bullet-pro` project

### 2.2 Configure Environment Variables

Add these in Vercel dashboard (Settings → Environment Variables):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://pjtlkykuaxkkvtlzbujn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_Uk3cIMxLHGFIzlLxC3RKKA_RXLMtC1j
SUPABASE_SERVICE_ROLE_KEY=sb_secret_1bjubUasv5OwM_eopCFloA_cNgp-diX

# NextAuth
NEXTAUTH_URL=https://your-app.vercel.app  # Update after first deploy
NEXTAUTH_SECRET=42gjdZSSTMe6rGjxwEWDSQTD9tn/8VTYQvNIMwkZYIg=

# Google OAuth
GOOGLE_CLIENT_ID=471401473493-4ss6qcv8c1kpva8t777scq4fpee3vicv.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# Gemini AI
GEMINI_API_KEY=AIzaSyA3SIaq8jY-wxdHqeDI9LZ42gssBBaoNSk

# Stripe (TEST MODE for now)
STRIPE_SECRET_KEY=sk_test_51SrMaaJjGw4wgch53Nbqyo4tJlQVukw4jHESmEuBJmpRJ66YzsXJ2v8scMEvzpBnk0RbD1CsNmRaGbIRg5ssJvRG0083jw9Bsu
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51SrMaaJjGw4wgch5zNHqbdjRZxHsYzuoLEnoUGrleoyakwoLCOCWcOuK0FXbduHp2QXHCbhlfEIJjKDSSlHfPrcl00i6CBblBt
STRIPE_WEBHOOK_SECRET=  # Will add after Step 3

# Resend
RESEND_API_KEY=  # Add your Resend API key
```

### 2.3 Deploy
1. Click "Deploy"
2. Wait for build to complete (~2-3 minutes)
3. Note your deployment URL (e.g., `bulletpro.vercel.app`)

---

## Step 3: Configure Stripe Webhook (IMPORTANT!)

### 3.1 Create Webhook Endpoint
1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter URL: `https://your-app.vercel.app/api/stripe/webhook`
4. Select events to listen to:
   - `checkout.session.completed`
   - `payment_intent.payment_failed`
5. Click "Add endpoint"

### 3.2 Get Webhook Secret
1. Copy the "Signing secret" (starts with `whsec_`)
2. Add to Vercel environment variables:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   ```
3. Redeploy in Vercel

---

## Step 4: Update Google OAuth Redirect URIs

1. Go to https://console.cloud.google.com/apis/credentials
2. Edit your OAuth 2.0 Client
3. Add authorized redirect URIs:
   ```
   https://your-app.vercel.app/api/auth/callback/google
   ```
4. Save

---

## Step 5: Update NEXTAUTH_URL

1. In Vercel environment variables
2. Update `NEXTAUTH_URL` to your production URL:
   ```
   NEXTAUTH_URL=https://your-app.vercel.app
   ```
3. Redeploy

---

## Step 6: Test Production

### Test Checklist:
- [ ] Sign in with Google works
- [ ] New user gets 3 free credits
- [ ] Welcome email sent (check spam)
- [ ] Dashboard loads with correct credits
- [ ] Generate bullet points works
- [ ] Generate cover letter works
- [ ] Buy credits page loads
- [ ] Stripe checkout works (use test card: 4242 4242 4242 4242)
- [ ] Credits added after successful payment
- [ ] Receipt email sent

---

## Step 7: Going Live with Stripe (When Ready)

### 7.1 Activate Stripe Account
1. Complete business verification in Stripe dashboard
2. Add bank account for payouts

### 7.2 Switch to Live Keys
1. Get live keys from https://dashboard.stripe.com/apikeys
2. Update Vercel environment variables:
   ```
   STRIPE_SECRET_KEY=sk_live_xxxxx
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
   ```

### 7.3 Create Live Webhook
1. Go to https://dashboard.stripe.com/webhooks (Live mode)
2. Add same endpoint: `https://your-app.vercel.app/api/stripe/webhook`
3. Select same events
4. Update `STRIPE_WEBHOOK_SECRET` with live secret

### 7.4 Final Deploy
1. Redeploy in Vercel
2. Test with REAL card (small amount)
3. Verify money appears in Stripe dashboard

---

## Troubleshooting

### Build Fails
- Check Vercel build logs
- Ensure `npm install --legacy-peer-deps` is used
- Verify all environment variables are set

### Auth Not Working
- Check `NEXTAUTH_URL` matches your domain
- Verify Google OAuth redirect URI is correct
- Check Supabase connection

### Stripe Webhook Fails
- Verify webhook secret is correct
- Check webhook events are selected
- Test webhook in Stripe dashboard

### Emails Not Sending
- Verify Resend API key
- Check sender domain is verified
- Emails might be in spam folder

---

## Post-Deployment

### Enable Vercel Analytics (Free)
1. Go to your project in Vercel
2. Click "Analytics" tab
3. Enable Analytics
4. No code changes needed!

### Monitor Performance
- Check Vercel Analytics dashboard
- Monitor Stripe dashboard for payments
- Check Supabase logs for database issues

---

## Cost Breakdown (Monthly)

| Service | Cost | Notes |
|---------|------|-------|
| Vercel | $0 (Hobby) | Free for personal projects |
| Supabase | $0-25 | Free tier → Pro when needed |
| Stripe | 2.9% + $0.30 per transaction | No monthly fee |
| Resend | $0 (up to 3,000 emails) | Free tier generous |
| Google OAuth | $0 | Always free |
| Gemini API | $0 (free tier) | Very generous limits |

**Total Fixed Cost:** $0-25/month
**Variable Cost:** Only Stripe fees on revenue

---

## Success!

Your app is now live! 🎉

Share your deployment URL and start getting users!
