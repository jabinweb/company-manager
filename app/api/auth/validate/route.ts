import { NextResponse } from 'next/server'
import { authCookies, verifyJWTApi } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    const token = await authCookies.get()
    if (!token) {
      return NextResponse.json({ valid: false })
    }

    const payload = await verifyJWTApi(token)
    if (!payload?.sessionId) {
      return NextResponse.json({ valid: false })
    }

    const session = await prisma.userSession.findFirst({
      where: {
        id: payload.sessionId,
        userId: payload.id,
        isValid: true,
        expiresAt: { gt: new Date() }
      }
    })

    if (!session) {
      return NextResponse.json({ valid: false })
    }

    await prisma.userSession.update({
      where: { id: session.id },
      data: { lastActive: new Date() }
    })

    return NextResponse.json({
      valid: true,
      user: {
        id: payload.id,
        role: payload.role,
        companyId: payload.companyId
      }
    })
  } catch (error) {
    console.error('[Validate] Error:', error)
    return NextResponse.json({ valid: false })
  }
}

// For preflight requests
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  })
}
