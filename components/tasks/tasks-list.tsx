'use client'

import { useState } from 'react'
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Calendar, Clock, MessageSquare, CheckCircle2, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface Task {
  id: number 
  title: string
  description: string
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'BLOCKED' | 'COMPLETED' | 'CANCELLED' | 'ON_HOLD'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  category: string
  progress: number
  dueDate?: string
  assignee: {
    name: string
    avatar?: string
  }
  _count: {
    comments: number
    subTasks: number
  }
}

interface TasksListProps {
  tasks: Task[]
  onTaskClick: (taskId: number) => void
  onFilterChange?: (filter: { status?: string; priority?: string; category?: string }) => void
}

export function TasksList({ tasks, onTaskClick, onFilterChange }: TasksListProps) {
  const [activeFilters, setActiveFilters] = useState({
    status: '',
    priority: '',
    category: '',
  })

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = {
      ...activeFilters,
      [key]: value,
    }
    setActiveFilters(newFilters)
    onFilterChange?.(newFilters)
  }

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-500'
      case 'IN_PROGRESS': return 'bg-blue-500'
      case 'BLOCKED': return 'bg-red-500'
      case 'IN_REVIEW': return 'bg-yellow-500'
      case 'ON_HOLD': return 'bg-orange-500'
      case 'CANCELLED': return 'bg-gray-500'
      default: return 'bg-slate-500'
    }
  }

  const getPriorityIcon = (priority: Task['priority']) => {
    switch (priority) {
      case 'URGENT': return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'HIGH': return <AlertCircle className="h-4 w-4 text-orange-500" />
      case 'MEDIUM': return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'LOW': return <AlertCircle className="h-4 w-4 text-green-500" />
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <Select 
          onValueChange={(value) => handleFilterChange('status', value)}
          value={activeFilters.status}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Status</SelectItem>
            <SelectItem value="TODO">Todo</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="IN_REVIEW">In Review</SelectItem>
            <SelectItem value="BLOCKED">Blocked</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="ON_HOLD">On Hold</SelectItem>
          </SelectContent>
        </Select>

        <Select 
          onValueChange={(value) => handleFilterChange('priority', value)}
          value={activeFilters.priority}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Priorities</SelectItem>
            <SelectItem value="URGENT">Urgent</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="LOW">Low</SelectItem>
          </SelectContent>
        </Select>

        <Select 
          onValueChange={(value) => handleFilterChange('category', value)}
          value={activeFilters.category}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            <SelectItem value="GENERAL">General</SelectItem>
            <SelectItem value="PROJECT">Project</SelectItem>
            <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
            <SelectItem value="DEVELOPMENT">Development</SelectItem>
            <SelectItem value="MEETING">Meeting</SelectItem>
            <SelectItem value="DOCUMENTATION">Documentation</SelectItem>
            <SelectItem value="REVIEW">Review</SelectItem>
            <SelectItem value="OTHER">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tasks.map((task) => (
          <Card 
            key={task.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onTaskClick(task.id)}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <Badge 
                  variant="outline" 
                  className={cn("px-2 py-0.5", getStatusColor(task.status))}
                >
                  {task.status}
                </Badge>
                {getPriorityIcon(task.priority)}
              </div>
              <CardTitle className="line-clamp-1">{task.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {task.description}
              </p>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={task.assignee.avatar} />
                      <AvatarFallback>{task.assignee.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">
                      {task.assignee.name}
                    </span>
                  </div>
                  <Badge variant="outline">{task.category}</Badge>
                </div>

                <Progress value={task.progress} className="h-1" />

                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>{task._count.comments}</span>
                    </div>
                    {task._count.subTasks > 0 && (
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>{task._count.subTasks}</span>
                      </div>
                    )}
                  </div>
                  {task.dueDate && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{format(new Date(task.dueDate), 'MMM d')}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}