import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { FileDown } from "lucide-react"

interface PayslipCardProps {
  employeeId: string
}

interface Payslip {
  id: string
  month: number
  year: number
  basicSalary: number
  deductions: number
  additions: number
  netSalary: number
  isPaid: boolean
  paidAt: string | null
}

export function PayslipCard({ employeeId }: PayslipCardProps) {
  const [payslips, setPayslips] = useState<Payslip[]>([])
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())
  const [loading, setLoading] = useState(true)

  const fetchPayslips = useCallback(async () => {
    try {
      const response = await fetch(`/api/employee/payslips?year=${selectedYear}&employeeId=${employeeId}`)
      if (!response.ok) throw new Error('Failed to fetch payslips')
      const data = await response.json()
      setPayslips(data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedYear, employeeId])

  useEffect(() => {
    fetchPayslips()
  }, [fetchPayslips])

  const getMonthName = (month: number) => {
    return new Date(0, month - 1).toLocaleString('default', { month: 'long' })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const years = Array.from(
    { length: 5 },
    (_, i) => (new Date().getFullYear() - i).toString()
  )

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Payslips</CardTitle>
        <Select 
          value={selectedYear} 
          onValueChange={setSelectedYear}
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year}>{year}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          {loading ? (
            <div className="flex items-center justify-center h-[200px] text-muted-foreground">
              Loading payslips...
            </div>
          ) : payslips.length === 0 ? (
            <div className="flex items-center justify-center h-[200px] text-muted-foreground">
              No payslips found for {selectedYear}
            </div>
          ) : (
            <div className="space-y-4">
              {payslips.map((payslip) => (
                <div
                  key={payslip.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <p className="font-medium">
                      {getMonthName(payslip.month)} {payslip.year}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Basic: {formatCurrency(payslip.basicSalary)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Net: {formatCurrency(payslip.netSalary)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {payslip.isPaid ? 
                        `Paid on ${new Date(payslip.paidAt!).toLocaleDateString()}` : 
                        'Pending'
                      }
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`/api/employee/payslips/${payslip.id}/download`, '_blank')}
                  >
                    <FileDown className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}