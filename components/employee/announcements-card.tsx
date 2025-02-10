import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Bell } from "lucide-react"

interface Announcement {
  id: string
  title: string
  content: string
  priority: number
  createdAt: string
}

interface AnnouncementsCardProps {
  companyId: number
}

export function AnnouncementsCard({ companyId }: AnnouncementsCardProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchAnnouncements = useCallback(async () => {
    try {
      const response = await fetch(`/api/employee/announcements?companyId=${companyId}`)
      if (!response.ok) throw new Error('Failed to fetch announcements')
      const data = await response.json()
      setAnnouncements(data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }, [companyId])

  useEffect(() => {
    fetchAnnouncements()
  }, [fetchAnnouncements])

  const getPriorityBadge = (priority: number) => {
    const variants = {
      0: 'secondary',
      1: 'default',
      2: 'destructive'
    }
    return variants[priority as keyof typeof variants] as "default" | "destructive" | "outline" | "secondary"
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center space-x-2">
        <Bell className="h-5 w-5" />
        <CardTitle>Announcements</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Loading announcements...
            </div>
          ) : announcements.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No announcements found
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{announcement.title}</h3>
                    <Badge variant={getPriorityBadge(announcement.priority)}>
                      Priority {announcement.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {announcement.content}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(announcement.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}