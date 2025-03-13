import type { LoginResponse, Session } from '@/types/auth'

export class AuthError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message)
    this.name = 'AuthError'
  }
}

export class AuthService {
  static async login(email: string, password: string, isEmployeeLogin: boolean): Promise<LoginResponse> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, isEmployeeLogin })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new AuthError(
          data.message || 'Login failed',
          response.status,
          data.code
        )
      }

      return data
    } catch (err) {
      if (err instanceof AuthError) {
        throw err
      }
      throw new AuthError('An unexpected error occurred')
    }
  }

  static async logout(): Promise<void> {
    await fetch('/api/auth/logout', { method: 'POST' })
  }

  static async getSession(): Promise<Session | null> {
    try {
      const response = await fetch('/api/auth/session')
      if (!response.ok) return null
      const data = await response.json()
      return data.success ? data : null
    } catch (error) {
      console.error('Get session error:', error)
      return null
    }
  }

  static async refreshSession(): Promise<Session | null> {
    try {
      const response = await fetch('/api/auth/refresh')
      if (!response.ok) return null
      return response.json()
    } catch (error) {
      console.error('Refresh session error:', error)
      return null
    }
  }
}
