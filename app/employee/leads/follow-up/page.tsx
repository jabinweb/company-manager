'use client'

import { useQuery } from '@tanstack/react-query'
import { DataTable } from '@/components/table/data-table'
import { columns } from '../columns'
import { Card } from '@/components/ui/card'

export default function FollowUpLeadsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['followUpLeads'],
    queryFn: async () => {
      const response = await fetch('/api/employee/leads/follow-up')
      if (!response.ok) throw new Error('Failed to fetch follow-ups')
      return response.json()
    }
  })

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Follow-up Required</h2>
        <p className="text-sm text-muted-foreground">
          Leads that require follow-up actions
        </p>
      </div>

      <DataTable 
        columns={columns}
        data={data?.leads || []}
        isLoading={isLoading}
        searchableColumn="title"
      />
    </div>
  )
}
