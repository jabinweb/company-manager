import { cookies } from 'next/headers'
import { verifyJWTApi } from './jwt'
import type { Session, User, UserRole, UserStatus } from '@/types/auth'

export async function getServerSession(): Promise<Session | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    
    if (!token) {
      return null
    }

    const payload = await verifyJWTApi(token)
    if (!payload) return null

    // Ensure all required fields are present with proper types
    const user: User = {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      role: payload.role as UserRole,
      status: (payload.status || 'ACTIVE') as UserStatus,
      isValid: true,
      companyId: payload.companyId,
      currentCompanyId: payload.currentCompanyId || payload.companyId,
      currentCompanyName: payload.currentCompanyName || '',
      primaryCompanyId: payload.primaryCompanyId || payload.companyId,
      primaryCompanyName: payload.primaryCompanyName || '',
      employeeId: payload.employeeId || undefined,
      managedCompanyId: payload.managedCompanyId || undefined,
      managedCompanyName: payload.managedCompanyName || undefined,
      employeeCompanyId: payload.employeeCompanyId || undefined,
      employeeCompanyName: payload.employeeCompanyName || undefined,
      avatar: payload.avatar || undefined,
      userCompanies: payload.userCompanies || [],
      userCompanyRoles: payload.userCompanyRoles || []
    }

    return {
      user,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  } catch (error) {
    console.error('Session error:', error)
    return null
  }
}

// Helper function to get token safely
async function getAuthToken(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get('auth-token')?.value
}
