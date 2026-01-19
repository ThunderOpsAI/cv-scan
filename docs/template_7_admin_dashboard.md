# Template 7: Admin Dashboard Template

## Dashboard Layout (app/admin/layout.tsx)
```typescript
import { Sidebar } from '@/components/admin/sidebar'
import { requireAdmin } from '@/lib/api/auth'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin().catch(() => null)
  if (!user) redirect('/login')

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  )
}
```

## Stats Cards (components/admin/stats-card.tsx)
```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
}: {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: { value: number; isPositive: boolean }
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p className={`text-xs ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% from last month
          </p>
        )}
      </CardContent>
    </Card>
  )
}
```

## Dashboard Page (app/admin/page.tsx)
```typescript
import { Users, DollarSign, Activity, TrendingUp } from 'lucide-react'
import { StatsCard } from '@/components/admin/stats-card'
import { prisma } from '@/lib/db/prisma'

async function getStats() {
  const [totalUsers, activeSubscriptions, monthlyRevenue, newUsersThisMonth] = await Promise.all([
    prisma.user.count(),
    prisma.subscription.count({ where: { status: 'ACTIVE' } }),
    prisma.payment.aggregate({
      where: {
        status: 'SUCCEEDED',
        createdAt: { gte: new Date(new Date().setDate(1)) },
      },
      _sum: { amount: true },
    }),
    prisma.user.count({
      where: { createdAt: { gte: new Date(new Date().setDate(1)) } },
    }),
  ])

  return {
    totalUsers,
    activeSubscriptions,
    monthlyRevenue: (monthlyRevenue._sum.amount || 0) / 100,
    newUsersThisMonth,
  }
}

export default async function AdminDashboard() {
  const stats = await getStats()

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Users" value={stats.totalUsers} icon={Users} />
        <StatsCard title="Active Subscriptions" value={stats.activeSubscriptions} icon={TrendingUp} />
        <StatsCard title="Monthly Revenue" value={`$${stats.monthlyRevenue.toFixed(2)}`} icon={DollarSign} />
        <StatsCard title="New Users (MTD)" value={stats.newUsersThisMonth} icon={Activity} />
      </div>
    </div>
  )
}
```

## User Management Table (app/admin/users/page.tsx)
```typescript
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { prisma } from '@/lib/db/prisma'
import { Badge } from '@/components/ui/badge'

const columns: ColumnDef<any>[] = [
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'name', header: 'Name' },
  {
    accessorKey: 'subscription.plan',
    header: 'Plan',
    cell: ({ row }) => {
      const plan = row.original.subscription?.plan || 'FREE'
      return <Badge variant={plan === 'FREE' ? 'secondary' : 'default'}>{plan}</Badge>
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Joined',
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
  },
]

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    include: { subscription: true },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Users</h1>
      <DataTable columns={columns} data={users} />
    </div>
  )
}
```

## Analytics Chart Component
```typescript
'use client'

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export function RevenueChart({ data }: { data: { date: string; revenue: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  )
}
```
