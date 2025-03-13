'use client'

import { useState, useEffect } from 'react'
import { useSession } from '@/hooks/use-session'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { columns } from './columns'
import { DataTable } from '@/components/table/data-table'
import { LeadStatus, Priority } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Skeleton } from '@/components/ui/skeleton'

type FilterState = {
  [key: string]: string[]
}

export default function LeadsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [mounted, setMounted] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    priority: []
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const { data, isLoading } = useQuery({
    queryKey: ['leads', filters],
    queryFn: async () => {
      const queryString = new URLSearchParams()
      filters.status.forEach(status => queryString.append('status', status))
      filters.priority.forEach(priority => queryString.append('priority', priority))

      const response = await fetch(`/api/leads?${queryString}`)
      if (!response.ok) throw new Error('Failed to fetch leads')
      return response.json()
    },
    enabled: mounted, // Only run query when component is mounted
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 5 * 60 * 1000 // Keep data in cache for 5 minutes
  })

  if (!mounted) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-[600px]" />
      </div>
    )
  }

  const filterableColumns = {
    status: {
      title: "Status",
      options: Object.values(LeadStatus).map(status => ({
        label: status.toLowerCase().replace('_', ' '),
        value: status
      }))
    },
    priority: {
      title: "Priority",
      options: Object.values(Priority).map(priority => ({
        label: priority.toLowerCase(),
        value: priority
      }))
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Leads</h1>
          <p className="text-sm text-muted-foreground">
            Manage leads and track their progress
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/leads/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Lead
        </Button>
      </div>

      <DataTable 
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        searchableColumn="title"
        filterableColumns={filterableColumns}
        onFiltersChange={setFilters}
      />
    </div>
  )
}
