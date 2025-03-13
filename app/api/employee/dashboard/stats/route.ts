import { getServerSession } from '@/lib/server-session'
import { prisma } from '@/lib/prisma'
import { LeadStatus, TaskStatus, AttendanceStatus } from '@prisma/client'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.employeeId) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Get today's date range
    const today = new Date()
    const startOfDay = new Date(today)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(today)
    endOfDay.setHours(23, 59, 59, 999)

    // Get last week for leads
    const lastWeek = new Date(today)
    lastWeek.setDate(lastWeek.getDate() - 7)

    const [
      totalLeads,
      newLeadsThisWeek,
      wonLeads,
      qualifiedLeads,
      activeTasks,
      upcomingTasks,
      pendingFollowUps,
      todayFollowUps,
      unreadMessages,
      todayAttendance
    ] = await Promise.all([
      // Total leads
      prisma.lead.count({
        where: { employeeId: session.user.employeeId }
      }),
      // New leads this week
      prisma.lead.count({
        where: {
          employeeId: session.user.employeeId,
          createdAt: { gte: lastWeek }
        }
      }),
      // Won leads
      prisma.lead.count({
        where: {
          employeeId: session.user.employeeId,
          status: LeadStatus.WON
        }
      }),
      // Qualified leads
      prisma.lead.count({
        where: {
          employeeId: session.user.employeeId,
          status: { in: [LeadStatus.QUALIFIED, LeadStatus.PROPOSAL, LeadStatus.NEGOTIATION] }
        }
      }),
      // Active tasks
      prisma.task.count({
        where: {
          assignedToId: session.user.employeeId,
          status: { in: [TaskStatus.TODO, TaskStatus.IN_PROGRESS] }
        }
      }),
      // Upcoming tasks
      prisma.task.count({
        where: {
          assignedToId: session.user.employeeId,
          status: TaskStatus.TODO,
          dueDate: { lte: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
        }
      }),
      // Pending follow-ups (using leadActivity)
      prisma.leadActivity.count({
        where: {
          employeeId: session.user.employeeId,
          type: 'FOLLOW_UP',
          completed: false,
        }
      }),
      // Today's follow-ups
      prisma.leadActivity.count({
        where: {
          employeeId: session.user.employeeId,
          type: 'FOLLOW_UP',
          completed: false,
          dueDate: {
            gte: startOfDay,
            lte: endOfDay
          }
        }
      }),
      // Unread messages
      prisma.message.count({
        where: {
          receiverId: session.user.employeeId,
          status: 'SENT' // Use status instead of readAt
        }
      }),
      // Today's attendance - Updated to match schema
      prisma.attendance.findFirst({
        where: {
          employeeId: session.user.employeeId,
          AND: [
            {
              createdAt: {
                gte: startOfDay,
              }
            },
            {
              createdAt: {
                lte: endOfDay,
              }
            }
          ]
        },
        select: {
          status: true,
          checkIn: true,
          checkOut: true,
          createdAt: true,
        }
      })
    ])

    const response = {
      totalLeads,
      newLeadsThisWeek,
      wonLeads,
      totalQualifiedLeads: qualifiedLeads,
      conversionRate: totalLeads ? ((wonLeads / totalLeads) * 100).toFixed(1) : 0,
      activeTasks,
      upcomingTasks,
      pendingFollowUps,
      todayFollowUps,
      unreadMessages,
      todayAttendance: todayAttendance || {
        status: AttendanceStatus.ABSENT,
        checkIn: null,
        checkOut: null,
        createdAt: null
      }
    }

    return new Response(JSON.stringify(response), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'private, max-age=60'
      }
    })
  } catch (error) {
    console.error('[API] Employee dashboard stats error:', error)
    return new Response(
      JSON.stringify({
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}
