import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import { Role, UserStatus, CompanyStatus, EmployeeRole, EmployeeStatus } from '@prisma/client'

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().toLowerCase(),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  companyName: z.string().min(2).max(100),
  website: z.string().url().max(255)
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const data = registerSchema.parse(body)

    // Check for existing email
    const [existingUser, existingCompanyWebsite] = await Promise.all([
      prisma.user.findUnique({ where: { email: data.email } }),
      prisma.company.findUnique({ where: { website: data.website } })
    ])

    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    }

    if (existingCompanyWebsite) {
      return NextResponse.json({ error: 'Company website already registered' }, { status: 400 })
    }

    // Create records in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create company first
      const company = await tx.company.create({
        data: {
          name: data.companyName,
          website: data.website,
          status: CompanyStatus.PENDING
        }
      })

      // Create admin employee
      const employee = await tx.employee.create({
        data: {
          id: randomUUID(),
          employeeId: `ADM${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          name: data.name,
          email: data.email,
          phone: '',
          jobTitle: 'Administrator',
          department: 'Administration',
          role: EmployeeRole.ADMIN,
          status: EmployeeStatus.PENDING,
          companyId: company.id,
          address: { street: '', city: '', state: '', country: '', zipCode: '' },
          updatedAt: new Date()
        }
      })

      // Create user with hashed password
      const hashedPassword = await bcrypt.hash(data.password, 12)
      const user = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
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
      message: 'Registration successful. Please wait for admin approval.',
      data: {
        userId: result.user.id,
        companyId: result.company.id
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
