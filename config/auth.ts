import { cookies } from 'next/headers';

export const AUTH_CONFIG = {
  JWT: {
    secret: process.env.JWT_SECRET_KEY || 'your-secret-key',
    issuer: 'company-manager',
    audience: 'company-manager-users',
    expiresIn: '1d',
    algorithms: ['HS256'] as const,
  },
  COOKIE: {
    name: 'auth-token',
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 86400 // 1 day in seconds
    }
  },
  SESSION: {
    duration: 86400000, // 1 day in milliseconds
  }
} as const;

// Type declarations for type safety
export interface AuthConfig {
  JWT: {
    secret: string
    issuer: string
    audience: string
    expiresIn: string
    algorithms: readonly string[]
  }
  SESSION: {
    duration: number
    cleanupInterval?: number
  }
  COOKIE: {
    name: string
    options: {
      httpOnly: boolean
      secure: boolean
      sameSite: 'lax'
      path: string
      maxAge: number
    }
  }
}

export function debugAuthConfig() {
  console.log('[Auth Config]', {
    jwtSecret: AUTH_CONFIG.JWT.secret?.substring(0, 3) + '...',
    cookieName: AUTH_CONFIG.COOKIE.name,
    secure: AUTH_CONFIG.COOKIE.options.secure,
  });
}
