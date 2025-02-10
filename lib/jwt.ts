import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { JWT_CONFIG } from '@/config/jwt'
import type { TokenPayload } from '@/config/jwt'
import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies'

const secret = new TextEncoder().encode(JWT_CONFIG.secret)

// Main JWT functions
export async function signJWTApi(payload: TokenPayload) {
  try {
    // Use the payload's companyId or primaryCompanyId
    const finalPayload: TokenPayload = {
      ...payload,
      companyId: payload.companyId || payload.primaryCompanyId || 0,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
    }

    return await new SignJWT(finalPayload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(JWT_CONFIG.expiresIn)
      .sign(secret)
  } catch (error) {
    console.error('JWT Sign Error:', error)
    throw new Error('Failed to sign JWT')
  }
}

export async function verifyJWTApi(token: string): Promise<TokenPayload | null> {
  try {
    // console.log('JWT verification starting')
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ['HS256']
    })
    
    // Validate required fields
    if (!payload.id || !payload.email || !payload.role || !payload.status) {
      console.error('Invalid token payload structure')
      return null
    }

    // console.log('JWT verified successfully')
    return payload as TokenPayload
  } catch (error) {
    console.error('JWT Verify Error:', error)
    return null
  }
}

// Cookie management
export function setAuthCookie(token: string): ResponseCookie {
  return {
    name: JWT_CONFIG.cookieName,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60
  }
}

export async function getAuthCookie() {
  const cookieStore = await cookies()
  const token = cookieStore.get(JWT_CONFIG.cookieName)?.value
  return token
}

export async function removeAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.set({
    name: JWT_CONFIG.cookieName,
    value: '',
    expires: new Date(0),
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  })
}