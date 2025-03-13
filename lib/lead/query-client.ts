import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      gcTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export const prefetchLeadQueries = async (employeeId: string) => {
  // Prefetch common queries
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ['leads', { employeeId }],
      staleTime: 1000 * 30
    }),
    queryClient.prefetchQuery({
      queryKey: ['leadStats', { employeeId }],
      staleTime: 1000 * 60
    }),
    queryClient.prefetchQuery({
      queryKey: ['leadActivities', { employeeId }],
      staleTime: 1000 * 30
    })
  ])
}
