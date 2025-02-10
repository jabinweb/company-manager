import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/server-session'
import { EmployeeStatus } from '@prisma/client'
import { randomUUID } from 'crypto'

export async function POST(req: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.role || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { companyId, month, year } = body

    if (!companyId || !month || !year) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get all active employees with their latest salary config
    const employees = await prisma.employee.findMany({
      where: {
        companyId,
        status: EmployeeStatus.ACTIVE,
        isApproved: true
      },
      include: {
        salary: {
          orderBy: { effectiveFrom: 'desc' },
          take: 1
        }
      }
    })

    // Generate payslips in transaction
    const result = await prisma.$transaction(async (tx) => {
      const payslips = await Promise.all(
        employees.map(async (employee) => {
          const salaryConfig = employee.salary[0]
          if (!salaryConfig) return null

          // Check if payslip already exists
          const existingPayslip = await tx.payslip.findFirst({
            where: {
              employeeId: employee.id,
              month,
              year
            }
          })

          if (existingPayslip) return null

          // Calculate salary components
          const basicSalary = salaryConfig.basicSalary
          const additions = salaryConfig.houseRent + 
                          salaryConfig.transport + 
                          salaryConfig.medicalAllowance
          const deductions = salaryConfig.taxDeduction + 
                           salaryConfig.otherDeductions
          const netSalary = basicSalary + additions - deductions

          // Create payslip
          return tx.payslip.create({
            data: {
              id: randomUUID(),
              employeeId: employee.id,
              month,
              year,
              basicSalary,
              additions,
              deductions,
              netSalary,
              isPaid: false,
              createdAt: new Date(),
              updatedAt: new Date() // Added required field
            }
          })
        })
      )

      return payslips.filter(Boolean)
    })

    return NextResponse.json({
      success: true,
      message: `Generated ${result.length} payslips`,
      data: result
    })

  } catch (error) {
    console.error('Bulk payroll generation error:', error)
    return NextResponse.json({ 
      error: 'Failed to generate payslips',
      details: error instanceof Error ? error.message : undefined
    }, { status: 500 })
  }
}
