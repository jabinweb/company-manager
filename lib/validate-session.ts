import type { TokenPayload } from '@/types/auth'

export function validateTokenExpiry(payload: TokenPayload): boolean {
  if (!payload?.exp) return false
  
  const now = Math.floor(Date.now() / 1000)
  return payload.exp > now
}

export function validateTokenPermissions(payload: TokenPayload): boolean {
  return !!(
    payload?.isValid &&
    payload?.userId &&
    payload?.role &&
    payload?.sessionId
  )
}
