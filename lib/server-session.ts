import { cookies } from 'next/headers'
import { verifyJWTApi } from './jwt'
import { prisma } from './prisma'
import type { TokenPayload } from '@/types/auth'

export async function getServerSession(): Promise<{ user: TokenPayload } | null> {
  try {
    const cookiesResult = await cookies();
    const token = cookiesResult.get('auth-token')?.value;
    if (!token) return null

    const payload = await verifyJWTApi(token)
    if (!payload?.sessionId) return null

    // Validate session
    const session = await prisma.userSession.findFirst({
      where: {
        id: payload.sessionId,
        userId: payload.id,
        isValid: true,
        expiresAt: { gt: new Date() }
      }
    })

    if (!session) return null

    // Update last active
    await prisma.userSession.update({
      where: { id: session.id },
      data: { lastActive: new Date() }
    })

    return { user: payload }
  } catch (error) {
    console.error('[Server Session] Error:', error)
    return null
  }
}
