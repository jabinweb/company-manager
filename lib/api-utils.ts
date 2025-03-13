import { NextRequest, NextResponse } from 'next/server'
import { AUTH_CONFIG } from '@/config/auth'
import type { TokenPayload } from '@/types/auth'
import { verifyJWTApi } from './jwt'

export async function getAuthFromRequest(req: NextRequest | Request): Promise<TokenPayload | null> {
  try {
    let token: string | undefined

    // Get auth header
    const authHeader = req.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.slice(7)
    }

    // Try cookie if no auth header
    if (!token) {
      const cookieHeader = req.headers.get('cookie')
      if (cookieHeader) {
        const cookies = parseCookieString(cookieHeader)
        token = cookies[AUTH_CONFIG.COOKIE.name]
      }
    }

    if (!token) return null

    const payload = await verifyJWTApi(token)
    return payload?.isValid ? payload : null
  } catch (error) {
    console.error('[API Utils] Auth error:', error)
    return null
  }
}

export function parseCookieString(cookieStr: string): Record<string, string> {
  try {
    return Object.fromEntries(
      cookieStr.split(';')
        .map(pair => pair.trim().split('='))
        .map(([key, value]) => [key, decodeURIComponent(value)])
    )
  } catch (error) {
    console.error('[Cookie Parse] Error:', error)
    return {}
  }
}

export function createApiHandler(handler: Function) {
  return async function(req: NextRequest) {
    const user = await getAuthFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return handler(req, user)
  }
}

export function unauthorized(message = 'Unauthorized') {
  return new Response(JSON.stringify({ error: message }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' }
  })
}

export function forbidden(message = 'Forbidden') {
  return new Response(JSON.stringify({ error: message }), {
    status: 403,
    headers: { 'Content-Type': 'application/json' }
  })
}
