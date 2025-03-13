'use client'

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DollarSign, Download } from "lucide-react"

interface PayrollData {
  currentMonth: {
    basicSalary: number
    deductions: number
    additions: number
    netSalary: number
  }
  lastPayslip?: {
    id: string
    month: number
    year: number
    netSalary: number
    isPaid: boolean
    paidAt?: string
  }
}

export function PayrollSummary() {
  const [payrollData, setPayrollData] = useState<PayrollData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchPayroll() {
      try {
        const response = await fetch('/api/employee/payroll')
        if (response.ok) {
          const data = await response.json()
          setPayrollData(data)
        }
      } catch (error) {
        console.error('Failed to fetch payroll:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPayroll()
  }, [])

  if (isLoading) {
    return <Card><CardContent>Loading payroll data...</CardContent></Card>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Payroll Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Current Month</p>
          <div className="text-2xl font-bold">
            ${payrollData?.currentMonth.netSalary.toFixed(2)}
          </div>
          <div className="text-sm text-muted-foreground">
            Basic: ${payrollData?.currentMonth.basicSalary.toFixed(2)}
            <br />
            Deductions: -${payrollData?.currentMonth.deductions.toFixed(2)}
            <br />
            Additions: +${payrollData?.currentMonth.additions.toFixed(2)}
          </div>
        </div>

        {payrollData?.lastPayslip && (
          <div>
            <p className="text-sm text-muted-foreground mb-2">Last Payslip</p>
            <Button variant="outline" className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Download Payslip
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
