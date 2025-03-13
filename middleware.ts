import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyJWTApi } from '@/lib/jwt'
import { ROUTES, getRoleBasedPath } from '@/utils/route-helpers'

// Helper functions
const isStaticResource = (pathname: string): boolean =>
  pathname.startsWith('/_next/') ||
  pathname.startsWith('/favicon.ico') ||
  pathname.startsWith('/public/') ||
  pathname.startsWith('/api/uploadthing')

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

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Skip auth for static and public routes
  if (isStaticResource(pathname) || isPublicApiRoute(pathname) || isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  try {
    const token = req.cookies.get('auth-token')?.value
    if (!token) {
      console.log('No token found in cookies:', token);
      
      return 
    }

    const payload = await verifyJWTApi(token)
    if (!payload) {
      console.log('Invalid token payload:', payload);
      
      return redirectToLogin(req)
    }

    // Role-based access control
    if (pathname.startsWith('/admin') && payload.role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL(getRoleBasedPath(payload.role), req.url))
    }

    if (pathname.startsWith('/dashboard') && payload.role !== 'ADMIN') {
      return NextResponse.redirect(new URL(getRoleBasedPath(payload.role), req.url))
    }

    // Handle authenticated routes
    if (isPublicRoute(pathname)) {
      return NextResponse.redirect(new URL(getRoleBasedPath(payload.role), req.url))
    }

    // Root path redirection
    if (pathname === '/') {
      return NextResponse.redirect(new URL(getRoleBasedPath(payload.role), req.url))
    }

    // Add user info to headers
    const requestHeaders = new Headers(req.headers)
    if (payload.employeeId) {
      requestHeaders.set('x-user-id', payload.employeeId)
    }
    requestHeaders.set('x-user-role', payload.role)
    requestHeaders.set('x-company-id', payload.companyId.toString())

    return NextResponse.next({
      headers: requestHeaders
    })

  } catch (error) {
    console.error('Middleware error:', error)
    return redirectToLogin(req)
  }
}

function redirectToLogin(req: NextRequest) {
  const loginPath = '/auth/login'
  const loginUrl = new URL(loginPath, req.url)
  loginUrl.searchParams.set('from', req.nextUrl.pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
    '/api/((?!auth|uploadthing).*)/:path*'
  ]
}
