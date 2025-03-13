'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownRight, Target, Users, CheckCircle2, Clock } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import type { DashboardStats } from "@/types/dashboard"

interface KeyMetricsProps {
  data?: DashboardStats
  isLoading?: boolean
}

interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  icon: React.ReactNode
  isLoading?: boolean
}

function MetricCard({ title, value, change, icon, isLoading }: MetricCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <div className="h-4 w-4 text-muted-foreground">{icon}</div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-7 w-[100px]" />
          <Skeleton className="h-4 w-[80px] mt-1" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-4 w-4 text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <p className={`text-xs ${change >= 0 ? 'text-green-500' : 'text-red-500'} flex items-center`}>
            {change >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
            {Math.abs(change)}% from last month
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export function KeyMetrics({ data, isLoading }: KeyMetricsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Total Leads"
        value={data?.totalLeads || 0}
        change={data?.leadsChange}
        icon={<Users className="h-4 w-4" />}
        isLoading={isLoading}
      />
      <MetricCard
        title="Conversion Rate"
        value={`${data?.conversionRate || 0}%`}
        change={data?.conversionChange}
        icon={<Target className="h-4 w-4" />}
        isLoading={isLoading}
      />
      <MetricCard
        title="Tasks Completed"
        value={data?.completedTasks || 0}
        icon={<CheckCircle2 className="h-4 w-4" />}
        isLoading={isLoading}
      />
      <MetricCard
        title="Pending Follow-ups"
        value={data?.pendingFollowUps || 0}
        icon={<Clock className="h-4 w-4" />}
        isLoading={isLoading}
      />
    </div>
  )
}
