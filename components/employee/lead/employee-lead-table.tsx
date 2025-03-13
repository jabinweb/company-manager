'use client'

import { useQuery } from "@tanstack/react-query"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LeadStatus, Priority } from "@prisma/client"
import { format } from "date-fns"

interface EmployeeLeadTableProps {
  pageSize?: number
  showPagination?: boolean
}

interface Lead {
  id: string
  title: string
  status: LeadStatus
  priority: Priority
  nextFollowUp: string | null
  value: number | null
}

interface LeadsResponse {
  data: Lead[]
  meta: {
    total: number
    page: number
    limit: number
  }
}

const statusColors: { [K in LeadStatus]: string } = {
  NEW: "bg-blue-500",
  CONTACTED: "bg-yellow-500",
  QUALIFIED: "bg-green-500",
  PROPOSAL: "bg-purple-500",
  NEGOTIATION: "bg-pink-500",
  WON: "bg-emerald-500",
  LOST: "bg-red-500",
  ON_HOLD: "bg-gray-500"
}

export function EmployeeLeadTable({ pageSize = 10, showPagination = true }: EmployeeLeadTableProps) {
  const { data: leads } = useQuery<LeadsResponse>({
    queryKey: ['employeeLeads'],
    queryFn: async () => {
      const res = await fetch('/api/employee/leads')
      if (!res.ok) throw new Error('Failed to fetch leads')
      return res.json()
    }
  })

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Next Follow-up</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads?.data?.slice(0, pageSize).map((lead: Lead) => (
            <TableRow key={lead.id}>
              <TableCell>{lead.title}</TableCell>
              <TableCell>
                <Badge className={statusColors[lead.status as LeadStatus]}>
                  {lead.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{lead.priority}</Badge>
              </TableCell>
              <TableCell>
                {lead.nextFollowUp ? 
                  format(new Date(lead.nextFollowUp), 'MMM d, yyyy') : 
                  'Not scheduled'}
              </TableCell>
              <TableCell>${lead.value?.toLocaleString() || '0'}</TableCell>
              <TableCell>
                <Button variant="ghost" size="sm">
                  View
                </Button>
              </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  )
}
