import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { MessageStatus } from '@prisma/client'
import { getServerSession } from '@/lib/server-session'

export async function GET(request: Request) {
  try {
    const session = await getServerSession()
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const notifications = []

    // Get task notifications for all roles
    const recentTasks = await prisma.task.findMany({
      where: {
        assignedToId: session.user.employeeId,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      },
      include: {
        creator: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    notifications.push(...recentTasks.map(task => ({
      id: `task-${task.id}`,
      title: 'New Task Assignment',
      message: `${task.creator.name} assigned you a task: ${task.title}`,
      type: 'TASK_ASSIGNED',
      targetRole: ['EMPLOYEE'],
      metadata: {
        taskId: task.id,
        title: task.title,
        priority: task.priority,
        status: task.status,
        assignedBy: task.creator.name
      },
      createdAt: task.createdAt.toISOString(),
      expiresAt: task.dueDate?.toISOString() || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    })))

    // Add message notifications
    if (session?.user?.employeeId || session?.user?.id) {
      const recentMessages = await prisma.message.findMany({
        where: {
          receiverId: session.user.employeeId || session.user.id.toString(),
          status: MessageStatus.SENT,
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      notifications.push(...recentMessages.map(message => ({
        id: `message-${message.id}`,
        title: 'New Message',
        message: `${message.sender.name}: ${message.content.substring(0, 50)}${message.content.length > 50 ? '...' : ''}`,
        type: 'NEW_MESSAGE',
        targetRole: ['ADMIN', 'MANAGER', 'EMPLOYEE'],
        metadata: {
          senderId: message.senderId,
          senderName: message.sender.name,
          messageId: message.id,
          preview: message.content.substring(0, 50)
        },
        createdAt: message.createdAt.toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      })));
    }

    // For ADMIN/MANAGER: Get pending leave requests
    if (role === 'ADMIN' || role === 'MANAGER') {
      const pendingLeaveRequests = await prisma.leaveRequest.findMany({
        where: {
          status: 'PENDING',
          Employee: {
            companyId: session.user.currentCompanyId
          }
        },
        include: {
          Employee: {
            select: {
              name: true,
              id: true,
              department: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      notifications.push(...pendingLeaveRequests.map(request => ({
        id: `leave-${request.id}`,
        title: 'Leave Request Pending',
        message: `${request.Employee.name} (${request.Employee.department}) has requested ${request.type} leave from ${request.startDate.toLocaleDateString()} to ${request.endDate.toLocaleDateString()}\n\nReason: ${request.reason}`,
        type: 'LEAVE_REQUEST',
        targetRole: ['ADMIN', 'MANAGER'],
        metadata: {
          requestId: request.id,
          employeeId: request.Employee.id,
          employeeName: request.Employee.name,
          department: request.Employee.department,
          startDate: request.startDate,
          endDate: request.endDate,
          type: request.type,
          reason: request.reason,
          status: request.status
        },
        createdAt: request.createdAt.toISOString(),
        expiresAt: request.endDate.toISOString()
      })))
    }

    // For EMPLOYEE: Get their recent leave request updates
    if (role === 'EMPLOYEE') {
      const recentLeaveRequests = await prisma.leaveRequest.findMany({
        where: {
          employeeId: session.user.employeeId,
          status: {
            in: ['APPROVED', 'REJECTED']
          },
          actionAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        },
        include: {
          Actor: {
            select: {
              name: true
            }
          }
        },
        orderBy: {
          actionAt: 'desc'
        }
      })

      notifications.push(...recentLeaveRequests.map(request => ({
        id: `leave-status-${request.id}`,
        title: `Leave Request ${request.status}`,
        message: `Your leave request has been ${request.status.toLowerCase()}${request.comment ? `: ${request.comment}` : ''}`,
        type: request.status === 'APPROVED' ? 'LEAVE_APPROVED' : 'LEAVE_REJECTED',
        targetRole: ['EMPLOYEE'],
        metadata: {
          requestId: request.id,
          status: request.status,
          comment: request.comment,
          actionBy: request.Actor?.name
        },
        createdAt: request.actionAt?.toISOString() || request.updatedAt.toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      })))
    }
    
    // Sort all notifications by creation date
    notifications.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    
    return NextResponse.json(notifications)

  } catch (error) {
    console.error('Notifications generation error:', 
      error instanceof Error ? error.message : 'Unknown error'
    )
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch notifications',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
