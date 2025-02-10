
import { NextResponse } from "next/server"
import { getServerSession } from '@/lib/server-session'

import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.employeeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const companyId = parseInt(searchParams.get("companyId") || "0")

    const announcements = await prisma.announcement.findMany({
      where: {
        companyId: companyId,
      },
      orderBy: [
        { priority: "desc" },
        { createdAt: "desc" }
      ],
      take: 10, // Limit to latest 10 announcements
    })

    return NextResponse.json(announcements)
  } catch (error) {
    console.error("Error fetching announcements:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}