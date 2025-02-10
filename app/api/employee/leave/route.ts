import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/server-session'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { randomUUID } from 'crypto' // Add this import

// Validation schema for leave request
const leaveRequestSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  type: z.string(),
  reason: z.string().min(1),
})

export async function GET(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const leaveRequests = await prisma.leaveRequest.findMany({
      where: {
        employeeId: session.user.employeeId
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(leaveRequests)
  } catch (error) {
    console.error('Leave request fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch leave requests' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.employeeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = leaveRequestSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid request data', details: validation.error }, { status: 400 })
    }

    const { startDate, endDate, type, reason } = validation.data

    // Create leave request with proper typing
    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        id: randomUUID(), // Add required id field
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        type,
        reason,
        status: 'PENDING',
        employeeId: session.user.employeeId, // Now properly typed as string
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    return NextResponse.json(leaveRequest)
  } catch (error) {
    console.error('Leave request error:', error)
    return NextResponse.json({ 
      error: 'Failed to create leave request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.employeeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, status, comment } = body

    const updatedRequest = await prisma.$transaction(async (tx) => {
      // Update the leave request
      const request = await tx.leaveRequest.update({
        where: { id },
        data: {
          status,
          comment,
          actionById: session?.user?.employeeId,
          actionAt: new Date(),
          updatedAt: new Date()
        }
      })

      return request
    })

    return NextResponse.json(updatedRequest)
  } catch (error) {
    console.error('Leave request update error:', error)
    return NextResponse.json({ error: 'Failed to update leave request' }, { status: 500 })
  }
}
