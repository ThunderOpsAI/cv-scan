# Template 2: Database Models Template

## Purpose
Comprehensive database schema with common patterns for SaaS applications, including users, subscriptions, payments, and content management.

---

## Prisma Schema (schema.prisma)

```prisma
// This is your Prisma schema file

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// USERS & AUTHENTICATION
// ============================================

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  password      String?   // Hashed, null if OAuth
  role          UserRole  @default(USER)
  
  // Profile info
  bio           String?   @db.Text
  website       String?
  location      String?
  
  // Account status
  isActive      Boolean   @default(true)
  isBanned      Boolean   @default(false)
  bannedReason  String?
  
  // Timestamps
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  lastLoginAt   DateTime?
  
  // Relations
  accounts      Account[]
  sessions      Session[]
  subscription  Subscription?
  payments      Payment[]
  apiKeys       ApiKey[]
  usageMetrics  UsageMetric[]
  notifications Notification[]
  auditLogs     AuditLog[]
  
  @@index([email])
  @@index([createdAt])
}

enum UserRole {
  USER
  ADMIN
  SUPER_ADMIN
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@index([userId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// ============================================
// SUBSCRIPTIONS & BILLING
// ============================================

model Subscription {
  id                   String             @id @default(cuid())
  userId               String             @unique
  
  // Stripe info
  stripeCustomerId     String?            @unique
  stripeSubscriptionId String?            @unique
  stripePriceId        String?
  
  // Subscription details
  plan                 SubscriptionPlan   @default(FREE)
  status               SubscriptionStatus @default(INACTIVE)
  
  // Billing cycle
  currentPeriodStart   DateTime?
  currentPeriodEnd     DateTime?
  cancelAtPeriodEnd    Boolean            @default(false)
  canceledAt           DateTime?
  
  // Trial
  trialStart           DateTime?
  trialEnd             DateTime?
  
  // Timestamps
  createdAt            DateTime           @default(now())
  updatedAt            DateTime           @updatedAt
  
  // Relations
  user                 User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([stripeCustomerId])
  @@index([stripeSubscriptionId])
}

enum SubscriptionPlan {
  FREE
  STARTER
  PRO
  ENTERPRISE
}

enum SubscriptionStatus {
  ACTIVE
  INACTIVE
  TRIALING
  PAST_DUE
  CANCELED
  UNPAID
}

model Payment {
  id              String        @id @default(cuid())
  userId          String
  
  // Payment details
  amount          Int           // in cents
  currency        String        @default("usd")
  status          PaymentStatus @default(PENDING)
  
  // Stripe info
  stripePaymentId String?       @unique
  stripeInvoiceId String?
  
  // Metadata
  description     String?
  metadata        Json?
  
  // Timestamps
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  paidAt          DateTime?
  
  // Relations
  user            User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([status])
  @@index([createdAt])
}

enum PaymentStatus {
  PENDING
  SUCCEEDED
  FAILED
  REFUNDED
  CANCELED
}

// ============================================
// API & USAGE TRACKING
// ============================================

model ApiKey {
  id          String   @id @default(cuid())
  userId      String
  
  key         String   @unique // Hashed
  name        String
  lastUsedAt  DateTime?
  
  isActive    Boolean  @default(true)
  expiresAt   DateTime?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([key])
}

model UsageMetric {
  id          String   @id @default(cuid())
  userId      String
  
  // Metric type (e.g., "api_calls", "storage_used", "compute_time")
  metricType  String
  value       Int
  unit        String   // e.g., "count", "bytes", "seconds"
  
  // Metadata
  metadata    Json?
  
  // Time period
  periodStart DateTime
  periodEnd   DateTime
  
  createdAt   DateTime @default(now())
  
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId, metricType])
  @@index([periodStart, periodEnd])
}

// ============================================
// NOTIFICATIONS & COMMUNICATIONS
// ============================================

model Notification {
  id        String             @id @default(cuid())
  userId    String
  
  type      NotificationType
  title     String
  message   String             @db.Text
  
  isRead    Boolean            @default(false)
  readAt    DateTime?
  
  // Optional link/action
  actionUrl String?
  
  createdAt DateTime           @default(now())
  
  user      User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId, isRead])
  @@index([createdAt])
}

enum NotificationType {
  INFO
  SUCCESS
  WARNING
  ERROR
  PAYMENT
  SUBSCRIPTION
  SYSTEM
}

// ============================================
// CONTENT MANAGEMENT (Example)
// ============================================

model Post {
  id          String      @id @default(cuid())
  
  title       String
  slug        String      @unique
  content     String      @db.Text
  excerpt     String?     @db.Text
  
  // Publishing
  status      PostStatus  @default(DRAFT)
  publishedAt DateTime?
  
  // SEO
  metaTitle       String?
  metaDescription String?
  
  // Categorization
  tags        Tag[]
  categoryId  String?
  category    Category?   @relation(fields: [categoryId], references: [id])
  
  // Timestamps
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  
  @@index([slug])
  @@index([status])
  @@index([publishedAt])
}

enum PostStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

model Category {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String?
  
  posts       Post[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([slug])
}

model Tag {
  id        String   @id @default(cuid())
  name      String   @unique
  slug      String   @unique
  
  posts     Post[]
  
  createdAt DateTime @default(now())
  
  @@index([slug])
}

// ============================================
// ANALYTICS & TRACKING
// ============================================

model PageView {
  id         String   @id @default(cuid())
  
  // Page info
  path       String
  title      String?
  referrer   String?
  
  // User info
  userId     String?
  sessionId  String
  
  // Device info
  userAgent  String?
  ip         String?
  country    String?
  device     String?
  browser    String?
  
  createdAt  DateTime @default(now())
  
  @@index([path])
  @@index([sessionId])
  @@index([createdAt])
}

// ============================================
// ADMIN & AUDIT
// ============================================

model AuditLog {
  id          String   @id @default(cuid())
  userId      String?
  
  action      String   // e.g., "user.created", "payment.succeeded"
  entityType  String?  // e.g., "User", "Payment"
  entityId    String?
  
  // What changed
  oldValue    Json?
  newValue    Json?
  
  // Context
  ipAddress   String?
  userAgent   String?
  
  createdAt   DateTime @default(now())
  
  user        User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  
  @@index([userId])
  @@index([action])
  @@index([createdAt])
}

model Setting {
  id        String   @id @default(cuid())
  key       String   @unique
  value     Json
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([key])
}
```

---

## Migration Strategy

### Initial Migration
```bash
# Create migration
npx prisma migrate dev --name init

# Apply to production
npx prisma migrate deploy
```

### Schema Updates
```bash
# After modifying schema.prisma
npx prisma migrate dev --name descriptive_name

# Generate updated client
npx prisma generate
```

---

## Seed Data (prisma/seed.ts)

```typescript
import { PrismaClient, UserRole, SubscriptionPlan } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data (optional, for development)
  await prisma.auditLog.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.subscription.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: hashedPassword,
      role: UserRole.ADMIN,
      emailVerified: new Date(),
      subscription: {
        create: {
          plan: SubscriptionPlan.ENTERPRISE,
          status: 'ACTIVE',
        },
      },
    },
  })

  // Create test users
  for (let i = 1; i <= 5; i++) {
    await prisma.user.create({
      data: {
        email: `user${i}@example.com`,
        name: `Test User ${i}`,
        password: await bcrypt.hash('password123', 10),
        role: UserRole.USER,
        subscription: {
          create: {
            plan: i % 2 === 0 ? SubscriptionPlan.PRO : SubscriptionPlan.FREE,
            status: 'ACTIVE',
          },
        },
      },
    })
  }

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Technology',
        slug: 'technology',
        description: 'Tech news and updates',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Business',
        slug: 'business',
        description: 'Business insights',
      },
    }),
  ])

  // Create tags
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: 'AI', slug: 'ai' } }),
    prisma.tag.create({ data: { name: 'SaaS', slug: 'saas' } }),
    prisma.tag.create({ data: { name: 'Startup', slug: 'startup' } }),
  ])

  // Create sample posts
  await prisma.post.create({
    data: {
      title: 'Getting Started with Our Platform',
      slug: 'getting-started',
      content: 'Welcome to our platform! Here\'s how to get started...',
      excerpt: 'A comprehensive guide to getting started',
      status: 'PUBLISHED',
      publishedAt: new Date(),
      categoryId: categories[0].id,
      tags: {
        connect: [{ id: tags[0].id }, { id: tags[1].id }],
      },
    },
  })

  // Create settings
  await prisma.setting.createMany({
    data: [
      { key: 'site_name', value: JSON.stringify('My SaaS App') },
      { key: 'site_description', value: JSON.stringify('The best SaaS platform') },
      { key: 'support_email', value: JSON.stringify('support@example.com') },
      { key: 'maintenance_mode', value: JSON.stringify(false) },
    ],
  })

  console.log('✅ Database seeded successfully')
  console.log(`👤 Admin: admin@example.com / admin123`)
  console.log(`👥 Test Users: user1@example.com - user5@example.com / password123`)
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

---

## Database Utilities (lib/db/prisma.ts)

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Helper function to handle Prisma errors
export function handlePrismaError(error: any): string {
  if (error.code === 'P2002') {
    return 'A record with this information already exists.'
  }
  if (error.code === 'P2025') {
    return 'Record not found.'
  }
  if (error.code === 'P2003') {
    return 'Invalid reference to related record.'
  }
  return 'An unexpected error occurred.'
}
```

---

## Common Database Queries

### User Queries
```typescript
// Get user with subscription
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    subscription: true,
    payments: {
      orderBy: { createdAt: 'desc' },
      take: 10,
    },
  },
})

// Get active subscribers
const subscribers = await prisma.user.findMany({
  where: {
    subscription: {
      status: 'ACTIVE',
      plan: { not: 'FREE' },
    },
  },
  include: { subscription: true },
})
```

### Analytics Queries
```typescript
// Monthly revenue
const revenue = await prisma.payment.aggregate({
  where: {
    status: 'SUCCEEDED',
    createdAt: {
      gte: new Date(new Date().setDate(1)), // First day of month
    },
  },
  _sum: { amount: true },
})

// User growth
const newUsers = await prisma.user.count({
  where: {
    createdAt: {
      gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
    },
  },
})
```

---

## Backup Strategy

### Automated Backups
```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > backup_$DATE.sql
# Upload to S3 or similar
```

### Restoration
```bash
# Restore from backup
psql $DATABASE_URL < backup_file.sql
```

---

## Performance Optimization

### Indexes
Already included in schema for common query patterns.

### Connection Pooling
Use PgBouncer or Supabase's built-in pooling.

### Query Optimization
```typescript
// Use select to limit fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    name: true,
  },
})

// Use pagination
const page = 1
const perPage = 20
const users = await prisma.user.findMany({
  skip: (page - 1) * perPage,
  take: perPage,
})
```

---

## Cost Estimation

### Database Hosting
- **Supabase Free**: $0 (500MB, good for MVP)
- **Supabase Pro**: $25/month (8GB)
- **Railway**: $5-20/month based on usage
- **Neon**: $0-20/month (serverless Postgres)

### Recommended for $1000 App
- Start with Supabase Free tier
- Upgrade to Pro ($25/month) when you hit 100+ users
- Budget $150-300 for database over 6 months
