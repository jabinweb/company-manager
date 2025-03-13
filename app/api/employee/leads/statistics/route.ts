import { NextRequest } from 'next/server'
import { getServerSession } from '@/lib/server-session'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.employeeId) {
      return new Response('Unauthorized', { status: 401 })
    }

    const [
      totalLeads,
      wonLeads,
      activeLeads,
      upcomingFollowUps
    ] = await Promise.all([
      // Total leads count
      prisma.lead.count({
        where: { employeeId: session.user.employeeId }
      }),
      // Won leads count
      prisma.lead.count({
        where: {
          employeeId: session.user.employeeId,
          status: 'WON'
        }
      }),
      // Active leads (not WON or LOST)
      prisma.lead.count({
        where: {
          employeeId: session.user.employeeId,
          NOT: {
            status: { in: ['WON', 'LOST'] }
          }
        }
      }),
      // Upcoming follow-ups
      prisma.lead.findMany({
        where: {
          employeeId: session.user.employeeId,
          nextFollowUp: {
            gte: new Date()
          }
        },
        select: {
          id: true,
          title: true,
          nextFollowUp: true
        },
        orderBy: {
          nextFollowUp: 'asc'
        },
        take: 5
      })
    ])

    return new Response(JSON.stringify({
      totalLeads,
      wonLeads,
      activeLeads,
      upcomingFollowUps,
      conversionRate: totalLeads ? (wonLeads / totalLeads) * 100 : 0
    }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('[API] Lead statistics error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
