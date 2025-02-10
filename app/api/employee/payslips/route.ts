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
    const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString())

    const payslips = await prisma.payslip.findMany({
      where: {
        employeeId: session.user.employeeId,
        year: year,
      },
      orderBy: [
        { year: "desc" },
        { month: "desc" }
      ],
    })

    return NextResponse.json(payslips)
  } catch (error) {
    console.error("Error fetching payslips:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
