'use client'

import { useSession } from "@/hooks/use-session"
import { Card } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { toast } from "@/hooks/use-toast"

interface EmployeeData {
  id: string
  name: string
  jobTitle: string
  department: string
  status: string
  employmentType: string
  // ... other fields you want to display
}

export default function EmployeeDashboard() {
  const { data: session } = useSession()
  const [employeeData, setEmployeeData] = useState<EmployeeData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchEmployeeData() {
      try {
        const response = await fetch(`/api/employees/me`)
        if (!response.ok) throw new Error('Failed to fetch employee data')
        
        const data = await response.json()
        setEmployeeData(data)
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load employee data"
        })
      } finally {
        setLoading(false)
      }
    }

    if (session?.user?.employeeId) {
      fetchEmployeeData()
    }
  }, [session])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Employee Dashboard</h1>
      
      {/* Employee Overview */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">My Profile</h2>
        {employeeData && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">{employeeData.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Job Title</p>
              <p className="font-medium">{employeeData.jobTitle}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Department</p>
              <p className="font-medium">{employeeData.department}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="font-medium">{employeeData.status}</p>
            </div>
          </div>
        )}
      </Card>

      {/* Add more sections like:
          - Time Clock
          - Leave Requests
          - Recent Attendance
          - Tasks
          - Announcements
      */}
    </div>
  )
}
