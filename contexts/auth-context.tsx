'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { User, Session } from '@/types/auth'
import { getRoleBasedPath } from '@/utils/route-helpers'
import { LoadingSpinner } from '@/components/ui/loading'

interface Message {
  id: number
  content: string
  senderId: string
  receiverId: string
  status: 'SENT' | 'DELIVERED' | 'READ'
  type: 'TEXT' | 'FILE' | 'IMAGE'
  createdAt: Date
  sender: {
    name: string
    avatar: string | null
  }
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

interface AuthContextValue {
  data: Session | null
  status: AuthStatus
  signIn: (email: string, password: string, isEmployeeLogin?: boolean) => Promise<void>
  signOut: (callbackUrl?: string) => Promise<void>
  update: () => Promise<void>
}

interface ChatContextValue {
  messages: Message[]
  sendMessage: (payload: { content: string, receiverId: string }) => void // Fix this type
  sendTextMessage: (content: string, receiverId: string) => Promise<void>
  // ...rest of interface
}

// Move session fetching logic outside component
export const getServerSession = async () => {
  const res = await fetch('/api/auth/session', {
    headers: { 'Accept': 'application/json' }
  })
  const data = await res.json()
  return data.success ? data : null
}

const AuthContext = createContext<AuthContextValue | null>(null)

// Create a server-safe hook
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

// Add this line to support server components
export const getAuth = async () => {
  const res = await fetch('/api/auth/session')
  const data = await res.json()
  return data.success ? data : null
}

// Export a server-compatible getSession
export async function getSession(): Promise<Session | null> {
  try {
    const res = await fetch('/api/auth/session')
    const data = await res.json()
    return data.success ? data : null
  } catch (error) {
    console.error('Get session error:', error)
    return null
  }
}

export async function signOut(callbackUrl: string = '/login') {
  try {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = callbackUrl
  } catch (error) {
    console.error('Logout error:', error)
    window.location.href = callbackUrl
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Convert internal state to NextAuth-like session
  const sessionData: Session | null = user ? {
    user,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  } : null

  const getStatus = (): 'loading' | 'authenticated' | 'unauthenticated' => {
    if (loading) return 'loading'
    if (user) return 'authenticated'
    return 'unauthenticated'
  }

  const refreshUser = async () => {
    try {
      console.log('Refreshing user session')
      const res = await fetch('/api/auth/session')
      const data = await res.json()
      
      if (!res.ok) {
        console.error('Session refresh failed:', data.message)
        setUser(null)
        return
      }
      
      setUser(data.user)
      console.log('Session refreshed successfully')
    } catch (error) {
      console.error('Session refresh error:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string, isEmployeeLogin = false) => {
    console.log('Auth context login started:', { isEmployeeLogin });
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, isEmployeeLogin })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');

      setUser(data.user);
      
      if (data.redirectTo) {
        window.location.href = data.redirectTo;
      } else {
        window.location.href = getRoleBasedPath(data.user.role);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    router.push('/login')
    router.refresh()
  }

  const checkSession = async () => {
    try {
      console.log('Checking session validity')
      const res = await fetch('/api/auth/session', {
        headers: {
          'Accept': 'application/json'
        }
      })
      
      if (!res.ok) {
        throw new Error('Session check failed')
      }

      const data = await res.json()
      
      if (!data.user) {
        console.log('Session invalid, logging out')
        await logout()
        return
      }

      // Update user state if session is valid
      setUser(data.user)
    } catch (error) {
      console.error('Session check failed:', error)
      await logout()
    }
  }

  const update = useCallback(async () => {
    try {
      console.log('Updating session...')
      const res = await fetch('/api/auth/session', {
        headers: { 'Accept': 'application/json' }
      })
      
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update session')
      }

      setUser(data.user)
      console.log('Session updated successfully')
    } catch (error) {
      console.error('Session update error:', error)
      throw error
    }
  }, [])

  useEffect(() => {
    refreshUser()
  }, [])

  useEffect(() => {
    const interval = setInterval(checkSession, 5 * 60 * 1000) // Check every 5 min
    return () => clearInterval(interval)
  }, [])

  // Show loading state or children based on loading state
  if (loading) {
    return <LoadingSpinner /> // Or your loading component
  }

  // Return the same shape expected by client components
  const contextValue: AuthContextValue = {
    data: sessionData,
    status: getStatus(),
    signIn,
    signOut,
    update
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}
