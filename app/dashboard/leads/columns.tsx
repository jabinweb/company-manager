'use client'

import { ColumnDef, Row } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { ActionButtons } from "@/components/ActionButtons"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { Lead, LeadStatus, Priority } from "@/types/lead"

export interface LeadTableItem {
  id: string
  title: string
  contactName: string
  email: string
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
            href={`/dashboard/leads/${lead.id}`}
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
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    id: "contact",
    header: "Contact",
    cell: ({ row }) => {
      const lead = row.original
      return (
        <div className="flex flex-col">
          <span>{lead.contactName}</span>
          <span className="text-sm text-muted-foreground">{lead.email}</span>
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
      return <LeadStatusBadge status={status} />
    },
    enableColumnFilter: true,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => {
      const priority = row.getValue("priority") as Priority
      return <PriorityBadge priority={priority} />
    },
    enableColumnFilter: true,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "value",
    header: "Value",
    cell: ({ row }) => {
      const value = row.getValue("value") as number
      return value ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(value) : '-'
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <RowActions row={row} />
  }
]

function LeadStatusBadge({ status }: { status: LeadStatus }) {
  const statusColors: Record<LeadStatus, string> = {
    NEW: 'bg-blue-100 text-blue-800',
    CONTACTED: 'bg-purple-100 text-purple-800',
    QUALIFIED: 'bg-cyan-100 text-cyan-800',
    PROPOSAL: 'bg-yellow-100 text-yellow-800',
    NEGOTIATION: 'bg-orange-100 text-orange-800',
    WON: 'bg-green-100 text-green-800',
    LOST: 'bg-red-100 text-red-800',
    ON_HOLD: 'bg-gray-100 text-gray-800'
  }

  return (
    <Badge className={statusColors[status]}>
      {status.toLowerCase().replace('_', ' ')}
    </Badge>
  )
}

function PriorityBadge({ priority }: { priority: Priority }) {
  const priorityColors: Record<Priority, string> = {
    LOW: 'bg-blue-100 text-blue-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    HIGH: 'bg-orange-100 text-orange-800',
    URGENT: 'bg-red-100 text-red-800'
  }

  return (
    <Badge className={priorityColors[priority]}>
      {priority.toLowerCase()}
    </Badge>
  )
}

function RowActions({ row }: { row: Row<LeadTableItem> }) {
  const router = useRouter();
  const lead = row.original;

  const handleDelete = async () => {
    if (!lead?.id) return;

    try {
      const response = await fetch(`/api/leads/${lead.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete lead');
      
      toast({
        title: "Success",
        description: "Lead deleted successfully",
      });
      
      router.refresh();
    } catch (error) {
      console.error('Delete lead error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete lead",
      });
    }
  };

  return (
    <ActionButtons
      onEdit={() => router.push(`/dashboard/leads/${lead.id}/edit`)}
      onDelete={handleDelete}
    />
  );
}
