import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { AUTH_CONFIG } from '@/config/auth'
import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies'
import type { TokenPayload, JWTPayload } from '@/types/auth'

// Ensure consistent secret encoding
const getSecret = () => {
  const secret = AUTH_CONFIG.JWT.secret
  // console.log('[JWT] Secret length:', secret.length)
  return new TextEncoder().encode(secret)
}

const secret = getSecret()

// Main JWT functions
export async function signJWTApi(payload: TokenPayload) {
  try {
    const iat = Math.floor(Date.now() / 1000)
    const exp = iat + AUTH_CONFIG.JWT.expiresIn // Add to current time

    const token = await new SignJWT({ ...payload })
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .setIssuedAt(iat)
      .setExpirationTime(exp) // Use the calculated exp time
      .setIssuer(AUTH_CONFIG.JWT.issuer)
      .setAudience(AUTH_CONFIG.JWT.audience)
      .sign(secret)

    console.log('[JWT] Token signed:', { iat, exp, tokenLength: token.length })
    return token
  } catch (error) {
    console.error('[JWT] Sign Error:', error)
    throw new Error('Failed to sign JWT')
  }
}

export async function verifyJWTApi(token: string): Promise<TokenPayload | null> {
  try {
    // console.log('[JWT] Verifying token:', token.substring(0, 20) + '...')
    
    const { payload } = await jwtVerify(token, secret, {
      issuer: AUTH_CONFIG.JWT.issuer,
      audience: AUTH_CONFIG.JWT.audience,
      clockTolerance: 60 // 1 minute tolerance for clock skew
    })

    // console.log('[JWT] Token verified:', { 
    //   userId: payload.id,
    //   exp: payload.exp,
    //   iat: payload.iat
    // })

    return { ...payload as TokenPayload, isValid: true }
  } catch (error: any) {
    console.error('[JWT] Verification error:', {
      error,
      token: token.substring(0, 20) + '...'
    })
    return null
  }
}

// Cookie management
export function setAuthCookie(token: string): ResponseCookie {
  return {
    name: AUTH_CONFIG.COOKIE.name,
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
  const token = cookieStore.get(AUTH_CONFIG.COOKIE.name)?.value
  return token
}

export async function removeAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.set({
    name: AUTH_CONFIG.COOKIE.name,
    value: '', // Add a value property
    expires: new Date(0),
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  })
}