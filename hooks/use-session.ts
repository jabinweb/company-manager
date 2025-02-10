import type { Session } from '@/types/auth'

interface UseSessionReturn {
  data: Session | null
  status: 'loading' | 'authenticated' | 'unauthenticated'
  update: () => Promise<void>
  signIn: (email: string, password: string, isEmployeeLogin?: boolean) => Promise<void>
  signOut: (callbackUrl?: string) => Promise<void>
}

function serverAuthFallback(): UseSessionReturn {
  return {
    data: null,
    status: 'unauthenticated' as const, // Add type assertion
    update: async () => {},
    signIn: async () => {},
    signOut: async () => {}
  }
}

export function useSession(): UseSessionReturn {
  if (typeof window === 'undefined') {
    return serverAuthFallback()
  }
  // Dynamically require the client hook to avoid server import
  const { useAuth } = require('@/contexts/auth-context')
  return useAuth()
}

export { signOut } from '@/contexts/auth-context'
export default useSession
