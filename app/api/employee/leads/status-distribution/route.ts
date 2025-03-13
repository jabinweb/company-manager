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

    const leads = await prisma.lead.groupBy({
      by: ['status'],
      where: {
        employeeId: session.user.employeeId
      },
      _count: true
    })

    const distribution = leads.reduce((acc, { status, _count }) => ({
      ...acc,
      [status]: _count
    }), Object.values(LeadStatus).reduce((acc, status) => ({
      ...acc,
      [status]: 0
    }), {}))

    return new Response(JSON.stringify(distribution), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('[API] Lead status distribution error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
