import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Task } from "@prisma/client"
import { useEffect, useState } from "react"

interface EmployeeTasksProps {
  employeeId: string
}

export function EmployeeTasks({ employeeId }: EmployeeTasksProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Add API call to fetch tasks
    setLoading(false)
  }, [employeeId])

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          {tasks.map(task => (
            <div key={task.id} className="flex items-center justify-between p-2 border-b">
              <div>
                <p className="font-medium">{task.title}</p>
                <p className="text-sm text-muted-foreground">{task.description}</p>
              </div>
              <Badge variant={task.status === 'COMPLETED' ? 'default' : 'secondary'}>
                {task.status}
              </Badge>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
