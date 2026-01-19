# Template 1: Project Initialization Template

## Purpose
Standardized project structure and configuration for rapid app development with best practices built-in.

## Tech Stack Options

### Option A: Next.js Full-Stack (Recommended for MVPs)
- **Frontend**: Next.js 14+ (React 18+, App Router)
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: NextAuth.js or Clerk
- **Styling**: Tailwind CSS + shadcn/ui
- **Deployment**: Vercel

### Option B: Separated Stack (For Scalability)
- **Frontend**: React 18+ with Vite
- **Backend**: Node.js + Express or FastAPI (Python)
- **Database**: PostgreSQL with Drizzle/TypeORM or SQLAlchemy
- **Auth**: Auth0 or Supabase Auth
- **Styling**: Tailwind CSS + Headless UI
- **Deployment**: Frontend (Vercel/Netlify), Backend (Railway/Render)

### Option C: Rapid Prototype (Fastest MVP)
- **Full Stack**: Supabase (Database + Auth + Storage)
- **Frontend**: Next.js 14+ or SvelteKit
- **Styling**: Tailwind CSS + DaisyUI
- **Deployment**: Vercel + Supabase

---

## Project Structure (Next.js Full-Stack)

```
project-root/
├── .github/
│   └── workflows/
│       ├── ci.yml                 # Automated testing
│       └── deploy.yml             # Deployment pipeline
├── public/
│   ├── images/
│   ├── favicon.ico
│   └── robots.txt
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── (auth)/               # Auth routes group
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/          # Protected routes
│   │   │   ├── dashboard/
│   │   │   ├── settings/
│   │   │   └── layout.tsx
│   │   ├── (marketing)/          # Public routes
│   │   │   ├── page.tsx          # Landing page
│   │   │   ├── pricing/
│   │   │   ├── about/
│   │   │   └── layout.tsx
│   │   ├── api/                  # API routes
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── payments/
│   │   │   └── webhooks/
│   │   ├── layout.tsx            # Root layout
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                   # shadcn/ui components
│   │   ├── forms/                # Form components
│   │   ├── layouts/              # Layout components
│   │   └── marketing/            # Marketing components
│   ├── lib/
│   │   ├── db/                   # Database utilities
│   │   │   ├── prisma.ts
│   │   │   └── migrations/
│   │   ├── auth/                 # Auth utilities
│   │   ├── api/                  # API clients
│   │   ├── utils.ts              # Helper functions
│   │   └── validations.ts        # Zod schemas
│   ├── hooks/                    # Custom React hooks
│   ├── types/                    # TypeScript types
│   └── config/                   # App configuration
│       ├── site.ts               # Site metadata
│       └── constants.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env.example
├── .env.local
├── .eslintrc.json
├── .prettierrc
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## Core Configuration Files

### package.json
```json
{
  "name": "app-name",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "format": "prettier --write \"**/*.{ts,tsx,md,json}\"",
    "db:push": "prisma db push",
    "db:studio": "prisma studio",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:seed": "tsx prisma/seed.ts",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "@prisma/client": "^5.15.0",
    "next-auth": "^4.24.0",
    "zod": "^3.23.0",
    "stripe": "^15.0.0",
    "tailwindcss": "^3.4.0",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.3.0",
    "lucide-react": "^0.378.0",
    "react-hook-form": "^7.51.0",
    "@hookform/resolvers": "^3.3.0",
    "date-fns": "^3.6.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "typescript": "^5.4.0",
    "prisma": "^5.15.0",
    "eslint": "^8.57.0",
    "eslint-config-next": "14.2.0",
    "prettier": "^3.2.0",
    "@testing-library/react": "^15.0.0",
    "@testing-library/jest-dom": "^6.4.0",
    "jest": "^29.7.0",
    "@playwright/test": "^1.44.0",
    "tsx": "^4.11.0"
  }
}
```

### .env.example
```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# OAuth Providers (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# Payments
STRIPE_SECRET_KEY=""
STRIPE_PUBLISHABLE_KEY=""
STRIPE_WEBHOOK_SECRET=""

# Email
SMTP_HOST=""
SMTP_PORT=""
SMTP_USER=""
SMTP_PASSWORD=""
RESEND_API_KEY=""

# Analytics (optional)
NEXT_PUBLIC_GA_ID=""
NEXT_PUBLIC_POSTHOG_KEY=""

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS="false"
NEXT_PUBLIC_ENABLE_PAYMENTS="false"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="YourApp"
```

### next.config.js
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  webpack: (config) => {
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
    });
    return config;
  },
}

module.exports = nextConfig;
```

### tailwind.config.ts
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ["class"],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
export default config
```

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### .eslintrc.json
```json
{
  "extends": ["next/core-web-vitals", "prettier"],
  "rules": {
    "react/no-unescaped-entities": "off",
    "@next/next/no-html-link-for-pages": "off",
    "prefer-const": "error",
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}
```

### .prettierrc
```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

---

## Initialization Script

Create a `scripts/init.sh` file:

```bash
#!/bin/bash

echo "🚀 Initializing project..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Setup environment variables
if [ ! -f .env.local ]; then
  echo "📝 Creating .env.local from .env.example..."
  cp .env.example .env.local
  echo "⚠️  Please update .env.local with your actual values"
fi

# Generate Prisma client
echo "🗄️  Generating Prisma client..."
npm run db:generate

# Run database migrations
echo "🔄 Running database migrations..."
npm run db:push

# Seed database (optional)
read -p "Do you want to seed the database? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  npm run db:seed
fi

# Setup Git hooks (optional)
read -p "Do you want to setup Git hooks for pre-commit linting? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  npx husky install
  npx husky add .husky/pre-commit "npm run lint && npm run type-check"
fi

echo "✅ Project initialized successfully!"
echo "📖 Run 'npm run dev' to start the development server"
```

---

## README Template

```markdown
# [Project Name]

[Brief description of what your app does]

## Features

- 🔐 Authentication with NextAuth.js
- 💳 Payment integration with Stripe
- 📧 Email notifications
- 📊 Admin dashboard
- 🎨 Modern UI with Tailwind CSS
- 📱 Fully responsive design
- ♿ Accessibility compliant

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and fill in your values
4. Run database migrations: `npm run db:push`
5. Start development server: `npm run dev`

## Tech Stack

- **Framework**: Next.js 14
- **Database**: PostgreSQL + Prisma
- **Authentication**: NextAuth.js
- **Payments**: Stripe
- **Styling**: Tailwind CSS + shadcn/ui
- **Deployment**: Vercel

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Lint code
- `npm run type-check` - Type check
- `npm run db:studio` - Open Prisma Studio

## Environment Variables

See `.env.example` for required environment variables.

## Deployment

Deploy to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

## License

MIT
```

---

## Quality Checklist

Before considering initialization complete:

- [ ] All dependencies installed successfully
- [ ] Environment variables configured
- [ ] Database connection working
- [ ] Prisma schema generated
- [ ] Git repository initialized
- [ ] First commit made
- [ ] Development server runs without errors
- [ ] TypeScript compilation successful
- [ ] Linting passes
- [ ] README updated with project-specific info

---

## Cost Estimation (First 6 Months)

### Setup Costs
- Domain name: $12-15/year
- Logo/branding (optional): $0-50 (Canva/DIY)

### Monthly Recurring
- **Hosting** (Vercel Pro): $20/month
- **Database** (Supabase/Railway): $5-25/month
- **Authentication** (if using Clerk): $0-25/month
- **Email** (Resend): $0-10/month
- **Analytics** (PostHog): $0-20/month
- **Monitoring** (Sentry): $0-26/month

**Total Monthly**: $25-126/month
**6-Month Estimate**: $150-756

### Budget Recommendation
- **Minimal**: $200-300 (6 months) - Use free tiers, upgrade as needed
- **Standard**: $500-600 (6 months) - Some paid services, better UX
- **Premium**: $800-1000 (6 months) - All premium tools, best reliability
