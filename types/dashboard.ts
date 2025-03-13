export interface DashboardStats {
  // Lead Metrics
  totalLeads: number
  newLeadsThisWeek: number
  activeLeads: number
  convertedLeads: number
  conversionRate: number
  leadsChange: number          // Added for lead growth rate
  conversionChange: number     // Added for conversion rate change
  
  // Task Metrics
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  overdueTasks: number
  taskCompletionRate: number
  
  // Follow-up Metrics
  pendingFollowUps: number
  todayFollowUps: number
  
  // Activity Metrics
  recentActivities: number
  weeklyActivities: number
  
  // Performance Metrics
  performanceScore: number
  monthlyTarget: number
  targetProgress: number
}

// Add enums and utility types if needed
export type TimeRange = 'day' | 'week' | 'month' | 'quarter' | 'year'

export interface MetricChange {
  current: number
  previous: number
  change: number
}
