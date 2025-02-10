import { NextResponse } from "next/server"
import { getServerSession } from '@/lib/server-session'

import { prisma } from "@/lib/prisma"
import { LeaveStatus } from "@prisma/client"
import { randomUUID } from "crypto"

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user?.employeeId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const leaveRequests = await prisma.leaveRequest.findMany({
      where: {
        employeeId: session.user.employeeId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        type: true,
        reason: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json(leaveRequests)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch leave requests" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.employeeId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { startDate, endDate, reason, type } = body

    if (!startDate || !endDate || !reason || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        id: randomUUID(),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        type,
        reason,
        status: LeaveStatus.PENDING,
        employeeId: session.user.employeeId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    })

    return NextResponse.json(leaveRequest)
  } catch (error) {
    console.error("Error creating leave request:", error)
    return NextResponse.json(
      { error: "Failed to create leave request" },
      { status: 500 }
    )
  }
}