import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import { Role, UserStatus, EmployeeStatus, EmploymentType } from '@prisma/client'

// Match the form schema
const registerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  company: z.string().min(1, 'Company selection is required'),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validatedData = registerSchema.parse(body)

    // Find company by name (since form sends company name)
    const company = await prisma.company.findFirst({
      where: { 
        name: validatedData.company,
        status: 'APPROVED' // Only allow registration for approved companies
      }
    })

    if (!company) {
      return NextResponse.json({ error: 'Company not found or not approved' }, { status: 400 })
    }

    // Check existing email
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email.toLowerCase() }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    }

    const result = await prisma.$transaction(async (tx) => {
      // Create employee with required fields
      const employee = await tx.employee.create({
        data: {
          id: randomUUID(),
          employeeId: `EMP${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          name: validatedData.name,
          email: validatedData.email.toLowerCase(),
          phone: '', // Required field, set empty initially
          jobTitle: 'Employee', // Required field
          department: 'General', // Required field
          employmentType: EmploymentType.FULL_TIME,
          role: Role.EMPLOYEE,
          status: EmployeeStatus.PENDING,
          companyId: company.id,
          address: {
            street: '',
            city: '',
            state: '',
            country: '',
            zipCode: ''
          },
          updatedAt: new Date(),
          isApproved: false
        }
      })

      // Create user with proper relations
      const hashedPassword = await bcrypt.hash(validatedData.password, 10)
      const user = await tx.user.create({
        data: {
          name: validatedData.name,
          email: validatedData.email.toLowerCase(),
          password: hashedPassword,
          role: Role.EMPLOYEE,
          status: UserStatus.PENDING,
          primaryCompanyId: company.id,
          companyId: company.id,
          employeeProfile: {
            connect: { id: employee.id }
          },
          UserCompany: {
            create: {
              id: randomUUID(),
              companyId: company.id
            }
          }
        }
      })

      return { user, employee }
    })

    return NextResponse.json({
      success: true,
      message: 'Registration successful! Please wait for admin approval.',
      data: {
        userId: result.user.id,
        employeeId: result.employee.id
      }
    })
  } catch (error) {
    console.error('Employee registration error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Registration failed' },
      { status: 400 }
    )
  }
}