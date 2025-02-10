'use client'

import { useSession } from "@/hooks/use-session"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PayslipCard } from "@/components/employee/payslip-card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Download } from "lucide-react"

export default function PayslipsPage() {
  const { data: session } = useSession()

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">My Payslips</h1>
      
      <div className="grid gap-6">
        <PayslipCard employeeId={session?.user?.employeeId || ''} />

        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Add payment history details */}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
