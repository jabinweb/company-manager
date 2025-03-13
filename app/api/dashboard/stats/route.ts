import { NextRequest } from 'next/server'
import { getAuthFromRequest, unauthorized } from '@/lib/api-utils'
import { prisma } from '@/lib/prisma'
import { createApiHandler } from '@/lib/api-utils'

export const GET = createApiHandler(async (req: NextRequest) => {
  const auth = await getAuthFromRequest(req)
  
  if (!auth?.isValid) {
    return unauthorized()
  }

  try {
    const user = await getAuthFromRequest(req)
    if (!user?.currentCompanyId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const [
      employeesCount,
      clientsCount,
      productsCount,
      projectsCount
    ] = await Promise.all([
      prisma.employee.count({
        where: { companyId: user.currentCompanyId }
      }),
      prisma.client.count({
        where: { companyId: user.currentCompanyId }
      }),
      prisma.product.count({
        where: { companyId: user.currentCompanyId }
      }),
      prisma.project.count({
        where: { companyId: user.currentCompanyId }
      })
    ])

    return new Response(JSON.stringify({
      employees: employeesCount,
      clients: clientsCount,
      products: productsCount,
      projects: projectsCount
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('[Dashboard Stats] Error:', error)
    return new Response(JSON.stringify({ error: 'Failed to fetch stats' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})