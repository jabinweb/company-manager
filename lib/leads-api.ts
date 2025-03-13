import { useLeadsStore } from '@/stores/leads-store'
import { queryClient } from './lead/query-client'

export const STALE_TIME = 30 * 1000 // 30 seconds
export const CACHE_TIME = 5 * 60 * 1000 // 5 minutes

export const prefetchLeadsData = async (tab: string, params = {}) => {
  const queryKey = ['leads', tab, params]
  
  return queryClient.prefetchQuery({
    queryKey,
    queryFn: async () => {
      const searchParams = new URLSearchParams(params as Record<string, string>)
      const response = await fetch(`/api/employee/leads?tab=${tab}&${searchParams}`)
      if (!response.ok) throw new Error('Failed to fetch leads')
      const data = await response.json()
      
      // Update store with new data
      useLeadsStore.getState().setLeads(tab, data.data)
      return data
    },
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME
  })
}

export const fetchLeadsForTab = async (tab: string) => {
  const store = useLeadsStore.getState()
  
  // Return cached data if available
  if (store.leads[tab]?.length > 0) {
    return store.leads[tab]
  }

  // Fetch fresh data
  store.setLoading(true)
  try {
    const data = await prefetchLeadsData(tab)
    return data
  } finally {
    store.setLoading(false)
  }
}
