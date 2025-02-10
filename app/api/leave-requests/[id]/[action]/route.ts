import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/server-session'
import { prisma } from '@/lib/prisma'


interface RouteParams {
  params: Promise<{ 
    id: string;
    action: 'approve' | 'reject';
  }>;
}

export async function PUT(
  request: Request,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const paramsData = await params
    const { id, action } = paramsData
    const { comment } = await request.json()

    // Validate action
    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ message: 'Invalid action' }, { status: 400 })
    }

    // Check if leave request exists and is pending
    const existingRequest = await prisma.leaveRequest.findUnique({
      where: { id },
      include: {
        Employee: {
          select: {
            name: true,
            companyId: true
          }
        }
      }
    })

    if (!existingRequest) {
      return NextResponse.json({ message: 'Leave request not found' }, { status: 404 })
    }

    if (existingRequest.status !== 'PENDING') {
      return NextResponse.json(
        { message: 'Leave request not found or already processed' },
        { status: 400 }
      )
    }

    // Update the leave request
    const updatedRequest = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status: action === 'approve' ? 'APPROVED' : 'REJECTED',
        comment,
        actionById: session.user.employeeId,
        actionAt: new Date(),
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: `Leave request ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      data: updatedRequest
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Leave request action error:', { message: errorMessage })
    
    return NextResponse.json({ 
      success: false,
      message: 'Failed to process leave request',
      error: errorMessage 
    }, { 
      status: 500 
    })
  }
}