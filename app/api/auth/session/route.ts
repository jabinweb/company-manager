import { NextResponse } from 'next/server'
import { getAuthCookie, verifyJWTApi } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'
// import { debugAuthConfig } from '@/config/auth'

export async function GET() {
  try {
    // debugAuthConfig() // Log auth config

    const token = await getAuthCookie()
    // console.log('[Session] Token from cookie:', token ? 'present' : 'missing')
    
    if (!token) {
      return NextResponse.json({ user: null, error: 'No token' })
    }

    const payload = await verifyJWTApi(token)
    // console.log('[Session] Token verification:', {
    //   isValid: !!payload,
    //   userId: payload?.id,
    //   sessionId: payload?.sessionId
    // })

    if (!payload?.sessionId) {
      return NextResponse.json({ user: null, error: 'Invalid token' })
    }

    const session = await prisma.userSession.findFirst({
      where: {
        id: payload.sessionId,
        userId: payload.id,
        isValid: true,
        expiresAt: { gt: new Date() }
      }
    })

    // console.log('[Session] Database session:', {
    //   found: !!session,
    //   isValid: session?.isValid,
    //   expiresAt: session?.expiresAt
    // })

    if (!session) {
      return NextResponse.json({ user: null, error: 'Invalid session' })
    }

    // Update session last active time
    await prisma.userSession.update({
      where: { id: session.id },
      data: { lastActive: new Date() }
    })

    return NextResponse.json({
      user: payload,
      token
    })
  } catch (error) {
    // console.error('[Session] Error:', error)
    return NextResponse.json({ 
      user: null, 
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
