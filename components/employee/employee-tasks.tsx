'use client'

import { useQuery } from "@tanstack/react-query"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TaskStatus, TaskPriority } from "@prisma/client"
import { format } from "date-fns"
import { CheckCircle2, Clock } from "lucide-react"

export interface EmployeeTasksProps {
  limit?: number
  showOnlyToday?: boolean
  className?: string
  priority?: TaskPriority
}

export function EmployeeTasks({ limit = 10, showOnlyToday = false, className }: EmployeeTasksProps) {
  const { data: tasks } = useQuery({
    queryKey: ['employeeTasks', { limit, showOnlyToday }],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (limit) params.set('limit', limit.toString())
      if (showOnlyToday) params.set('today', 'true')
      
      const res = await fetch(`/api/employee/tasks?${params}`)
      if (!res.ok) throw new Error('Failed to fetch tasks')
      return res.json()
    }
  })

  const getStatusColor = (status: TaskStatus) => {
    const colors = {
      [TaskStatus.TODO]: "bg-gray-500",
      [TaskStatus.IN_PROGRESS]: "bg-blue-500",
      [TaskStatus.COMPLETED]: "bg-green-500",
      [TaskStatus.BLOCKED]: "bg-red-500",
      [TaskStatus.IN_REVIEW]: "bg-yellow-500",
      [TaskStatus.CANCELLED]: "bg-slate-500",
      [TaskStatus.ON_HOLD]: "bg-orange-500"
    }
    return colors[status]
  }

  const getPriorityColor = (priority: TaskPriority) => {
    const colors = {
      [TaskPriority.LOW]: "bg-blue-100 text-blue-800",
      [TaskPriority.MEDIUM]: "bg-yellow-100 text-yellow-800",
      [TaskPriority.HIGH]: "bg-orange-100 text-orange-800",
      [TaskPriority.URGENT]: "bg-red-100 text-red-800"
    }
    return colors[priority]
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {tasks?.map((task: any) => (
        <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              {task.status === TaskStatus.COMPLETED ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <Clock className="h-5 w-5 text-blue-500" />
              )}
            </div>
            <div className="space-y-1">
              <h4 className="font-medium">{task.title}</h4>
              <div className="flex items-center space-x-2">
                <Badge className={getStatusColor(task.status)}>
                  {task.status}
                </Badge>
                <Badge variant="outline" className={getPriorityColor(task.priority)}>
                  {task.priority}
                </Badge>
                {task.dueDate && (
                  <span className="text-sm text-muted-foreground">
                    Due {format(new Date(task.dueDate), 'MMM d')}
                  </span>
                )}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            View
          </Button>
        </div>
      ))}
    </div>
  )
}
