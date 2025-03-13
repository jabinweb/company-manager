import { headers } from 'next/headers'

async function getHeader(name: string): Promise<string | null> {
  const headersList = headers()
  await Promise.resolve() // Ensure async context
  return headersList.get(name) || null
}

export async function getSecureHeaders() {
  try {
    // Get common headers individually
    const [authHeader, cookieHeader] = await Promise.all([
      getHeader('authorization'),
      getHeader('cookie')
    ])

    return {
      authorization: authHeader,
      cookie: cookieHeader,
      async get(name: string) {
        return getHeader(name)
      }
    }
  } catch (error) {
    console.error('[Headers] Error:', error)
    return {
      authorization: null,
      cookie: null,
      async get() { return null }
    }
  }
}

export function parseCookieString(cookieStr: string): Record<string, string> {
  try {
    return Object.fromEntries(
      cookieStr.split(';')
        .map(pair => pair.trim().split('='))
        .map(([key, value]) => [key, decodeURIComponent(value)])
    )
  } catch (error) {
    console.error('[Cookie Parse] Error:', error)
    return {}
  }
}
