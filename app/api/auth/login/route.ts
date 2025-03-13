import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hash, compare } from 'bcrypt' 
import { signJWTApi } from '@/lib/jwt'
import { v4 as uuidv4 } from 'uuid'
import type { TokenPayload } from '@/types/auth'
import { getRoleBasedPath } from '@/utils/route-helpers'
import { Role, UserStatus } from '@prisma/client'
import { AUTH_CONFIG } from '@/config/auth'
import { loginSchema } from '@/lib/validations/auth'

// Helper function for consistent JSON responses
const createJsonResponse = (data: any, status: number = 200) => {
  return NextResponse.json(data, {
    status,
    headers: {
      'Content-Type': 'application/json',
    }
  });
};

export async function POST(req: NextRequest) {
  try {
    // Ensure middleware doesn't redirect API routes
    if (!req.url.includes('/api/')) {
      console.error('[Auth API] Invalid route:', req.url);
      return createJsonResponse({ 
        success: false, 
        error: 'Invalid API route' 
      }, 400);
    }

    // Log request details
    console.log('[Auth API] Request received:', {
      url: req.url,
      method: req.method,
      timestamp: new Date().toISOString()
    });

    // Input validation
    if (!req.headers.get('content-type')?.includes('application/json')) {
      console.error('[Auth API] Invalid content type:', req.headers.get('content-type'));
      return createJsonResponse({ 
        success: false, 
        error: 'Content-Type must be application/json' 
      }, 400);
    }

    let body;
    try {
      body = await req.json();
      console.log('[Auth API] Request body:', { email: body.email });
    } catch (error) {
      console.error('[Auth API] JSON parse error:', error);
      return createJsonResponse({ 
        success: false, 
        error: 'Invalid JSON payload' 
      }, 400);
    }

    const result = loginSchema.safeParse(body);
    
    if (!result.success) {
      console.error('[Auth API] Validation error:', result.error);
      return createJsonResponse({
        success: false,
        error: 'Invalid input',
        issues: result.error.issues
      }, 400);
    }

    const { email, password, isEmployee } = result.data

    // Super Admin check
    if (email === process.env.SUPER_ADMIN_EMAIL && 
        password === process.env.SUPER_ADMIN_PASSWORD) {
      const sessionId = uuidv4()
      const tokenPayload: TokenPayload = {
        // User Info
        id: 0,
        userId: 0,  // Add userId for super admin
        email,
        name: 'Super Admin',
        role: Role.SUPER_ADMIN,
        status: UserStatus.ACTIVE,
        
        // Company Info
        companyId: 0,
        currentCompanyId: 0,
        currentCompanyName: 'System',
        primaryCompanyId: 0,
        primaryCompanyName: 'System',
        
        // Session Info
        sessionId,
        isValid: true,
        
        // Company Relationships
        userCompanies: [],
        userCompanyRoles: []
      }

      const token = await signJWTApi(tokenPayload)
      return createLoginResponse(tokenPayload, token, '/admin')
    }

    // Regular user login with correct Prisma relations
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        employeeProfile: true,
        company: true,          // "UserCompany" relation
        primaryCompany: true,   // "UserPrimaryCompany" relation
        managedCompany: true,   // "CompanyManager" relation
        userCompanies: {
          include: { 
            Company: {
              select: {
                id: true,
                name: true,
                status: true
              }
            }
          }
        },
        userCompanyRoles: {
          include: { 
            Company: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    })

    if (!user) {
      console.log('[Auth API] User not found:', { email: result.data.email });
      return createJsonResponse({ 
        success: false, 
        error: 'Invalid credentials' 
      }, 401);
    }

    // Use bcrypt.compare instead of bcryptjs
    const passwordValid = await compare(password, user.password);
    if (!passwordValid) {
      console.log('[Auth API] Invalid password:', { email });
      return createJsonResponse({ 
        success: false, 
        error: 'Invalid credentials' 
      }, 401);
    }

    // Employee validation for employee portal
    if (isEmployee && !user.employeeProfile) {
      return createJsonResponse({ success: false, error: 'Not an employee account' }, 403);
    }

    const sessionId = uuidv4()
    
    // Create session first
    await prisma.userSession.create({
      data: {
        id: sessionId,
        userId: user.id,
        expiresAt: new Date(Date.now() + AUTH_CONFIG.SESSION.duration),
        userAgent: req.headers.get('user-agent') ?? undefined,
        ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0] ?? req.ip ?? 'unknown',
        metadata: JSON.stringify({
          lastLoginAt: new Date().toISOString(),
          device: req.headers.get('user-agent') ?? 'unknown'
        })
      }
    });

    const tokenPayload: TokenPayload = {
      // User Info
      id: user.id,
      userId: user.id,  // Explicitly set userId
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      
      // Company Info
      companyId: user.companyId,
      currentCompanyId: user.companyId,
      currentCompanyName: user.company?.name ?? '',        // Updated relation name
      primaryCompanyId: user.primaryCompanyId,
      primaryCompanyName: user.primaryCompany?.name ?? '', // Updated relation name
      managedCompanyId: user.managedCompanyId ?? undefined,
      managedCompanyName: user.managedCompany?.name ?? '', // Updated relation name
      
      // Employee Info
      employeeId: user.employeeProfile?.id,
      
      // Session Info
      sessionId,
      isValid: true,
      
      // Company Relationships
      userCompanies: user.userCompanies.map(uc => ({
        id: uc.Company.id,
        name: uc.Company.name,
        status: uc.Company.status
      })),
      
      userCompanyRoles: user.userCompanyRoles.map(cr => ({
        role: cr.role,
        companyId: cr.companyId,
        companyName: cr.Company?.name ?? ''
      }))
    }

    const token = await signJWTApi(tokenPayload)
    
    const response = NextResponse.json({
      success: true,
      token,
      user: tokenPayload,
      sessionId,
      redirectTo: getRoleBasedPath(user.role)
    })

    // Set auth cookie
    response.cookies.set({
      name: AUTH_CONFIG.COOKIE.name,
      value: token,
      ...AUTH_CONFIG.COOKIE.options
    })

    console.log('[Auth API] Login successful:', {
      userId: user.id,
      email: user.email,
      role: user.role
    });

    return response;

  } catch (error) {
    console.error('[Auth API] Critical error:', {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack
      } : error,
      timestamp: new Date().toISOString()
    });
    
    return createJsonResponse({
      success: false,
      error: 'Authentication failed'
    }, 500);
  }
}

// Update createLoginResponse to include headers
function createLoginResponse(user: TokenPayload, token: string, redirectTo: string) {
  const response = createJsonResponse({
    success: true,
    token,
    user,
    redirectTo
  });

  response.cookies.set(AUTH_CONFIG.COOKIE.name, token, AUTH_CONFIG.COOKIE.options);
  return response;
}
