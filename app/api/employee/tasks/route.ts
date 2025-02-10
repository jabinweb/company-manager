
import { NextResponse } from "next/server"
import { getServerSession } from '@/lib/server-session'

import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.employeeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const tasks = await prisma.task.findMany({
      where: {
        assignedToId: session.user.employeeId,
        status: { not: "COMPLETED" }
      },
      orderBy: [
        { priority: "desc" },
        { dueDate: "asc" }
      ],
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}