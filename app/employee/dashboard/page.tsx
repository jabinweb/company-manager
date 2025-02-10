'use client'

import { useSession } from "@/hooks/use-session"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { ProfileCard } from "@/components/employee/profile-card"
import { QuickActions } from "@/components/employee/quick-actions"
import { EmployeeTasks } from "@/components/employee/employee-tasks"
import { AnnouncementsCard } from "@/components/employee/announcements-card"

interface EmployeeData {
  id: string;
  name: string;
  email: string;
  phone: string;
  jobTitle: string;
  department: string;
  dateJoined: string;
  role: string;
  employmentType: string;
  status: string;
  avatar?: string;
  company: {
    id: number;
    name: string;
    status: string;
  };
}

export default function EmployeeDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [employeeData, setEmployeeData] = useState<EmployeeData | null>(null)

  useEffect(() => {
    if (status === "loading") return
    if (status === "authenticated") {
      fetchEmployeeData()
    }
  }, [status, router])

  const fetchEmployeeData = async () => {
    try {
      const response = await fetch('/api/employee/profile')
      if (!response.ok) {
        throw new Error('Failed to fetch employee data')
      }
      const data = await response.json()
      setEmployeeData(data)
    } catch (error) {
      console.error('Failed to fetch employee data:', error)
    }
  }

  if (status === "loading" || !employeeData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Welcome, {employeeData.name}</h1>
      
      {/* Top Row - Profile and Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <ProfileCard 
          name={employeeData.name}
          email={employeeData.email}
          department={employeeData.department}
          jobTitle={employeeData.jobTitle}
          status={employeeData.status}
          companyName={employeeData.company.name}
          avatar={employeeData.avatar}
        />
        <QuickActions />
      </div>

      {/* Middle Row - Recent Tasks and Leave Requests */}
      <div className="grid gap-6 md:grid-cols-2">
        <EmployeeTasks employeeId={employeeData.id} />
        <AnnouncementsCard companyId={employeeData.company.id} />
      </div>

    </div>
  )
}