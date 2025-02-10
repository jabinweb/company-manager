'use client'

import { useSession } from "@/hooks/use-session"
import { AnnouncementsCard } from "@/components/employee/announcements-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function AnnouncementsPage() {
  const { data: session } = useSession()

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Company Announcements</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>All Announcements</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <AnnouncementsCard companyId={session?.user?.employeeCompanyId || 0} />
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
