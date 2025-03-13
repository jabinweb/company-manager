import { LeadStatus, Priority, ActivityType } from "@prisma/client"

// Re-export prisma enums
export { LeadStatus, Priority, ActivityType }

// Base types for consistent employee data
interface EmployeeBase {
  id: string
  name: string
  avatar: string | null
}

interface EmployeeWithEmail extends EmployeeBase {
  email: string
}

// Activity related types
export interface LeadActivity {
  id: string
  type: ActivityType
  description: string
  employeeId: string
  dueDate?: Date | null
  completed: boolean
  createdAt: Date
  updatedAt: Date
  employee: EmployeeBase
}

// Document related types
export interface LeadDocument {
  id: string
  name: string
  type: string
  url: string
  employeeId: string
  createdAt: Date
  updatedAt: Date
  uploadedBy: EmployeeBase
}

// Lead types
export interface Lead {
  id: string
  title: string
  status: LeadStatus
  source: string
  value: number | null
  priority: Priority
  employeeId: string
  assignedTo: EmployeeWithEmail
  contactName: string
  email: string | null
  phone: string | null
  website: string | null
  createdAt: Date
  updatedAt: Date
  lastContactedAt: Date | null
  nextFollowUp: Date | null
  convertedAt: Date | null
  description: string | null
  requirements: string | null
  notes: string | null
  tags: string[]
  convertedClientId: string | null
  companyId: number
}

// Response type for API
export interface LeadResponse extends Omit<Lead, 'assignedTo'> {
  assignedTo: EmployeeBase
  _count: {
    activities: number
    documents: number
  }
  activities?: LeadActivity[]
  documents?: LeadDocument[]
}

// Table display type
export interface LeadTableItem {
  id: string
  title: string
  contactName: string
  email: string
  status: LeadStatus
  priority: Priority
  value: number | null
  lastContactedAt: Date | null
  assignedTo: EmployeeBase
  _count: {
    activities: number
  }
}

// Form data type
export interface LeadFormData {
  title: string
  contactName: string
  email?: string
  phone?: string
  website?: string
  status: LeadStatus
  priority: Priority
  value?: number
  source: string
  employeeId: string
  description?: string
  requirements?: string
  notes?: string
  tags?: string[]
}
