'use client'

import { useLeads } from '@/hooks/use-leads'
import { DataTable } from '@/components/table/data-table'
import { columns } from '../columns'
import { LeadStatus } from '@prisma/client'
import { TableSkeleton } from '@/components/table/table-skeleton'

export default function ActiveLeadsPage() {
  const { data, isLoading } = useLeads({
    status: [LeadStatus.NEW, LeadStatus.CONTACTED, LeadStatus.QUALIFIED, LeadStatus.PROPOSAL, LeadStatus.NEGOTIATION]
  })

  if (isLoading) {
    return <TableSkeleton />
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Active Leads</h2>
        <p className="text-sm text-muted-foreground">
          Manage your active leads that need attention
        </p>
      </div>

      <DataTable 
        columns={columns}
        data={data?.data || []}
        isLoading={false}
        searchableColumn="title"
      />
    </div>
  )
}
