# Template 3: API Routes Template

## Purpose
Standardized API route patterns with authentication, validation, error handling, and rate limiting for Next.js applications.

---

## API Route Structure

```
src/app/api/
├── auth/
│   ├── [...nextauth]/route.ts    # NextAuth handler
│   ├── register/route.ts         # User registration
│   └── verify-email/route.ts     # Email verification
├── users/
│   ├── route.ts                  # GET /api/users (list), POST (create)
│   ├── [id]/route.ts             # GET, PATCH, DELETE specific user
│   └── me/route.ts               # GET current user
├── subscriptions/
│   ├── route.ts                  # Subscription management
│   ├── checkout/route.ts         # Create checkout session
│   └── portal/route.ts           # Customer portal
├── payments/
│   ├── route.ts                  # Payment history
│   └── webhooks/
│       └── stripe/route.ts       # Stripe webhooks
├── posts/
│   ├── route.ts
│   ├── [id]/route.ts
│   └── [id]/publish/route.ts
└── admin/
    ├── users/route.ts
    ├── analytics/route.ts
    └── settings/route.ts
```

---

## Core Utilities (lib/api/)

### Response Helpers (lib/api/response.ts)
```typescript
import { NextResponse } from 'next/server'

export class ApiResponse {
  static success<T>(data: T, status = 200) {
    return NextResponse.json(
      {
        success: true,
        data,
      },
      { status }
    )
  }

  static error(message: string, status = 400, code?: string) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message,
          code: code || 'ERROR',
        },
      },
      { status }
    )
  }

  static paginated<T>(data: T[], total: number, page: number, perPage: number) {
    return NextResponse.json({
      success: true,
      data,
      pagination: {
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
      },
    })
  }
}
```

### Authentication (lib/api/auth.ts)
```typescript
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/db/prisma'

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { subscription: true },
  })

  return user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  return user
}

export async function requireAdmin() {
  const user = await requireAuth()
  
  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
    throw new Error('Forbidden: Admin access required')
  }

  return user
}

export async function requireSubscription(plan?: string) {
  const user = await requireAuth()
  
  if (!user.subscription || user.subscription.status !== 'ACTIVE') {
    throw new Error('Active subscription required')
  }

  if (plan && user.subscription.plan !== plan) {
    throw new Error(`${plan} plan required`)
  }

  return user
}
```

### Validation (lib/api/validation.ts)
```typescript
import { z } from 'zod'

export function validateRequest<T>(schema: z.Schema<T>, data: unknown): T {
  const result = schema.safeParse(data)
  
  if (!result.success) {
    const errors = result.error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }))
    throw new ValidationError('Validation failed', errors)
  }

  return result.data
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public errors: { field: string; message: string }[]
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}
```

### Rate Limiting (lib/api/rate-limit.ts)
```typescript
import { NextRequest } from 'next/server'

interface RateLimitConfig {
  interval: number // in milliseconds
  uniqueTokenPerInterval: number
}

const rateLimitStore = new Map<string, number[]>()

export async function rateLimit(
  request: NextRequest,
  config: RateLimitConfig = {
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 10, // 10 requests per minute
  }
): Promise<boolean> {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'anonymous'
  const now = Date.now()
  const windowStart = now - config.interval

  const requests = rateLimitStore.get(ip) || []
  const recentRequests = requests.filter((time) => time > windowStart)

  if (recentRequests.length >= config.uniqueTokenPerInterval) {
    return false
  }

  recentRequests.push(now)
  rateLimitStore.set(ip, recentRequests)

  return true
}
```

### Error Handler (lib/api/error-handler.ts)
```typescript
import { ApiResponse } from './response'
import { ValidationError } from './validation'
import { Prisma } from '@prisma/client'

export function handleApiError(error: unknown) {
  console.error('API Error:', error)

  if (error instanceof ValidationError) {
    return ApiResponse.error(error.message, 400, 'VALIDATION_ERROR')
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return ApiResponse.error('Record already exists', 409, 'CONFLICT')
    }
    if (error.code === 'P2025') {
      return ApiResponse.error('Record not found', 404, 'NOT_FOUND')
    }
  }

  if (error instanceof Error) {
    if (error.message === 'Unauthorized') {
      return ApiResponse.error('Authentication required', 401, 'UNAUTHORIZED')
    }
    if (error.message.startsWith('Forbidden')) {
      return ApiResponse.error(error.message, 403, 'FORBIDDEN')
    }
    return ApiResponse.error(error.message, 400, 'ERROR')
  }

  return ApiResponse.error('Internal server error', 500, 'INTERNAL_ERROR')
}
```

---

## API Route Templates

### 1. Authentication Routes

#### Registration (api/auth/register/route.ts)
```typescript
import { NextRequest } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db/prisma'
import { ApiResponse } from '@/lib/api/response'
import { validateRequest } from '@/lib/api/validation'
import { handleApiError } from '@/lib/api/error-handler'
import { rateLimit } from '@/lib/api/rate-limit'

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
})

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const allowed = await rateLimit(request, {
      interval: 60 * 1000,
      uniqueTokenPerInterval: 5,
    })
    
    if (!allowed) {
      return ApiResponse.error('Too many requests', 429, 'RATE_LIMIT')
    }

    const body = await request.json()
    const data = validateRequest(registerSchema, body)

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      return ApiResponse.error('Email already registered', 409, 'EMAIL_EXISTS')
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10)

    // Create user with free subscription
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
        subscription: {
          create: {
            plan: 'FREE',
            status: 'ACTIVE',
          },
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    })

    // TODO: Send verification email

    return ApiResponse.success(
      {
        message: 'Account created successfully',
        user,
      },
      201
    )
  } catch (error) {
    return handleApiError(error)
  }
}
```

#### NextAuth Config (api/auth/[...nextauth]/route.ts)
```typescript
import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db/prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.password) {
          throw new Error('Invalid credentials')
        }

        const isValid = await bcrypt.compare(credentials.password, user.password)

        if (!isValid) {
          throw new Error('Invalid credentials')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

### 2. User Routes

#### User List/Create (api/users/route.ts)
```typescript
import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'
import { ApiResponse } from '@/lib/api/response'
import { requireAuth, requireAdmin } from '@/lib/api/auth'
import { handleApiError } from '@/lib/api/error-handler'
import { validateRequest } from '@/lib/api/validation'

// GET /api/users - List users (admin only)
export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const perPage = parseInt(searchParams.get('perPage') || '20')
    const search = searchParams.get('search') || ''

    const where = search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' as const } },
            { name: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * perPage,
        take: perPage,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          subscription: {
            select: {
              plan: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ])

    return ApiResponse.paginated(users, total, page, perPage)
  } catch (error) {
    return handleApiError(error)
  }
}
```

#### Get Current User (api/users/me/route.ts)
```typescript
import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/api/auth'
import { ApiResponse } from '@/lib/api/response'
import { handleApiError } from '@/lib/api/error-handler'
import { prisma } from '@/lib/db/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()

    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        bio: true,
        website: true,
        location: true,
        role: true,
        createdAt: true,
        subscription: {
          select: {
            plan: true,
            status: true,
            currentPeriodEnd: true,
          },
        },
      },
    })

    return ApiResponse.success(userData)
  } catch (error) {
    return handleApiError(error)
  }
}

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  bio: z.string().max(500).optional(),
  website: z.string().url().optional(),
  location: z.string().optional(),
})

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const data = validateRequest(updateSchema, body)

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        bio: true,
        website: true,
        location: true,
      },
    })

    return ApiResponse.success(updatedUser)
  } catch (error) {
    return handleApiError(error)
  }
}
```

### 3. Subscription Routes

#### Create Checkout Session (api/subscriptions/checkout/route.ts)
```typescript
import { NextRequest } from 'next/server'
import { z } from 'zod'
import Stripe from 'stripe'
import { requireAuth } from '@/lib/api/auth'
import { ApiResponse } from '@/lib/api/response'
import { validateRequest } from '@/lib/api/validation'
import { handleApiError } from '@/lib/api/error-handler'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

const checkoutSchema = z.object({
  priceId: z.string(),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const { priceId, successUrl, cancelUrl } = validateRequest(checkoutSchema, body)

    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      metadata: {
        userId: user.id,
      },
    })

    return ApiResponse.success({ url: session.url })
  } catch (error) {
    return handleApiError(error)
  }
}
```

#### Stripe Webhooks (api/payments/webhooks/stripe/route.ts)
```typescript
import { NextRequest } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/db/prisma'
import { ApiResponse } from '@/lib/api/response'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return ApiResponse.error('Invalid signature', 400)
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutComplete(session)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdate(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDelete(subscription)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentSucceeded(invoice)
        break
      }
    }

    return ApiResponse.success({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return ApiResponse.error('Webhook handler failed', 500)
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId
  if (!userId) return

  const subscription = await stripe.subscriptions.retrieve(
    session.subscription as string
  )

  await prisma.subscription.upsert({
    where: { userId },
    update: {
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: subscription.id,
      stripePriceId: subscription.items.data[0].price.id,
      status: 'ACTIVE',
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
    create: {
      userId,
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: subscription.id,
      stripePriceId: subscription.items.data[0].price.id,
      plan: 'PRO', // Determine based on priceId
      status: 'ACTIVE',
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  })
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: subscription.status === 'active' ? 'ACTIVE' : 'INACTIVE',
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  })
}

async function handleSubscriptionDelete(subscription: Stripe.Subscription) {
  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: 'CANCELED',
      canceledAt: new Date(),
    },
  })
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscription = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: invoice.subscription as string },
  })

  if (!subscription) return

  await prisma.payment.create({
    data: {
      userId: subscription.userId,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      status: 'SUCCEEDED',
      stripePaymentId: invoice.payment_intent as string,
      stripeInvoiceId: invoice.id,
      description: invoice.lines.data[0]?.description || 'Subscription payment',
      paidAt: new Date(),
    },
  })
}
```

### 4. CRUD Template (api/posts/route.ts)
```typescript
import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'
import { ApiResponse } from '@/lib/api/response'
import { requireAuth } from '@/lib/api/auth'
import { validateRequest } from '@/lib/api/validation'
import { handleApiError } from '@/lib/api/error-handler'

const createPostSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  excerpt: z.string().optional(),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const perPage = parseInt(searchParams.get('perPage') || '10')
    const status = searchParams.get('status') || 'PUBLISHED'

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: { status: status as any },
        skip: (page - 1) * perPage,
        take: perPage,
        include: {
          category: true,
          tags: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.post.count({ where: { status: status as any } }),
    ])

    return ApiResponse.paginated(posts, total, page, perPage)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth()
    
    const body = await request.json()
    const data = validateRequest(createPostSchema, body)

    const post = await prisma.post.create({
      data: {
        ...data,
        slug: data.title.toLowerCase().replace(/\s+/g, '-'),
        tags: data.tags
          ? {
              connectOrCreate: data.tags.map((tag) => ({
                where: { name: tag },
                create: { name: tag, slug: tag.toLowerCase().replace(/\s+/g, '-') },
              })),
            }
          : undefined,
      },
      include: {
        category: true,
        tags: true,
      },
    })

    return ApiResponse.success(post, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
```

---

## Testing API Routes

```typescript
// __tests__/api/users.test.ts
import { POST } from '@/app/api/users/route'
import { NextRequest } from 'next/server'

describe('POST /api/users', () => {
  it('creates a new user', async () => {
    const request = new NextRequest('http://localhost:3000/api/users', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.success).toBe(true)
  })
})
```

---

## API Documentation Template

Use tools like Swagger or create a simple docs page:

```markdown
# API Documentation

## Authentication
All authenticated endpoints require a valid session.

## Endpoints

### POST /api/auth/register
Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Account created successfully",
    "user": {
      "id": "...",
      "email": "user@example.com",
      "name": "John Doe"
    }
  }
}
```
```

---

## Performance Considerations

- Use database indexes for frequently queried fields
- Implement caching for read-heavy endpoints
- Use connection pooling
- Implement proper pagination
- Add request timeouts
- Use background jobs for heavy operations
