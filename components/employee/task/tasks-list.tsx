'use client'

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, AlertCircle } from "lucide-react"

interface Task {
  id: string
  title: string
  dueDate: string
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD'
  priority: number
}

export function TasksList() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchTasks() {
      try {
        const response = await fetch('/api/employee/tasks')
        if (response.ok) {
          const data = await response.json()
          setTasks(data.tasks)
        }
      } catch (error) {
        console.error('Failed to fetch tasks:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTasks()
  }, [])

  if (isLoading) {
    return <Card><CardContent>Loading tasks...</CardContent></Card>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" />
          Tasks
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {tasks.length === 0 ? (
          <p className="text-center text-muted-foreground">No tasks assigned</p>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-start justify-between p-4 border rounded-lg"
            >
              <div className="space-y-1">
                <p className="font-medium">{task.title}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {new Date(task.dueDate).toLocaleDateString()}
                </div>
              </div>
              <Badge
                variant={
                  task.status === 'COMPLETED' ? 'default' :
                  task.status === 'IN_PROGRESS' ? 'secondary' :
                  task.status === 'ON_HOLD' ? 'destructive' : 'outline'
                }
              >
                {task.status}
              </Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
