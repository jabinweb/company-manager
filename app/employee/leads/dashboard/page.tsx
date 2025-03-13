'use client'

import { Suspense } from 'react'
import { LeadStatistics } from '@/components/leads/lead-statistics'
import { LeadActivityTimeline } from '@/components/leads/lead-activity-timeline'
import { LeadReminders } from '@/components/leads/lead-reminders'
import { LeadPriorityChart } from '@/components/leads/lead-priority-chart'
import { LeadStatusDistribution } from '@/components/leads/lead-status-distribution'
import { Skeleton } from '@/components/ui/skeleton'

export default function LeadDashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Lead Dashboard</h1>
      
      <Suspense fallback={<Skeleton className="h-[120px]" />}>
        <LeadStatistics />
      </Suspense>

      <div className="grid gap-6 md:grid-cols-2">
        <Suspense fallback={<Skeleton className="h-[400px]" />}>
          <LeadStatusDistribution />
        </Suspense>
        
        <Suspense fallback={<Skeleton className="h-[400px]" />}>
          <LeadPriorityChart />
        </Suspense>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Suspense fallback={<Skeleton className="h-[400px]" />}>
          <LeadReminders activities={[]} />
        </Suspense>
        
        <Suspense fallback={<Skeleton className="h-[400px]" />}>
          <LeadActivityTimeline />
        </Suspense>
      </div>
    </div>
  )
}
