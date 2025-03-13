'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useQuery } from "@tanstack/react-query"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { LeadStatus } from "@prisma/client"

const COLORS = {
  NEW: '#60a5fa',
  CONTACTED: '#818cf8',
  QUALIFIED: '#34d399',
  PROPOSAL: '#fbbf24',
  NEGOTIATION: '#f97316',
  WON: '#22c55e',
  LOST: '#ef4444',
  ON_HOLD: '#94a3b8'
}

export function LeadStatusDistribution() {
  const { data, isLoading } = useQuery({
    queryKey: ['leadStatusDistribution'],
    queryFn: async () => {
      const response = await fetch('/api/employee/leads/status-distribution')
      if (!response.ok) throw new Error('Failed to fetch status distribution')
      return response.json()
    }
  })

  if (isLoading || !data) return null

  const chartData = Object.entries(data).map(([status, count]) => ({
    name: status.toLowerCase().replace('_', ' '),
    value: count,
    color: COLORS[status as LeadStatus]
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lead Status Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
