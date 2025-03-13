import { NextRequest } from 'next/server'
import { getServerSession } from '@/lib/server-session'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.employeeId) {
      return new Response('Unauthorized', { status: 401 })
    }

    const searchParams = req.nextUrl.searchParams
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
    const month = parseInt(searchParams.get('month') || new Date().getMonth().toString())

    const payslips = await prisma.payslip.findMany({
      where: {
        employeeId: session.user.employeeId,
        year: year,
        month: month ? month : undefined
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return new Response(JSON.stringify(payslips), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('[API] Payroll error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
