import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/server-session'
import { prisma } from '@/lib/prisma'


export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const employees = await prisma.employee.findMany({
      where: {
        companyId: session.user.currentCompanyId,
        status: 'ACTIVE'
      },
      select: {
        id: true,
        name: true,
        department: true,
        jobTitle: true,
        role: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(employees)
  } catch (error) {
    console.error('Error fetching employees:', error)
    return NextResponse.json(
      { error: 'Failed to fetch employees' }, 
      { status: 500 }
    )
  }
}
