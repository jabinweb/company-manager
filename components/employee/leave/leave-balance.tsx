'use client'

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, CalendarDays } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { LeaveRequestForm } from "./leave-request-form"

interface LeaveBalance {
  type: string
  total: number
  used: number
  remaining: number
}

export function LeaveBalance() {
  const [balances, setBalances] = useState<LeaveBalance[]>([
    { type: "Annual", total: 20, used: 5, remaining: 15 },
    { type: "Sick", total: 10, used: 2, remaining: 8 },
  ])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Leave Balance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          {balances.map((balance) => (
            <div key={balance.type} className="flex justify-between items-center">
              <div>
                <p className="font-medium">{balance.type} Leave</p>
                <p className="text-sm text-muted-foreground">
                  {balance.used} used of {balance.total}
                </p>
              </div>
              <div className="text-2xl font-bold">{balance.remaining}</div>
            </div>
          ))}
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full">
              <CalendarDays className="mr-2 h-4 w-4" />
              Request Leave
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Leave</DialogTitle>
            </DialogHeader>
            <LeaveRequestForm />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
