import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import { Role, UserStatus, CompanyStatus } from '@prisma/client'

const registerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  companyName: z.string().min(2, 'Company name is required'),
  website: z.string().url('Valid website URL is required'),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validatedData = registerSchema.parse(body)

    // Check existing email
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email.toLowerCase() }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    }

    // Create records in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create company
      const company = await tx.company.create({
        data: {
          name: validatedData.companyName,
          website: validatedData.website,
          status: CompanyStatus.PENDING,
        }
      })

      // Create initial admin employee
      const employee = await tx.employee.create({
        data: {
          id: randomUUID(),
          employeeId: `ADM${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          name: validatedData.name,
          email: validatedData.email.toLowerCase(),
          phone: '',
          jobTitle: 'Admin',
          department: 'Administration',
          role: 'ADMIN',
          status: 'PENDING',
          companyId: company.id,
          address: {
            street: '',
            city: '',
            state: '',
            country: '',
            zipCode: ''
          },
          updatedAt: new Date()
        }
      })

      // Create user
      const hashedPassword = await bcrypt.hash(validatedData.password, 10)
      const user = await tx.user.create({
        data: {
          name: validatedData.name,
          email: validatedData.email.toLowerCase(),
          password: hashedPassword,
          role: Role.ADMIN,
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
          },
          UserCompanyRole: {
            create: {
              id: randomUUID(),
              companyId: company.id,
              role: Role.ADMIN,
              assignedById: employee.id,
              updatedAt: new Date()
            }
          }
        }
      })

      return { user, company, employee }
    })

    return NextResponse.json({
      success: true,
      message: 'Registration successful! Please wait for admin approval.',
      data: {
        userId: result.user.id,
        companyId: result.company.id
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Registration failed' },
      { status: 400 }
    )
  }
}
