'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSession } from '@/hooks/use-session'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { columns } from './columns'
import { DataTable } from '@/components/table/data-table'
import { LeadStatus, Priority } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { useLeads } from '@/hooks/use-leads'

type FilterState = {
  [key: string]: string[]
}

export function LeadsList() {
  const router = useRouter()
  const { data: session } = useSession()
  const [mounted, setMounted] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    priority: []
  })

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  const { data, isLoading } = useLeads({
    status: filters.status as LeadStatus[],
    priority: filters.priority as Priority[],
    enabled: mounted
  })

  const filterableColumns = useMemo(() => ({
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
  }), [])

  if (!mounted) return null

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Leads</h1>
          <p className="text-sm text-muted-foreground">
            Manage and track your assigned leads
          </p>
        </div>
        <Button onClick={() => router.push('/employee/leads/new')}>
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
