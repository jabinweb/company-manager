'use client'

import { useState, useEffect } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
  Plus,
  Users,
  MessageCircle,
  Megaphone,
  CalendarPlus,
  ClipboardList,
  Mail,
} from "lucide-react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { TaskForm } from "@/components/tasks/task-form"

interface Employee {
  id: string
  name: string
  department: string
}

export function QuickActions() {
  const router = useRouter()
  const [showTaskDialog, setShowTaskDialog] = useState(false)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchEmployees() {
      try {
        setLoading(true)
        const response = await fetch('/api/employees/list')
        if (!response.ok) throw new Error('Failed to fetch employees')
        const data = await response.json()
        setEmployees(data)
      } catch (error) {
        console.error('Error fetching employees:', error)
      } finally {
        setLoading(false)
      }
    }

    // Only fetch when dialog is opened
    if (showTaskDialog) {
      fetchEmployees()
    }
  }, [showTaskDialog])

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <Plus className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => setShowTaskDialog(true)}>
            <ClipboardList className="mr-2 h-4 w-4" />
            Create Task
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => router.push('/admin/employees/new')}>
            <Users className="mr-2 h-4 w-4" />
            Add Employee
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          
          <DropdownMenuLabel>Communication</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => router.push('/admin/messages/new')}>
            <MessageCircle className="mr-2 h-4 w-4" />
            Message Employee
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => router.push('/admin/announcements/new')}>
            <Megaphone className="mr-2 h-4 w-4" />
            Create Announcement
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => router.push('/admin/mail/compose')}>
            <Mail className="mr-2 h-4 w-4" />
            Send Email
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => router.push('/admin/events/new')}>
            <CalendarPlus className="mr-2 h-4 w-4" />
            Schedule Event
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          {loading ? (
            <div className="flex items-center justify-center p-4">
              Loading employees...
            </div>
          ) : (
            <TaskForm 
              employees={employees}
              onSuccess={() => {
                setShowTaskDialog(false)
                router.refresh()
              }}
              onCancel={() => setShowTaskDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
