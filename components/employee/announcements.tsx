'use client'

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell } from "lucide-react"

interface Announcement {
  id: string
  title: string
  content: string
  priority: number // 0-low, 1-medium, 2-high
  createdAt: string
}

export function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        const response = await fetch('/api/employee/announcements')
        if (response.ok) {
          const data = await response.json()
          setAnnouncements(data.announcements)
        }
      } catch (error) {
        console.error('Failed to fetch announcements:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnnouncements()
  }, [])

  if (isLoading) {
    return <Card><CardContent>Loading announcements...</CardContent></Card>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Announcements
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {announcements.length === 0 ? (
          <p className="text-center text-muted-foreground">No announcements</p>
        ) : (
          announcements.map((announcement) => (
            <div
              key={announcement.id}
              className="space-y-2 p-4 border rounded-lg"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{announcement.title}</h3>
                <Badge
                  variant={
                    announcement.priority === 2 ? 'destructive' :
                    announcement.priority === 1 ? 'secondary' : 'outline'
                  }
                >
                  {announcement.priority === 2 ? 'High' :
                   announcement.priority === 1 ? 'Medium' : 'Low'} Priority
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {announcement.content}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(announcement.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
