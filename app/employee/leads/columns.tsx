'use client'

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { LeadStatus, Priority } from "@prisma/client"

export interface LeadTableItem {
  id: string
  title: string
  contactName: string
  email: string | null
  status: LeadStatus
  priority: Priority
  value: number | null
  lastContactedAt: Date | null
  assignedTo: {
    id: string
    name: string
    avatar: string | null
  }
  _count: {
    activities: number
  }
}

export const columns: ColumnDef<LeadTableItem>[] = [
  {
    accessorKey: "title",
    header: "Lead",
    cell: ({ row }) => {
      const lead = row.original
      return (
        <div className="flex items-center gap-2">
          <Link 
            href={`/employee/leads/${lead.id}`}
            className="font-medium hover:underline text-blue-600"
          >
            {lead.title}
          </Link>
          {lead._count.activities > 0 && (
            <Badge variant="secondary">
              {lead._count.activities}
            </Badge>
          )}
        </div>
      )
    },
  },
  {
    id: "contact",
    header: "Contact",
    cell: ({ row }) => {
      const lead = row.original
      return (
        <div className="flex flex-col">
          <span>{lead.contactName}</span>
          {lead.email && (
            <span className="text-sm text-muted-foreground">{lead.email}</span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "assignedTo",
    header: "Owner",
    cell: ({ row }) => {
      const assignee = row.original.assignedTo
      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={assignee.avatar || ''} alt={assignee.name} />
            <AvatarFallback>{assignee.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span>{assignee.name}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as LeadStatus
      return (
        <Badge className={
          status === 'WON' ? 'bg-green-100 text-green-800' :
          status === 'LOST' ? 'bg-red-100 text-red-800' :
          status === 'QUALIFIED' ? 'bg-blue-100 text-blue-800' :
          status === 'NEGOTIATION' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }>
          {status.toLowerCase().replace('_', ' ')}
        </Badge>
      )
    },
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => {
      const priority = row.getValue("priority") as Priority
      return (
        <Badge className={
          priority === 'URGENT' ? 'bg-red-100 text-red-800' :
          priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
          priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
          'bg-blue-100 text-blue-800'
        }>
          {priority.toLowerCase()}
        </Badge>
      )
    },
  },
  {
    accessorKey: "value",
    header: "Value",
    cell: ({ row }) => {
      const value = row.getValue("value") as number | null
      if (!value) return '-'
      
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(value)
    },
  },
  {
    accessorKey: "lastContactedAt",
    header: "Last Contact",
    cell: ({ row }) => {
      const date = row.getValue("lastContactedAt") as Date | null
      if (!date) return 'Never'
      
      return new Intl.DateTimeFormat('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }).format(new Date(date))
    },
  },
]
