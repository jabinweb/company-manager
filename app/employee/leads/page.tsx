'use client'

import { Suspense } from 'react'
import { LeadsList } from './leads-list'
import { Skeleton } from '@/components/ui/skeleton'

function LoadingSkeleton() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-48 mt-2" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <Skeleton className="h-[600px] w-full" />
    </div>
  )
}

export default function EmployeeLeadsPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <LeadsList />
    </Suspense>
  )
}
