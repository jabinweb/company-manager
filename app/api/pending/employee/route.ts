import { NextRequest } from 'next/server'
import { getServerSession } from '@/lib/server-session'
import { prisma } from '@/lib/prisma'
import { EmployeeStatus, Role } from '@prisma/client'

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{}> }
): Promise<Response> {
  try {
    const session = await getServerSession()
    if (!session?.user?.role || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const pendingEmployees = await prisma.employee.findMany({
      where: {
        status: EmployeeStatus.PENDING,
        role: Role.EMPLOYEE
      },
      include: {
        Company_Employee_companyIdToCompany: true,
        user: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return new Response(JSON.stringify(pendingEmployees), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error fetching pending employees:', error)
    return new Response(JSON.stringify({
      error: 'Failed to fetch pending employees',
      details: error instanceof Error ? error.message : undefined
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{}> }
): Promise<Response> {
  try {
    const session = await getServerSession()
    if (!session?.user?.role || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const body = await request.json()
    const { id, action } = body

    if (!id || !action) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const result = await prisma.employee.update({
      where: { id },
      data: {
        status: action === 'approve' ? EmployeeStatus.ACTIVE : EmployeeStatus.REJECTED,
        isApproved: action === 'approve',
        user: {
          update: {
            status: action === 'approve' ? 'ACTIVE' : 'REJECTED'
          }
        }
      },
      include: {
        Company_Employee_companyIdToCompany: true,
        user: true
      }
    })

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error updating employee status:', error)
    return new Response(JSON.stringify({
      error: 'Failed to update employee status',
      details: error instanceof Error ? error.message : undefined
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}