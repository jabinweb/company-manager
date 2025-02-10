import { NextResponse } from "next/server"
import { getServerSession } from '@/lib/server-session'
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user?.employeeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const employee = await prisma.employee.findUnique({
      where: { id: session.user.employeeId },
      include: {
        LeaveRequest: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        Attendance: {
          orderBy: { date: 'desc' },
          take: 5,
        },
        Task_Task_assignedToIdToEmployee: {
          where: { status: 'TODO' },
          take: 5,
        },
      },
    })

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    return NextResponse.json(employee)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch employee data" },
      { status: 500 }
    )
  }
}
