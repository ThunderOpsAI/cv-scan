# Template 8: Landing Page Template

## Hero Section (app/(marketing)/page.tsx)
```typescript
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="px-4 py-20 md:py-32">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-8">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              Build Something Amazing
              <span className="text-primary block">In Half The Time</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The fastest way to launch your SaaS. All the features you need, none you don't.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/register">
                <Button size="lg">
                  Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-20 bg-muted/50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Everything you need</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="bg-background p-6 rounded-lg border">
                <feature.icon className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="px-4 py-20">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">Trusted by thousands</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div key={t.name} className="border rounded-lg p-6">
                <p className="mb-4">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary" />
                  <div>
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-sm text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-4xl text-center space-y-6">
          <h2 className="text-4xl font-bold">Ready to get started?</h2>
          <p className="text-xl opacity-90">Join thousands of satisfied users today</p>
          <Link href="/register">
            <Button size="lg" variant="secondary">
              Start Free Trial
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

const features = [
  {
    icon: Check,
    title: 'Easy Setup',
    description: 'Get started in minutes with our simple onboarding',
  },
  // Add more features
]

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Founder, TechCo',
    quote: 'This platform saved us months of development time',
  },
  // Add more testimonials
]
```

## Pricing Page (app/(marketing)/pricing/page.tsx)
```typescript
import { PricingCard } from '@/components/marketing/pricing-card'
import { pricingPlans } from '@/config/pricing'
import { CheckoutButton } from '@/components/payments/checkout-button'

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-20 max-w-6xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Simple, transparent pricing</h1>
        <p className="text-xl text-muted-foreground">Choose the plan that's right for you</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {pricingPlans.map((plan) => (
          <PricingCard
            key={plan.id}
            name={plan.name}
            price={plan.price}
            description={plan.description}
            features={plan.features}
            popular={plan.popular}
            cta={plan.price === 0 ? 'Get Started' : 'Subscribe'}
            onSelect={() => {}}
          />
        ))}
      </div>
    </div>
  )
}
```

## Navigation (components/marketing/navbar.tsx)
```typescript
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { UserMenu } from '@/components/auth/user-menu'
import { getServerSession } from 'next-auth'

export async function Navbar() {
  const session = await getServerSession()

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          YourApp
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/features" className="text-sm hover:text-primary">
            Features
          </Link>
          <Link href="/pricing" className="text-sm hover:text-primary">
            Pricing
          </Link>
          <Link href="/about" className="text-sm hover:text-primary">
            About
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {session ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <UserMenu />
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button>Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
```

## Footer (components/marketing/footer.tsx)
```typescript
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold mb-4">YourApp</h3>
            <p className="text-sm text-muted-foreground">
              Building the future of SaaS
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/features">Features</Link></li>
              <li><Link href="/pricing">Pricing</Link></li>
              <li><Link href="/changelog">Changelog</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about">About</Link></li>
              <li><Link href="/blog">Blog</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy">Privacy</Link></li>
              <li><Link href="/terms">Terms</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          © 2026 YourApp. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
```
