export type NotificationType = 
  | 'LEAVE_REQUEST'
  | 'LEAVE_APPROVED'
  | 'LEAVE_REJECTED'
  | 'ATTENDANCE'
  | 'PAYROLL'
  | 'TASK_ASSIGNED'
  | 'TASK_COMPLETED'
  | 'DOCUMENT_UPLOADED'
  | 'PERFORMANCE_REVIEW'
  | 'GENERAL'
  | 'NEW_MESSAGE';    // Add this new type

export interface Notification {
  id: string
  title: string
  message: string
  type: NotificationType
  targetRole: string[]
  targetUserId?: string | null
  read: boolean
  metadata?: Record<string, any> | null
  createdAt: Date
  expiresAt: Date
  companyId?: number | null
}