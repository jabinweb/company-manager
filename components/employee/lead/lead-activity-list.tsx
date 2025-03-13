'use client'

import { useQuery } from "@tanstack/react-query"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"
import { ActivityType } from "@prisma/client"

interface LeadActivityListProps {
  limit?: number
  showFilters?: boolean
  showTimeline?: boolean
}

interface Activity {
  id: string
  type: ActivityType
  description: string
  createdAt: string
  employee: {
    name: string
    avatar?: string
  }
  lead: {
    title: string
  }
}

const activityColors: Record<ActivityType, string> = {
  [ActivityType.NOTE]: "bg-blue-500",
  [ActivityType.CALL]: "bg-green-500",
  [ActivityType.EMAIL]: "bg-yellow-500",
  [ActivityType.MEETING]: "bg-purple-500",
  [ActivityType.TASK]: "bg-pink-500",
  [ActivityType.FOLLOW_UP]: "bg-orange-500",
  [ActivityType.PROPOSAL]: "bg-cyan-500",
  [ActivityType.OTHER]: "bg-gray-500"
}

export function LeadActivityList({ limit = 5, showFilters = false }: LeadActivityListProps) {
  const { data: activities } = useQuery<Activity[]>({
    queryKey: ['leadActivities'],
    queryFn: async () => {
      const res = await fetch('/api/employee/leads/activities')
      if (!res.ok) throw new Error('Failed to fetch activities')
      return res.json()
    }
  })

  return (
    <div className="space-y-4">
      {activities?.slice(0, limit).map((activity: Activity) => (
        <Card key={activity.id} className="p-4">
          <div className="flex items-start space-x-4">
            <Avatar className="h-8 w-8">
              <AvatarImage src={activity.employee?.avatar} />
              <AvatarFallback>{activity.employee?.name?.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <Badge className={activityColors[activity.type]}>
                  {activity.type}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(activity.createdAt), 'MMM d, h:mm a')}
                </span>
              </div>
              <p className="text-sm">{activity.description}</p>
              {activity.lead && (
                <p className="text-xs text-muted-foreground">
                  Lead: {activity.lead.title}
                </p>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
