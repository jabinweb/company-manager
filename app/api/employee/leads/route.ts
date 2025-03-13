import { NextRequest } from 'next/server'
import { getServerSession } from '@/lib/server-session'
import { prisma } from '@/lib/prisma'
import { LeadStatus, Priority } from '@prisma/client'
import { leadsCache } from '@/lib/lead/cache'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.employeeId) {
      return new Response('Unauthorized', { status: 401 })
    }

    const searchParams = req.nextUrl.searchParams
    const cacheKey = `leads:${session.user.employeeId}:${searchParams.toString()}`

    // Try to get from memory cache
    const cached = leadsCache.get(cacheKey)
    if (cached) {
      return new Response(JSON.stringify(cached), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'private, max-age=30'
        }
      })
    }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where: {
          employeeId: session.user.employeeId,
          status: searchParams.has('status') ? { 
            in: searchParams.getAll('status') as LeadStatus[] 
          } : undefined,
          priority: searchParams.has('priority') ? {
            in: searchParams.getAll('priority') as Priority[]
          } : undefined
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
            orderBy: { createdAt: 'desc' },
            take: 1
          },
          _count: {
            select: {
              activities: true,
              documents: true
            }
          }
        },
        orderBy: { updatedAt: 'desc' }
      }),
      prisma.lead.count({
        where: {
          employeeId: session.user.employeeId
        }
      })
    ])

    const response = {
      data: leads,
      meta: {
        total,
        page: parseInt(searchParams.get('page') || '1'),
        limit: parseInt(searchParams.get('limit') || '10')
      }
    }

    // Cache the result in memory
    leadsCache.set(cacheKey, response)

    return new Response(JSON.stringify(response), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'private, max-age=30'
      }
    })
  } catch (error) {
    console.error('[API] Employee leads error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
