import { NextRequest } from 'next/server'
import { getServerSession } from '@/lib/server-session'
import { prisma } from '@/lib/prisma'
import { LeadStatus } from '@prisma/client'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.employeeId) {
      return new Response('Unauthorized', { status: 401 })
    }

    const leads = await prisma.lead.findMany({
      where: {
        employeeId: session.user.employeeId,
        OR: [
          {
            nextFollowUp: {
              lte: new Date(Date.now() + 24 * 60 * 60 * 1000) // Next 24 hours
            }
          },
          {
            lastContactedAt: {
              lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Not contacted in 7 days
            },
            NOT: {
              status: {
                in: [LeadStatus.WON, LeadStatus.LOST]
              }
            }
          }
        ]
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            avatar: true,
            email: true
          }
        },
        activities: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            activities: true,
            documents: true
          }
        }
      },
      orderBy: [
        { nextFollowUp: 'asc' },
        { lastContactedAt: 'asc' }
      ]
    })

    return new Response(JSON.stringify({ leads }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('[API] Follow-up leads error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
