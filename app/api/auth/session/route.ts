import { NextResponse } from 'next/server'
import { getAuthCookie, verifyJWTApi } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const token = await getAuthCookie()
    if (!token) {
      return NextResponse.json({ success: false, user: null })
    }

    const payload = await verifyJWTApi(token)
    if (!payload) {
      return NextResponse.json({ success: false, user: null })
    }

    return NextResponse.json({
      success: true,
      user: {
        ...payload,
        isValid: true
      }
    })
  } catch (error) {
    console.error('Session error:', error)
    return NextResponse.json({ success: false, user: null })
  }
}

async function validateSession(sessionId: string, userId: number): Promise<boolean> {
  try {
    const session = await prisma.userSession.findFirst({
      where: {
        id: sessionId,
        userId: userId,
        isValid: true,
        expiresAt: { gt: new Date() }
      }
    })
    return !!session
  } catch (error) {
    console.error('Session validation error:', error)
    return false
  }
}
