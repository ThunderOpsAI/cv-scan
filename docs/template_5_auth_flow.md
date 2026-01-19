# Template 5: Authentication Flow Template

## Complete Auth Implementation with NextAuth.js

### Pages Structure
- `/login` - Sign in page
- `/register` - Sign up page
- `/verify-email` - Email verification
- `/forgot-password` - Password reset request
- `/reset-password` - Password reset form

### Login Page (app/(auth)/login/page.tsx)
```typescript
'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError('Invalid email or password')
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">{error}</div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>

            <Button type="submit" className="w-full" loading={loading}>
              Sign In
            </Button>

            <div className="text-center">
              <Link href="/forgot-password" className="text-sm text-muted-foreground hover:underline">
                Forgot password?
              </Link>
            </div>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" onClick={() => signIn('google', { callbackUrl: '/dashboard' })}>
              Google
            </Button>
            <Button variant="outline" onClick={() => signIn('github', { callbackUrl: '/dashboard' })}>
              GitHub
            </Button>
          </div>

          <div className="mt-4 text-center text-sm">
            Don't have an account?{' '}
            <Link href="/register" className="font-medium hover:underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

### Register Page (app/(auth)/register/page.tsx)
```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    }

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    setLoading(false)

    if (!res.ok) {
      const error = await res.json()
      setError(error.error?.message || 'Registration failed')
    } else {
      router.push('/login?registered=true')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>Enter your details to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">{error}</div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" minLength={8} required />
              <p className="text-xs text-muted-foreground">Must be at least 8 characters</p>
            </div>

            <Button type="submit" className="w-full" loading={loading}>
              Create Account
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="font-medium hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

### Password Reset Request (app/(auth)/forgot-password/page.tsx)
```typescript
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: formData.get('email') }),
    })

    setLoading(false)
    setSent(true)
  }

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Check your email</CardTitle>
            <CardDescription>
              We've sent you a password reset link if an account exists with that email.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/login">
              <Button variant="outline" className="w-full">
                Back to login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset your password</CardTitle>
          <CardDescription>Enter your email to receive a reset link</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>

            <Button type="submit" className="w-full" loading={loading}>
              Send Reset Link
            </Button>

            <div className="text-center">
              <Link href="/login" className="text-sm text-muted-foreground hover:underline">
                Back to login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

### Protected Route Middleware (middleware.ts)
```typescript
import { withAuth } from 'next-auth/middleware'

export default withAuth({
  callbacks: {
    authorized: ({ req, token }) => {
      const path = req.nextUrl.pathname

      // Public paths
      if (path.startsWith('/login') || path.startsWith('/register')) {
        return true
      }

      // Protected paths require authentication
      if (path.startsWith('/dashboard') || path.startsWith('/settings')) {
        return !!token
      }

      // Admin paths require admin role
      if (path.startsWith('/admin')) {
        return token?.role === 'ADMIN' || token?.role === 'SUPER_ADMIN'
      }

      return true
    },
  },
})

export const config = {
  matcher: ['/dashboard/:path*', '/settings/:path*', '/admin/:path*', '/api/:path*'],
}
```

### Auth Provider (components/providers/auth-provider.tsx)
```typescript
'use client'

import { SessionProvider } from 'next-auth/react'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}
```

### User Menu Component (components/auth/user-menu.tsx)
```typescript
'use client'

import { signOut, useSession } from 'next-auth/react'
import { LogOut, Settings, User } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function UserMenu() {
  const { data: session } = useSession()

  if (!session) return null

  const initials = session.user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar>
            <AvatarImage src={session.user?.image || ''} alt={session.user?.name || ''} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{session.user?.name}</p>
            <p className="text-xs text-muted-foreground">{session.user?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/login' })}>
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

### Email Templates (lib/email/templates.ts)
```typescript
export const emailTemplates = {
  verification: (name: string, url: string) => ({
    subject: 'Verify your email',
    html: `
      <h1>Welcome ${name}!</h1>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${url}">Verify Email</a>
    `,
  }),

  passwordReset: (name: string, url: string) => ({
    subject: 'Reset your password',
    html: `
      <h1>Password Reset Request</h1>
      <p>Hi ${name},</p>
      <p>Click the link below to reset your password:</p>
      <a href="${url}">Reset Password</a>
      <p>This link expires in 1 hour.</p>
    `,
  }),

  welcome: (name: string) => ({
    subject: 'Welcome to our platform!',
    html: `
      <h1>Welcome aboard, ${name}!</h1>
      <p>We're excited to have you. Here's what you can do next:</p>
      <ul>
        <li>Complete your profile</li>
        <li>Explore features</li>
        <li>Join our community</li>
      </ul>
    `,
  }),
}
```

### Email Sending Utility (lib/email/send.ts)
```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'noreply@example.com',
      to,
      subject,
      html,
    })
    return { success: true }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error }
  }
}
```

### Auth Hooks (hooks/use-auth.ts)
```typescript
'use client'

import { useSession } from 'next-auth/react'

export function useAuth() {
  const { data: session, status } = useSession()

  return {
    user: session?.user,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    isAdmin: session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN',
  }
}

export function useRequireAuth() {
  const auth = useAuth()

  if (!auth.isAuthenticated && !auth.isLoading) {
    throw new Error('Unauthorized')
  }

  return auth
}
```
