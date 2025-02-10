'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Loader2 } from "lucide-react"
import { AttendanceStatus } from "@prisma/client"

interface Attendance {
  id: string
  date: string
  clockIn: string | null
  clockOut: string | null
  status: AttendanceStatus
  notes: string | null
}

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [date, setDate] = useState<Date>(new Date())

  useEffect(() => {
    fetchAttendance()
  }, [])

  const fetchAttendance = async () => {
    try {
      const response = await fetch('/api/employee/attendance')
      if (!response.ok) throw new Error('Failed to fetch attendance')
      const data = await response.json()
      setAttendance(data)
      const today = data.find((a: Attendance) => 
        new Date(a.date).toDateString() === new Date().toDateString()
      )
      setIsCheckedIn(!!today?.clockIn && !today?.clockOut)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleClockInOut = async () => {
    try {
      const response = await fetch('/api/employee/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: isCheckedIn ? 'clockOut' : 'clockIn' })
      })
      if (!response.ok) throw new Error('Failed to update attendance')
      await fetchAttendance()
    } catch (error) {
      console.error(error)
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Attendance</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Time Clock</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <div className="text-4xl font-bold">
              {new Date().toLocaleTimeString()}
            </div>
            <Button 
              size="lg" 
              onClick={handleClockInOut}
              className="w-full max-w-xs"
            >
              <Clock className="mr-2 h-4 w-4" />
              {isCheckedIn ? 'Clock Out' : 'Clock In'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => date && setDate(date)}
              className="rounded-md border"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
