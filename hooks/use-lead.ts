import { useQuery } from '@tanstack/react-query'
import { Lead } from '@/types/lead'

export function useLead(id: string) {
  return useQuery<Lead>({
    queryKey: ['lead', id],
    queryFn: async () => {
      const response = await fetch(`/api/leads/${id}`)
      if (!response.ok) throw new Error('Failed to fetch lead')
      return response.json()
    }
  })
}
