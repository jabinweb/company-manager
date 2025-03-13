'use client'

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { CalendarPlus } from "lucide-react"

interface LeaveRequestDialogProps {
  onSuccess: () => void
}

export function LeaveRequestDialog({ onSuccess }: LeaveRequestDialogProps) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!startDate || !endDate || !reason) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/employee/leave-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          reason,
          type: 'ANNUAL' // You might want to make this selectable
        })
      })

      if (!response.ok) throw new Error('Failed to submit request')
      
      toast({
        title: "Success",
        description: "Leave request submitted successfully",
      })
      setStartDate('')
      setEndDate('')
      setReason('')
      onSuccess()
    } catch (error) {
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
    <Card className="w-full bg-[#e4c1f9] p-4">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-bold">Create Leave Request</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-[#F42C04] font-bold text-center">{error}</p>
          )}
          
          <div className="flex flex-col space-y-4 items-center">
            <div className="flex gap-4 w-full justify-center">
              <div className="flex flex-col">
                <label className="font-bold mb-1">From:</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="rounded-[5px]"
                />
              </div>
              <div className="flex flex-col">
                <label className="font-bold mb-1">To:</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="rounded-[5px]"
                />
              </div>
            </div>

            <Textarea
              placeholder="Describe your reason..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full h-[120px] resize-none rounded-[5px] p-2"
            />

            <Button 
              type="submit" 
              disabled={loading}
              className="bg-[#fb5607] hover:bg-[#fb5607]/90 text-white font-bold"
            >
              {loading ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
