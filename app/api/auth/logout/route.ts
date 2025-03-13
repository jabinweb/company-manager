import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthCookie, verifyJWTApi } from '@/lib/jwt'
import { AUTH_CONFIG } from '@/config/auth'

export async function POST() {
  try {
    console.log('[Logout] Starting logout process...')
    
    const token = await getAuthCookie()
    
    if (token) {
      const payload = await verifyJWTApi(token)
      if (payload?.sessionId) {
        await prisma.userSession.updateMany({
          where: {
            OR: [
              { userId: payload.id },
              { id: payload.sessionId }
            ]
          },
          data: {
            isValid: false,
            expiresAt: new Date(0)
          }
        })
      }
    }

    const response = NextResponse.json({ success: true })
    
    // Use cookie options directly
    response.cookies.set({
      name: AUTH_CONFIG.COOKIE.name,
      value: '',
      path: '/',
      expires: new Date(0),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })
    
    // Add security headers
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    response.headers.set('Clear-Site-Data', '"cache", "cookies", "storage"')

    return response
  } catch (error) {
    console.error('[Logout] Error:', error)
    const response = NextResponse.json({ success: true })
    
    // Use cookie options directly here too
    response.cookies.set({
      name: AUTH_CONFIG.COOKIE.name,
      value: '',
      path: '/',
      expires: new Date(0),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })
    
    return response
  }
}