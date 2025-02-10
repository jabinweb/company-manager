import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from '@/lib/server-session'
import { prisma } from '@/lib/prisma'
import { TaskPriority, TaskCategory, TaskStatus } from '@prisma/client'
import type { Prisma } from '@prisma/client'
import { createTaskSchema } from "@/lib/validations/task";

export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    if (!session.user.employeeId) {
      return NextResponse.json(
        { success: false, error: 'Employee ID not found in session' },
        { status: 400 }
      )
    }

    const body = await request.json()
    console.log('Creating task with data:', body)

    const validation = createTaskSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: validation.error.format()
      }, { status: 400 })
    }

    // Verify the assigned employee exists and belongs to the same company
    const assignedEmployee = await prisma.employee.findUnique({
      where: {
        id: validation.data.assignedToId,
        companyId: session.user.currentCompanyId
      }
    })

    if (!assignedEmployee) {
      return NextResponse.json({
        success: false,
        error: 'Invalid assignee'
      }, { status: 400 })
    }

    // Ensure companyId exists
    if (!session.user.currentCompanyId) {
      return new Response(JSON.stringify({ error: 'Company ID not found' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const now = new Date()
    const taskData = {
      title: validation.data.title,
      description: validation.data.description || '',
      dueDate: validation.data.dueDate ? new Date(validation.data.dueDate) : null,
      priority: validation.data.priority as TaskPriority,
      category: validation.data.category as TaskCategory,
      assignee: {
        connect: { id: validation.data.assignedToId }
      },
      creator: {
        connect: { id: session.user.employeeId }
      },
      company: {
        connect: { id: session.user.currentCompanyId }
      },
      status: TaskStatus.TODO,
      progress: 0,
      tags: validation.data.tags || [],
      metadata: validation.data.metadata || {},
      updatedAt: now
    }

    console.log('Final task data:', taskData)

    const task = await prisma.task.create({
      data: taskData,
      include: {
        assignee: {
          select: {
            name: true,
            department: true
          }
        },
        creator: {
          select: {
            name: true
          }
        }
      }
    })

    console.log('Task created successfully:', task.id)

    return NextResponse.json({
      success: true,
      data: task
    })

  } catch (error) {
    // Safe error logging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorObject = {
      message: errorMessage,
      type: error instanceof Error ? error.constructor.name : typeof error
    }
    
    console.error('Task creation error:', JSON.stringify(errorObject))
    
    return NextResponse.json({
      success: false,
      error: 'Failed to create task',
      details: errorMessage
    }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    // If type is 'notifications', return assigned tasks as notifications
    if (type === 'notifications') {
      const tasks = await prisma.task.findMany({
        where: {
          assignedToId: session.user.employeeId,
          // Optionally filter for recent tasks (e.g., last 7 days)
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        },
        select: {
          id: true,
          title: true,
          priority: true,
          status: true,
          createdAt: true,
          creator: {
            select: {
              name: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 50 // Limit to recent 50 notifications
      })

      return NextResponse.json({
        success: true,
        data: tasks.map(task => ({
          id: task.id,
          title: task.title,
          message: `Task assigned by ${task.creator.name}`,
          priority: task.priority,
          status: task.status,
          timestamp: task.createdAt,
          type: 'TASK_ASSIGNMENT'
        }))
      })
    }

    const status = searchParams.get('status') as TaskStatus | null
    const priority = searchParams.get('priority') as TaskPriority | null
    const category = searchParams.get('category') as TaskCategory | null
    const assignedTo = searchParams.get('assignedTo')

    const where: Prisma.TaskWhereInput = {
      companyId: session.user.currentCompanyId,
      ...(status && { status }),
      ...(priority && { priority }),
      ...(category && { category }),
      ...(assignedTo && { assignedToId: assignedTo })
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: {
          select: {
            name: true,
            department: true,
            avatar: true
          }
        },
        creator: {
          select: {
            name: true
          }
        },
        _count: {
          select: {
            comments: true,
            subTasks: true
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({
      success: true,
      data: tasks
    })

  } catch (error) {
    console.error('Tasks fetch error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch tasks',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
