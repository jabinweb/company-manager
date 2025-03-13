'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useQuery } from "@tanstack/react-query"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

const COLORS = {
  NEW: '#0ea5e9',
  CONTACTED: '#84cc16',
  QUALIFIED: '#eab308',
  PROPOSAL: '#f97316',
  NEGOTIATION: '#ec4899',
  WON: '#22c55e',
  LOST: '#ef4444',
  ON_HOLD: '#71717a'
}

export function LeadStatusChart() {
  const { data } = useQuery({
    queryKey: ['leadStatusDistribution'],
    queryFn: async () => {
      const res = await fetch('/api/employee/leads/status-distribution')
      if (!res.ok) throw new Error('Failed to fetch status distribution')
      return res.json()
    }
  })

  const chartData = data ? Object.entries(data).map(([name, value]) => ({
    name,
    value
  })) : []

  return (
    <Card className="col-span-1">
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
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                label
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
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
