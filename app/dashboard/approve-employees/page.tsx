'use client'

import { useEffect, useState } from "react"
import { useSession } from "@/hooks/use-session"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"

interface Employee {
  id: number
  name: string
  email: string
  company: {
    name: string
  }
}

export default function ApproveEmployeesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") return
    
    // Check both session and user role
    if (!session?.user?.role || session.user.role !== "ADMIN") {
      router.push('/login')
      return
    }

    fetchPendingEmployees()
  }, [status, session, router])

  const fetchPendingEmployees = async () => {
    try {
      const response = await fetch('/api/pending/employee')
      const data = await response.json()
      setEmployees(data.employees)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch pending employees",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const approveEmployee = async (id: number, email: string, name: string) => {
    try {
      const response = await fetch(`/api/admin/approve-employee`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, email, name }),
      })
      if (!response.ok) throw new Error('Failed to approve employee')
      setEmployees(prev => prev.filter(emp => emp.id !== id))
      toast({ title: "Employee approved and email sent" })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to approve employee",
      })
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Approve Employees</h1>
      {employees.length === 0 ? (
        <p>No pending employees.</p>
      ) : (
        <ul>
          {employees.map(emp => (
            <li key={emp.id} className="flex justify-between items-center mb-2">
              <div>
                <p>{emp.name} - {emp.email}</p>
                <p>Company: {emp.company.name}</p>
              </div>
              <Button onClick={() => approveEmployee(emp.id, emp.email, emp.name)}>
                Approve
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}