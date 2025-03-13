'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useQuery } from "@tanstack/react-query"
import { BarChart, Cell, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const COLORS = {
  LOW: '#60a5fa',
  MEDIUM: '#fbbf24',
  HIGH: '#f97316',
  URGENT: '#ef4444'
}

export function LeadPriorityChart() {
  const { data, isLoading } = useQuery({
    queryKey: ['leadPriorityDistribution'],
    queryFn: async () => {
      const response = await fetch('/api/employee/leads/priority-distribution')
      if (!response.ok) throw new Error('Failed to fetch priority distribution')
      return response.json()
    }
  })

  if (isLoading || !data) return null

  const chartData = Object.entries(data).map(([priority, count]) => ({
    name: priority.toLowerCase(),
    count: count,
    color: COLORS[priority as keyof typeof COLORS]
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leads by Priority</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count">
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
