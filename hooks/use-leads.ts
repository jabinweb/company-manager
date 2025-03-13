import { useQuery } from '@tanstack/react-query'
import type { LeadResponse, LeadStatus, Priority } from '@/types/lead'

interface UseLeadsParams {
  status?: LeadStatus[]
  priority?: Priority[]
  search?: string
  page?: number
  limit?: number
  enabled?: boolean
}

export function useLeads(params: UseLeadsParams = {}) {
  const queryString = new URLSearchParams()
  
  if (params.status?.length) {
    params.status.forEach(status => queryString.append('status', status))
  }
  if (params.priority?.length) {
    params.priority.forEach(priority => queryString.append('priority', priority))
  }
  if (params.search) {
    queryString.append('query', params.search)
  }
  if (params.page) {
    queryString.append('page', params.page.toString())
  }
  if (params.limit) {
    queryString.append('limit', params.limit.toString())
  }

  return useQuery({
    queryKey: ['leads', params],
    queryFn: async () => {
      const response = await fetch(`/api/leads?${queryString}`)
      if (!response.ok) {
        throw new Error('Failed to fetch leads')
      }
      return response.json()
    },
    refetchOnWindowFocus: false,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes (replaced cacheTime)
    retry: 1,
  })
}
