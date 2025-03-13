import { NextRequest } from 'next/server'
import { getServerSession } from '@/lib/server-session'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.companyId) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Get the most recent salary record
    const salary = await prisma.employeeSalary.findFirst({
      where: { 
        employeeId: (await params).id,
      },
      orderBy: { effectiveFrom: 'desc' },
      select: {
        id: true,
        basicSalary: true,
        houseRent: true,
        transport: true,
        medicalAllowance: true,
        taxDeduction: true,
        otherDeductions: true,
        effectiveFrom: true
      }
    })

    return new Response(JSON.stringify(salary), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Salary fetch error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.companyId) {
      return new Response('Unauthorized', { status: 401 })
    }

    const data = await req.json()
    const employeeId = (await params).id

    // Verify employee belongs to the company
    const employee = await prisma.employee.findFirst({
      where: {
        id: employeeId,
        companyId: session.user.companyId
      }
    })

    if (!employee) {
      return new Response('Employee not found', { status: 404 })
    }

    // Create salary record with createdBy
    const salary = await prisma.employeeSalary.create({
      data: {
        employee: { connect: { id: employeeId } },
        createdBy: { connect: { id: session.user.id } },
        basicSalary: Number(data.basicSalary),
        houseRent: Number(data.houseRent),
        transport: Number(data.transport),
        medicalAllowance: Number(data.medicalAllowance),
        taxDeduction: Number(data.taxDeduction),
        otherDeductions: Number(data.otherDeductions),
        effectiveFrom: new Date()
      }
    })

    return new Response(JSON.stringify(salary), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Salary creation error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
