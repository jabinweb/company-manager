import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/server-session'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession()

    if (!session?.user?.employeeId) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      )
    }

    const employee = await prisma.employee.findUnique({
      where: {
        id: session.user.employeeId
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        jobTitle: true,
        department: true,
        dateJoined: true,
        role: true,
        employmentType: true,
        status: true,
        avatar: true,
        Company_Employee_companyIdToCompany: {
          select: {
            id: true,
            name: true,
            status: true
          }
        }
      }
    })

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: employee.id,
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      jobTitle: employee.jobTitle,
      department: employee.department,
      dateJoined: employee.dateJoined,
      role: employee.role,
      employmentType: employee.employmentType,
      status: employee.status,
      avatar: employee.avatar,
      company: {
        id: employee.Company_Employee_companyIdToCompany.id,
        name: employee.Company_Employee_companyIdToCompany.name,
        status: employee.Company_Employee_companyIdToCompany.status,
      }
    })

  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { error: 'Error fetching profile' },
      { status: 500 }
    )
  }
}
