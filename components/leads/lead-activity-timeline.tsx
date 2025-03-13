'use client'

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { ActivityType } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

export function LeadActivityTimeline() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['leadActivities'],
    queryFn: async () => {
      const response = await fetch('/api/employee/leads/activities')
      if (!response.ok) throw new Error('Failed to fetch activities')
      return response.json()
    }
  })

  if (isLoading || !data) return null

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Activities</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.activities.map((activity: any) => (
            <div key={activity.id} className="flex items-start gap-4">
              <Badge variant="outline">{activity.type}</Badge>
              <div className="flex-1">
                <p className="text-sm">{activity.description}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
