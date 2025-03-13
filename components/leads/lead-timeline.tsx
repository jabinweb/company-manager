import { LeadActivity } from '@/types/lead'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'

interface LeadTimelineProps {
  activities: LeadActivity[]
}

export function LeadTimeline({ activities }: LeadTimelineProps) {
  if (!activities?.length) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">No activities yet</p>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="space-y-8">
        {activities.map((activity) => (
          <div key={activity.id} className="flex gap-4">
            <Avatar className="h-8 w-8">
              <AvatarImage src={activity.employee.avatar || ''} />
              <AvatarFallback>{activity.employee.name.charAt(0)}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{activity.employee.name}</p>
                <time className="text-xs text-muted-foreground">
                  {formatDate(activity.createdAt)}
                </time>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {activity.type.toLowerCase().replace('_', ' ')}
                </Badge>
                {activity.dueDate && (
                  <Badge variant={activity.completed ? 'default' : 'destructive'}>
                    {activity.completed ? 'Completed' : 'Due'} {formatDate(activity.dueDate)}
                  </Badge>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground">
                {activity.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
