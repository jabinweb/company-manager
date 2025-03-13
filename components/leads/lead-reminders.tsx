'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bell, Calendar } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { LeadActivity } from '@/types/lead'

interface ReminderProps {
  activities: LeadActivity[]
}

export function LeadReminders({ activities }: ReminderProps) {
  const [upcomingActivities, setUpcomingActivities] = useState<LeadActivity[]>([])

  useEffect(() => {
    const upcoming = activities.filter(activity => 
      activity.dueDate && new Date(activity.dueDate) > new Date() && !activity.completed
    ).sort((a, b) => 
      new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime()
    )
    setUpcomingActivities(upcoming)
  }, [activities])

  if (!upcomingActivities.length) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Upcoming Activities
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {upcomingActivities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">
                {activity.type}
              </Badge>
              <div className="flex-1">
                <p>{activity.description}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Due {formatDistanceToNow(new Date(activity.dueDate!), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
