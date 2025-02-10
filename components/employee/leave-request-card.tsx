import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LeaveRequest } from "@prisma/client"
import { useEffect, useState } from "react"
import { Badge } from "../ui/badge"

interface LeaveRequestCardProps {
  employeeId: string
}

export function LeaveRequestCard({ employeeId }: LeaveRequestCardProps) {
  const [requests, setRequests] = useState<LeaveRequest[]>([])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leave Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {requests.map(request => (
            <div key={request.id} className="flex justify-between items-center">
              <div>
                <p className="font-medium">{request.type}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(request.startDate).toLocaleDateString()} - 
                  {new Date(request.endDate).toLocaleDateString()}
                </p>
              </div>
              <Badge>{request.status}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
