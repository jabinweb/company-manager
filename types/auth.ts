// Remove Prisma imports and define our own types
export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'USER' | 'EMPLOYEE'
export type UserStatus = 'PENDING' | 'ACTIVE' | 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'DELETED'

export interface User {
  id: number
  email: string
  name: string
  role: UserRole
  status: UserStatus
  isValid: boolean
  companyId?: number
  currentCompanyId?: number
  currentCompanyName?: string
  primaryCompanyId?: number
  primaryCompanyName?: string
  employeeId?: string
  managedCompanyId?: number
  managedCompanyName?: string
  employeeCompanyId?: number
  employeeCompanyName?: string
  avatar?: string
  userCompanies: Array<{
    id: number
    name: string
    status: string
  }>
  userCompanyRoles: Array<{
    role: string
    companyId: number
    companyName: string
  }>
}

export interface JWTPayload {
  id: number
  email: string
  role: UserRole
  name: string
  sessionId: string
  status: UserStatus
  primaryCompanyId?: number
  primaryCompanyName?: string
  managedCompanyId?: number
  managedCompanyName?: string
  companyId?: number
  companyName?: string
  employeeId?: string
  employeeCompanyId?: number
  employeeCompanyName?: string
  currentCompanyId?: number
  currentCompanyName?: string
  isValid: boolean
  userCompanies: Array<{
    id: number
    name: string
    status: string
  }>
  userCompanyRoles: Array<{
    role: string
    companyId: number
    companyName: string
  }>
}

export interface Session {
  user: User
  expires: string
}
