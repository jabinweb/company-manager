'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { useSession } from "@/hooks/use-session"
import { toast } from "@/hooks/use-toast"
import { DateRangePicker } from "@/components/dashboard/date-range-picker"

interface LeaveRequest {
  id: string
  startDate: string
  endDate: string
  type: string
  reason: string
  status: string
  createdAt: string
}

export default function LeavePage() {
  const { data: session } = useSession()
  const [requests, setRequests] = useState<LeaveRequest[]>([])
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchLeaveRequests()
  }, [])

  const fetchLeaveRequests = async () => {
    try {
      const response = await fetch('/api/employee/leave-requests')
      if (!response.ok) throw new Error('Failed to fetch requests')
      const data = await response.json()
      setRequests(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not load leave requests",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!startDate || !endDate || !reason) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/employee/leave-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate,
          endDate,
          reason,
          type: 'ANNUAL'
        })
      })

      if (!response.ok) throw new Error()

      toast({
        title: "Success",
        description: "Leave request submitted successfully",
      })
      setStartDate(undefined)
      setEndDate(undefined)
      setReason("")
      fetchLeaveRequests()
    } catch {
      toast({
        title: "Error",
        description: "Failed to submit leave request",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* <h1 className="text-3xl font-bold mb-6">Leave Management</h1> */}
      
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="lg:sticky lg:top-6">
          <CardHeader>
            <CardTitle>Create Leave Request</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
              />

              <div className="space-y-2">
                <label className="text-sm font-medium">Reason for Leave</label>
                <Textarea
                  placeholder="Please describe your reason for requesting leave..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Submitting..." : "Submit Leave Request"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Leave Request History</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[380px] pr-4">
              <div className="space-y-4">
                {requests.map((request) => (
                  <div key={request.id} className="p-4 border rounded-lg space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">
                          {new Date(request.startDate).toLocaleDateString()} - {' '}
                          {new Date(request.endDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-muted-foreground">{request.reason}</p>
                      </div>
                      <Badge
                        variant={
                          request.status === 'APPROVED' ? 'default' :
                          request.status === 'REJECTED' ? 'destructive' :
                          'secondary'
                        }
                      >
                        {request.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Requested on: {new Date(request.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
                {requests.length === 0 && (
                  <p className="text-center text-muted-foreground">
                    No leave requests found
                  </p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
