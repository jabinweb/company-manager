'use client'

import { AuthProvider, useAuth } from '@/contexts/auth-context'
import { createContext } from 'react'
import type { Session } from '@/types/auth'

interface SessionContextType {
  data: Session | null
  status: 'loading' | 'authenticated' | 'unauthenticated'
  update: () => Promise<void>
}

export const SessionContext = createContext<SessionContextType | null>(null)

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SessionConsumer>{children}</SessionConsumer>
    </AuthProvider>
  )
}

function SessionConsumer({ children }: { children: React.ReactNode }) {
  const auth = useAuth()
  return (
    <SessionContext.Provider 
      value={{
        data: auth.data,
        status: auth.status,
        update: auth.update
      }}
    >
      {children}
    </SessionContext.Provider>
  )
}