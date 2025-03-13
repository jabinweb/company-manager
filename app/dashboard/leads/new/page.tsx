'use client'

import { LeadForm } from "@/components/leads/lead-form"
import { useSession } from "@/hooks/use-session"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import type { LeadFormValues } from "@/lib/validations/lead"

export default function NewLeadPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: LeadFormValues) => {
    if (!session?.user?.employeeId) {
      toast({
        title: "Error",
        description: "You must be logged in as an employee to create leads",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          employeeId: session.user.employeeId
        })
      })

      if (!response.ok) throw new Error('Failed to create lead')

      toast({
        title: "Success",
        description: "Lead created successfully"
      })

      router.push('/dashboard/leads')
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create lead",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <LeadForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  )
}
