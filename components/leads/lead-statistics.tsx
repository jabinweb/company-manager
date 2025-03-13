'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { Award, Target, Users } from 'lucide-react'

export function LeadStatistics() {
  const { data, isLoading } = useQuery({
    queryKey: ['leadStats'],
    queryFn: async () => {
      const response = await fetch('/api/employee/leads/statistics')
      if (!response.ok) throw new Error('Failed to fetch statistics')
      return response.json()
    }
  })

  if (isLoading || !data) return null

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Leads</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.activeLeads}</div>
          <p className="text-xs text-muted-foreground">
            {data.upcomingFollowUps.length} follow-ups pending
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Won Leads</CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.wonLeads}</div>
          <p className="text-xs text-muted-foreground">
            {data.conversionRate.toFixed(1)}% conversion rate
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD'
            }).format(data.totalValue || 0)}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
