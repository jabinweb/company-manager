'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useQuery } from "@tanstack/react-query"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { ActivityType } from "@prisma/client"

const activityColors = {
  NOTE: 'bg-blue-500',
  CALL: 'bg-green-500',
  EMAIL: 'bg-yellow-500',
  MEETING: 'bg-purple-500',
  TASK: 'bg-pink-500',
  FOLLOW_UP: 'bg-orange-500',
  PROPOSAL: 'bg-cyan-500',
  OTHER: 'bg-gray-500'
}

export function RecentActivities() {
  const { data: activities } = useQuery({
    queryKey: ['recentActivities'],
    queryFn: async () => {
      const res = await fetch('/api/employee/leads/activities')
      if (!res.ok) throw new Error('Failed to fetch activities')
      return res.json()
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities?.map((activity: any) => (
            <div key={activity.id} className="flex items-start space-x-4">
              <Avatar className="h-8 w-8">
                <AvatarImage src={activity.employee.avatar} />
                <AvatarFallback>{activity.employee.name.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className={activityColors[activity.type as ActivityType]}>
                    {activity.type}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(activity.createdAt), 'MMM d, h:mm a')}
                  </span>
                </div>
                <p className="text-sm">{activity.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
