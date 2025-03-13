'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useQuery } from "@tanstack/react-query"
import { Calendar, Clock, Phone, Mail } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"

export function UpcomingActions() {
  const { data: actions } = useQuery({
    queryKey: ['upcomingActions'],
    queryFn: async () => {
      const res = await fetch('/api/employee/actions/upcoming')
      if (!res.ok) throw new Error('Failed to fetch upcoming actions')
      return res.json()
    }
  })

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'CALL': return <Phone className="h-4 w-4" />
      case 'EMAIL': return <Mail className="h-4 w-4" />
      case 'MEETING': return <Calendar className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {actions?.map((action: any) => (
            <div key={action.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-muted rounded-full">
                  {getActionIcon(action.type)}
                </div>
                <div>
                  <p className="font-medium">{action.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(action.dueDate), 'MMM d, h:mm a')}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">Complete</Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
