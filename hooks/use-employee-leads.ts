import { useQuery } from '@tanstack/react-query'
import { LeadStatus, Priority } from '@prisma/client'
import type { LeadTableItem } from '@/app/dashboard/leads/columns'

interface UseEmployeeLeadsParams {
  employeeId?: string
  status?: LeadStatus[]
  priority?: Priority[]
}

export function useEmployeeLeads({ employeeId, status, priority }: UseEmployeeLeadsParams) {
  return useQuery<LeadTableItem[]>({
    queryKey: ['employee-leads', employeeId, status, priority],
    queryFn: async () => {
      if (!employeeId) return []
      
      const params = new URLSearchParams()
      status?.forEach(s => params.append('status', s))
      priority?.forEach(p => params.append('priority', p))

      const response = await fetch(`/api/employee/leads?${params}`)
      if (!response.ok) throw new Error('Failed to fetch leads')
      
      const data = await response.json()
      return data
    },
    enabled: !!employeeId
  })
}
