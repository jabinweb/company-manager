import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyJWTApi } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'
import { JWT_CONFIG } from '@/config/jwt'

export async function POST() {
  try {
    // Get cookie store and await it
    const cookieStore = await cookies()
    const token = cookieStore.get(JWT_CONFIG.cookieName)?.value

    if (token) {
      // Verify the token to get the session ID
      const payload = verifyJWTApi(token)
      
      if (payload?.sessionId) {
        // Invalidate the session in the database
        await prisma.userSession.update({
          where: { id: payload.sessionId },
          data: { isValid: false }
        })
      }

      // Clear the cookie
      cookieStore.delete(JWT_CONFIG.cookieName)
    }

    const response = NextResponse.json({ success: true })
    
    // Also set cookie with immediate expiry as backup clearing mechanism
    response.cookies.set(JWT_CONFIG.cookieName, '', {
      expires: new Date(0),
      path: '/'
    })

    return response
  } catch (error) {
    console.error('Logout error:', error)
    // Still return success even if there's an error
    // This ensures the client session is cleared
    return NextResponse.json({ 
      success: true,
      error: process.env.NODE_ENV === 'development' ? error : undefined 
    })
  }
}
