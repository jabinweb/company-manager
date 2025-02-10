import { NextResponse } from "next/server"
import { getServerSession } from '@/lib/server-session'
import { prisma } from "@/lib/prisma"
import { AttendanceStatus } from "@prisma/client"
import { randomUUID } from 'crypto' // Add this import

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user?.employeeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const attendance = await prisma.attendance.findMany({
      where: {
        employeeId: session.user.employeeId,
        date: {
          gte: new Date(new Date().setDate(1)), // Start of current month
          lte: new Date(), // Today
        },
      },
      orderBy: {
        date: 'desc',
      },
    })

    return NextResponse.json(attendance)
  } catch (error) {
    console.error("Error fetching attendance:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.employeeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { action } = await request.json()
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    // Check if attendance record exists for today
    let attendance = await prisma.attendance.findFirst({
      where: {
        employeeId: session.user.employeeId,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    })

    if (action === 'clockIn') {
      if (attendance?.clockIn) {
        return NextResponse.json(
          { error: "Already clocked in" },
          { status: 400 }
        )
      }

      attendance = await prisma.attendance.create({
        data: {
          id: randomUUID(), // Add the required id field
          employeeId: session.user.employeeId,
          date: today,
          clockIn: now,
          status: AttendanceStatus.PRESENT,
        },
      })
    } else if (action === 'clockOut') {
      if (!attendance) {
        return NextResponse.json(
          { error: "No clock-in record found" },
          { status: 400 }
        )
      }

      attendance = await prisma.attendance.update({
        where: { id: attendance.id },
        data: { clockOut: now },
      })
    }

    return NextResponse.json(attendance)
  } catch (error) {
    console.error("Error updating attendance:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
