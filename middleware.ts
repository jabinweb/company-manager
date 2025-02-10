import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyJWTApi } from '@/lib/jwt'
import { ROUTES, getRoleBasedPath } from '@/utils/route-helpers'

// Helper functions
const isStaticResource = (pathname: string): boolean =>
  pathname.startsWith('/_next/') ||
  pathname.startsWith('/favicon.ico') ||
  pathname.startsWith('/public/')

const isPublicApiRoute = (pathname: string): boolean =>
  ROUTES.API.PUBLIC.some(route => pathname.startsWith(route))

const isPublicRoute = (pathname: string): boolean =>
  ROUTES.PUBLIC.includes(pathname as any) ||
  ROUTES.EMPLOYEE.AUTH.includes(pathname as any)

export interface AuthenticatedRequest extends NextRequest {
  user: {
    id: number
    role: string
    email: string
  }
}

// Middleware function
export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  // console.log('Middleware processing:', pathname, 'Method:', req.method)

  // Static and public routes checks
  if (isStaticResource(pathname) || isPublicApiRoute(pathname) || isPublicRoute(pathname)) {
    console.log('Skipping auth check for:', pathname)
    return NextResponse.next()
  }

  try {
    const token = req.cookies.get('auth-token')?.value
    // console.log('Token check in middleware:', token ? 'present' : 'missing')

    if (!token) {
      if (!isPublicRoute(pathname)) {
        console.log('No token, redirecting to login')
        const loginPath = pathname.startsWith('/employee') ? '/employee/login' : '/login'
        return NextResponse.redirect(new URL(`${loginPath}`, req.url))
      }
      return NextResponse.next()
    }

    const payload = await verifyJWTApi(token)
    // console.log('JWT payload in middleware:', payload?.role)

    if (!payload) {
      console.log('Invalid token, redirecting to login')
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Allow API routes to proceed
    if (pathname.startsWith('/api/')) {
      return NextResponse.next()
    }

    // Handle authenticated routes
    if (isPublicRoute(pathname)) {
      const redirectPath = getRoleBasedPath(payload.role)
      console.log('Redirecting authenticated user to:', redirectPath)
      return NextResponse.redirect(new URL(redirectPath, req.url))
    }

    // Don't redirect if already on the correct path
    if (pathname === getRoleBasedPath(payload.role)) {
      return NextResponse.next()
    }

    // Only redirect root path to role-based dashboard
    if (pathname === '/') {
      return NextResponse.redirect(new URL(getRoleBasedPath(payload.role), req.url))
    }

    // Role-specific protections
    if (pathname.startsWith('/admin') && payload.role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL(getRoleBasedPath(payload.role), req.url))
    }

    if (pathname.startsWith('/dashboard') && payload.role !== 'ADMIN') {
      return NextResponse.redirect(new URL(getRoleBasedPath(payload.role), req.url))
    }

    if (pathname.startsWith('/employee') && !pathname.startsWith('/employee/login')) {
      const requestHeaders = new Headers(req.headers)
      requestHeaders.set('x-user-id', payload.userId)
      requestHeaders.set('x-user-role', payload.role)

      return NextResponse.next({
        headers: requestHeaders
      })
    }

    // Add user info to headers for API routes
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set('x-user-id', payload.userId)
    requestHeaders.set('x-user-role', payload.role)

    return NextResponse.next({
      headers: requestHeaders
    })

  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.redirect(new URL('/login', req.url))
  }
}

export const config = {
  matcher: [
    '/((?!api/uploadthing|_next/static|_next/image|favicon.ico).*)',
  ],
}
