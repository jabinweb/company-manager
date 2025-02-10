import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { signJWTApi } from '@/lib/jwt'
import { v4 as uuidv4 } from 'uuid'
import type { TokenPayload } from '@/config/jwt'
import { getRoleBasedPath } from '@/utils/route-helpers'
import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies'
import type { UserRole, UserStatus } from '@/types/auth'
import type { Company } from '@prisma/client'

interface UserCompanyData {
  Company: Company
}

interface UserCompanyRoleData {
  role: string
  companyId: number
  Company: Company | null
}

export async function POST(req: Request) {
  try {
    const { email, password, isEmployeeLogin } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Super Admin check
    if (email === process.env.SUPER_ADMIN_EMAIL && 
        password === process.env.SUPER_ADMIN_PASSWORD) {
      const sessionId = uuidv4()
      const tokenPayload: TokenPayload = {
        id: 0,
        email,
        name: 'Super Admin',
        role: 'SUPER_ADMIN' as UserRole,
        status: 'ACTIVE' as UserStatus,
        companyId: 0,
        sessionId,
        isValid: true,
        userCompanies: [], // Add empty arrays for required fields
        userCompanyRoles: []
      }

      const token = await signJWTApi(tokenPayload)
      const response = NextResponse.json({
        user: tokenPayload,
        redirectTo: '/admin'
      })

      response.cookies.set({
        name: 'auth-token',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60
      } as ResponseCookie)

      return response
    }

    // Regular user login with typed data
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        employeeProfile: {
          include: {
            Company_Employee_companyIdToCompany: true
          }
        },
        // ...rest of includes...
        UserCompany: {
          include: { Company: true }
        },
        UserCompanyRole: {
          include: { Company: true }
        }
      }
    })

    if (!user || !await bcrypt.compare(password, user.password)) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 })
    }

    // Employee validation
    if (isEmployeeLogin) {
      // ...employee validation logic...
    }

    // Create token with complete payload
    const sessionId = uuidv4()
    const tokenPayload: TokenPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
      status: user.status as UserStatus,
      sessionId,
      isValid: true,
      companyId: user.companyId,
      currentCompanyId: user.companyId,
      currentCompanyName: user.Company_User_companyIdToCompany?.name || '',
      primaryCompanyId: user.primaryCompanyId,
      primaryCompanyName: user.Company_User_primaryCompanyIdToCompany?.name || '',
      employeeId: user.employeeProfile?.id,
      userCompanies: user.UserCompany.map((uc: UserCompanyData) => ({
        id: uc.Company.id,
        name: uc.Company.name,
        status: uc.Company.status
      })),
      userCompanyRoles: user.UserCompanyRole.map((cr: UserCompanyRoleData) => ({
        role: cr.role,
        companyId: cr.companyId,
        companyName: cr.Company?.name || ''
      }))
    }

    const token = await signJWTApi(tokenPayload)
    await prisma.userSession.create({
      data: {
        id: sessionId,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    })

    const response = NextResponse.json({
      success: true, // Add success flag
      user: tokenPayload,
      redirectTo: getRoleBasedPath(user.role)
    })

    response.cookies.set({
      name: 'auth-token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60
    } as ResponseCookie)

    return response

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: 'Login failed', error: process.env.NODE_ENV === 'development' ? error : undefined },
      { status: 500 }
    )
  }
}
