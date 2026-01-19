# Template 6: Payment Integration Template (Stripe)

## Stripe Setup & Configuration

### Environment Variables
```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Pricing Plans (config/pricing.ts)
```typescript
export const pricingPlans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    stripePriceId: null,
    features: ['5 projects', 'Basic analytics', 'Community support'],
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 19,
    stripePriceId: 'price_starter_monthly',
    features: ['25 projects', 'Advanced analytics', 'Email support', 'API access'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 49,
    stripePriceId: 'price_pro_monthly',
    features: ['Unlimited projects', 'Premium analytics', 'Priority support', 'Custom integrations'],
    popular: true,
  },
]
```

### Checkout Button Component
```typescript
'use client'

import { Button } from '@/components/ui/button'
import { useState } from 'react'

export function CheckoutButton({ priceId, plan }: { priceId: string; plan: string }) {
  const [loading, setLoading] = useState(false)

  async function handleCheckout() {
    setLoading(true)
    const res = await fetch('/api/subscriptions/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId }),
    })
    const { url } = await res.json()
    window.location.href = url
  }

  return (
    <Button onClick={handleCheckout} loading={loading}>
      Subscribe to {plan}
    </Button>
  )
}
```

### Customer Portal Button
```typescript
'use client'

import { Button } from '@/components/ui/button'

export function ManageSubscriptionButton() {
  async function handlePortal() {
    const res = await fetch('/api/subscriptions/portal', { method: 'POST' })
    const { url } = await res.json()
    window.location.href = url
  }

  return (
    <Button variant="outline" onClick={handlePortal}>
      Manage Subscription
    </Button>
  )
}
```

### Webhook Handler (Already in Template 3)
See `/api/payments/webhooks/stripe/route.ts` in Template 3

### Subscription Status Component
```typescript
import { formatDate } from 'date-fns'

export function SubscriptionStatus({ subscription }) {
  const statusColors = {
    ACTIVE: 'bg-green-100 text-green-800',
    TRIALING: 'bg-blue-100 text-blue-800',
    CANCELED: 'bg-red-100 text-red-800',
    PAST_DUE: 'bg-yellow-100 text-yellow-800',
  }

  return (
    <div className="border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Current Plan</h3>
        <span className={`px-3 py-1 rounded-full text-sm ${statusColors[subscription.status]}`}>
          {subscription.status}
        </span>
      </div>
      <p className="text-2xl font-bold mb-2">{subscription.plan}</p>
      {subscription.currentPeriodEnd && (
        <p className="text-sm text-muted-foreground">
          Renews on {formatDate(subscription.currentPeriodEnd, 'MMM dd, yyyy')}
        </p>
      )}
    </div>
  )
}
```

### Usage Limits Hook
```typescript
export function useUsageLimits() {
  const { user } = useAuth()
  const plan = user?.subscription?.plan || 'FREE'

  const limits = {
    FREE: { projects: 5, apiCalls: 100 },
    STARTER: { projects: 25, apiCalls: 1000 },
    PRO: { projects: Infinity, apiCalls: Infinity },
  }

  return limits[plan]
}
```

### Cost Estimates
- Stripe fee: 2.9% + $0.30 per transaction
- For $19/month plan: $0.85 in fees
- For $49/month plan: $1.72 in fees
- Webhook processing: Free with Stripe
