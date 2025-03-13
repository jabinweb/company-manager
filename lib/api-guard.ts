import { NextRequest, NextResponse } from 'next/server'
import { prisma } from './prisma'

export async function validateSession(req: NextRequest) {
  const sessionId = req.headers.get('x-session-id')
  
  if (!sessionId) {
    return false
  }

  try {
    const session = await prisma.userSession.findUnique({
      where: {
        id: sessionId,
        isValid: true,
        expiresAt: {
          gt: new Date()
        }
      }
    })
    
    return !!session
  } catch (error) {
    console.error('[API Guard] Session validation error:', error)
    return false
  }
}

export function createApiHandler(handler: Function) {
  return async function(req: NextRequest) {
    try {
      const isValid = await validateSession(req)
      
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
      }
      
      return handler(req)
    } catch (error) {
      console.error('[API Guard] Error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }
}
