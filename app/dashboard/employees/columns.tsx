'use client'

import { EmployeeStatus } from "@prisma/client"
import { ColumnDef, Row } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { ActionButtons } from "@/components/ActionButtons"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

export type Employee = {
  id: string
  name: string
  email: string
  phone: string
  department: string
  dateJoined: string
  status: EmployeeStatus
  avatar?: string | null
}

export const columns: ColumnDef<Employee>[] = [
  {
    accessorKey: "name",
    header: "Name",
    enableColumnFilter: true,
    enableSorting: true,
    cell: ({ row }) => {
      const employee = row.original
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            {employee.avatar ? (
              <AvatarImage src={employee.avatar} alt={employee.name} />
            ) : (
              <AvatarImage src={`https://avatar.vercel.sh/${employee.name}`} />
            )}
            <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <Link 
            href={`/dashboard/employees/${employee.id}`}
            className="font-medium hover:underline text-blue-600"
          >
            {employee.name}
          </Link>
        </div>
      )
    },
  },
  {
    accessorKey: "department",
    header: "Department",
    enableColumnFilter: true,
    enableSorting: true,
    filterFn: (row, id, filterValues: string[]) => {
      const value = row.getValue(id) as string
      return filterValues.length === 0 ? true : filterValues.includes(value)
    },
  },
  {
    id: "contact",
    header: "Contact",
    cell: ({ row }) => {
      const employee = row.original
      if (!employee) return null
      
      return (
        <div className="flex flex-col">
          <span>{employee.phone}</span>
          <span className="text-sm text-muted-foreground">{employee.email}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    enableColumnFilter: true,
    enableSorting: true,
    filterFn: (row, id, filterValues: string[]) => {
      const value = row.getValue(id) as string
      return filterValues.length === 0 ? true : filterValues.includes(value)
    },
    cell: ({ row }) => {
      const status = row.original.status

      if (!status) {
        return <Badge variant="outline">Unknown</Badge>
      }

      // Updated status colors to include all enum values
      const statusColors: Record<EmployeeStatus, string> = {
        ACTIVE: 'bg-green-100 text-green-800',
        ON_LEAVE: 'bg-yellow-100 text-yellow-800',
        PENDING: 'bg-blue-100 text-blue-800',
        REJECTED: 'bg-red-100 text-red-800', 
        SUSPENDED: 'bg-red-100 text-red-800',
        TERMINATED: 'bg-gray-100 text-gray-800',
        SABBATICAL: 'bg-purple-100 text-purple-800',
        MEDICAL_LEAVE: 'bg-orange-100 text-orange-800',
        MATERNITY_LEAVE: 'bg-pink-100 text-pink-800'
      }

      return (
        <Badge 
          className={statusColors[status] ?? 'bg-gray-100 text-gray-800'}
        >
          {status.split('_').join(' ')}
        </Badge>
      )
    },
  },
  {
    accessorKey: "dateJoined",
    header: "Hire Date",
    cell: ({ row }) => {
      const date = row.original.dateJoined // Access date directly
      if (!date) return null
      
      return new Date(date).toLocaleDateString()
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const employee = row.original;
      return employee ? <RowActions row={row} /> : null;
    }
  }
];

function RowActions({ row }: { row: Row<Employee> }) {
  const router = useRouter();
  const employee = row.original; // Get the employee data

  const handleDelete = async () => {
    if (!employee?.id) {
      console.error('No employee ID found');
      return;
    }

    try {
      const response = await fetch(`/api/employees/${employee.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete employee');
      }
      
      toast({
        title: "Success",
        description: "Employee deleted successfully",
      });
      
      router.refresh();
    } catch (error) {
      console.error('Delete employee error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete employee",
      });
    }
  };

  if (!employee) {
    return null;
  }

  return (
    <ActionButtons
      onEdit={() => router.push(`/dashboard/employees/${employee.id}/edit`)}
      onDelete={handleDelete}
    />
  );
}
