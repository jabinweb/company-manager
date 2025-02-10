import type { JWTPayload } from 'jose'
import type { UserRole, UserStatus } from '@/types/auth'

export const JWT_CONFIG = {
  secret: process.env.JWT_SECRET_KEY || 'your-secret-key',
  expiresIn: '7d',
  algorithm: 'HS256',
  cookieName: 'auth-token'
} as const

export interface TokenPayload extends JWTPayload {
  id: number
  email: string
  role: UserRole
  name: string
  sessionId: string
  status: UserStatus
  isValid: boolean
  companyId: number
  userCompanies: Array<{ id: number; name: string; status: string }>
  userCompanyRoles: Array<{ role: string; companyId: number; companyName: string }>
  currentCompanyId?: number
  currentCompanyName?: string
  primaryCompanyId?: number
  primaryCompanyName?: string
  employeeId?: string
  // ...other optional fields...
}
