import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "@/lib/server-session"

export async function GET() {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const currentUserId = session.user.employeeId

    // First get employees from the same company
    const employees = await prisma.employee.findMany({
      where: {
        companyId: session.user.currentCompanyId,
        status: { notIn: ['TERMINATED', 'SUSPENDED'] },
        id: { not: currentUserId } // Exclude current user
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        department: true,
        status: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({ success: true, data: employees }) // Add success flag and data wrapper
  } catch (error) {
    console.error('Error fetching chat contacts:', error)
    return NextResponse.json(
      { error: "Failed to fetch contacts" },
      { status: 500 }
    )
  }
}
