import { NextRequest } from 'next/server'
import { getServerSession } from '@/lib/server-session'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'

export async function POST(req: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.role || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const { employeeId, month, year } = await req.json()

    // Get employee's salary configuration
    const salaryConfig = await prisma.employeeSalary.findFirst({
      where: { employeeId },
      orderBy: { effectiveFrom: 'desc' }
    })

    if (!salaryConfig) {
      return new Response(JSON.stringify({ error: 'No salary configuration found' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Calculate salary components
    const basicSalary = salaryConfig.basicSalary
    const additions = salaryConfig.houseRent + salaryConfig.transport + salaryConfig.medicalAllowance
    const deductions = salaryConfig.taxDeduction + salaryConfig.otherDeductions
    const netSalary = basicSalary + additions - deductions

    // Create payslip with required fields
    const payslip = await prisma.payslip.create({
      data: {
        id: randomUUID(),
        Employee: {
          connect: { id: employeeId }
        },
        month,
        year,
        basicSalary,
        additions,
        deductions,
        netSalary,
        isPaid: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        Employee: true
      }
    })

    return new Response(JSON.stringify({ success: true, data: payslip }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Payroll generation error:', error)
    return new Response(JSON.stringify({
      error: 'Failed to generate payslip',
      details: error instanceof Error ? error.message : undefined
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
