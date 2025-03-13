'use client'

import { useState } from 'react'
import { addDays } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmployeeTasks } from '@/components/employee/employee-tasks'
import { LeadActivityList } from '@/components/employee/lead/lead-activity-list'
import { KeyMetrics } from '@/components/dashboard/key-metrics'
import { SalesPipeline } from '@/components/dashboard/sales-pipeline'
import { DateRangePicker } from '@/components/dashboard/date-range-picker'
import { useQuery } from '@tanstack/react-query'
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@/components/ui/alert"
import { Button } from '@/components/ui/button'
import { CalendarDays, AlertCircle } from 'lucide-react'
import type { DashboardStats } from '@/types/dashboard'

export default function EmployeeDashboard() {
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [endDate, setEndDate] = useState<Date>(addDays(new Date(), 30))

  const { data: stats, isLoading: isStatsLoading } = useQuery<DashboardStats>({
    queryKey: ['employeeStats', { startDate, endDate }],
    queryFn: async () => {
      const res = await fetch(`/api/employee/dashboard/stats?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`)
      if (!res.ok) throw new Error('Failed to fetch stats')
      return res.json()
    }
  })

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header Section */}
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
        </div>
      </div>

      {/* Alerts Section */}
      {stats?.overdueTasks && stats.overdueTasks > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Attention Required</AlertTitle>
          <AlertDescription>
            You have {stats.overdueTasks} overdue tasks that need immediate attention.
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Actions */}
      <div className="flex gap-4">
        <Button>
          <CalendarDays className="mr-2 h-4 w-4" />
          Schedule Follow-up
        </Button>
        {/* Add more quick actions */}
      </div>

      {/* Stats Overview */}
      <KeyMetrics isLoading={isStatsLoading} data={stats} />

      {/* Main Content Grid */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
        {/* Left side - Charts */}
        <div className="lg:col-span-4 space-y-4">
          <SalesPipeline />
          <Card>
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              {stats && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Monthly Target</span>
                    <span>{stats.monthlyTarget}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Current Progress</span>
                    <span>{stats.targetProgress}%</span>
                  </div>
                  {/* Add progress bar */}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right side - Tasks & Activities */}
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Today&apos;s Priority</CardTitle>
            </CardHeader>
            <CardContent>
              <EmployeeTasks 
                limit={5}
                showOnlyToday={true}
                priority="HIGH"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <LeadActivityList limit={5} showTimeline />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Detailed Tabs */}
      {/* <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="leads">
            Leads ({stats?.totalLeads?.toString() || '0'})
          </TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="tasks">
            Tasks ({stats?.pendingTasks?.toString() || '0'})
          </TabsTrigger>
          <TabsTrigger value="follow-ups">
            Follow-ups ({stats?.pendingFollowUps?.toString() || '0'})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <LeadActivityList limit={10} />
            <EmployeeTasks limit={10} />
          </div>
        </TabsContent>

        <TabsContent value="leads">
          <Card>
            <CardContent className="py-4">
              <EmployeeLeadTable 
                pageSize={10}
                showPagination={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities">
          <Card>
            <CardContent className="py-4">
              <LeadActivityList limit={10} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks">
          <Card>
            <CardContent className="py-4">
              <EmployeeTasks limit={10} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs> */}
    </div>
  )
}