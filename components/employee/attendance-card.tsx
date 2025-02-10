'use client'

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, Timer } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function AttendanceCard() {
  const [isClockedIn, setIsClockedIn] = useState(false)
  const [clockInTime, setClockInTime] = useState<Date | null>(null)
  const { toast } = useToast()

  const handleClockInOut = async () => {
    try {
      const response = await fetch('/api/employee/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: isClockedIn ? 'clockOut' : 'clockIn',
          time: new Date(),
        }),
      })

      if (!response.ok) throw new Error('Failed to update attendance')

      if (isClockedIn) {
        setClockInTime(null)
        toast({ title: "Clocked out successfully" })
      } else {
        setClockInTime(new Date())
        toast({ title: "Clocked in successfully" })
      }
      
      setIsClockedIn(!isClockedIn)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update attendance"
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Timer className="h-5 w-5" />
          Today&apos;s Attendance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center space-y-4">
          <div className="text-3xl font-bold">
            {clockInTime ? (
              <span>{clockInTime.toLocaleTimeString()}</span>
            ) : (
              <span>Not Clocked In</span>
            )}
          </div>
          <Button 
            size="lg" 
            onClick={handleClockInOut}
            variant={isClockedIn ? "destructive" : "default"}
          >
            <Clock className="mr-2 h-4 w-4" />
            {isClockedIn ? 'Clock Out' : 'Clock In'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
