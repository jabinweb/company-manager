'use client'

import { createContext, useContext, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSessionStore } from '@/lib/session'

interface SessionContextValue {
  status: 'loading' | 'authenticated' | 'unauthenticated'
}

const SessionContext = createContext<SessionContextValue>({
  status: 'loading'
})

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { clearSession } = useSessionStore()
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session')
        const data = await response.json()

        console.log('[SessionProvider] Session check:', {
          success: !!data.user,
          timestamp: new Date().toISOString()
        })

        if (!data.user) {
          clearSession()
          if (!window.location.pathname.startsWith('/auth/')) {
            router.push('/auth/login')
          }
        }
      } catch (error) {
        console.error('[SessionProvider] Session check error:', error)
        clearSession()
        if (!window.location.pathname.startsWith('/auth/')) {
          router.push('/auth/login')
        }
      }
    }

    checkSession()

    // Check session every 5 minutes
    const interval = setInterval(checkSession, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [clearSession, router])

  return <SessionContext.Provider value={{ status: 'loading' }}>{children}</SessionContext.Provider>
}

export const useSessionContext = () => useContext(SessionContext)
