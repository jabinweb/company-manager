import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ClockIcon, CalendarDays, FileText, CheckSquare } from "lucide-react"

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <Button variant="outline" className="flex flex-col items-center justify-center h-24">
          <ClockIcon className="h-6 w-6 mb-2" />
          Clock In/Out
        </Button>
        <Button variant="outline" className="flex flex-col items-center justify-center h-24">
          <CalendarDays className="h-6 w-6 mb-2" />
          Request Leave
        </Button>
        <Button variant="outline" className="flex flex-col items-center justify-center h-24">
          <FileText className="h-6 w-6 mb-2" />
          View Payslip
        </Button>
        <Button variant="outline" className="flex flex-col items-center justify-center h-24">
          <CheckSquare className="h-6 w-6 mb-2" />
          My Tasks
        </Button>
      </CardContent>
    </Card>
  )
}
