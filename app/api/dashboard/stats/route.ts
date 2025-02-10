import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from '@/lib/server-session'

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user?.currentCompanyId) {
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
        where: { companyId: session.user.currentCompanyId }
      }),
      prisma.client.count({
        where: { companyId: session.user.currentCompanyId }
      }),
      prisma.product.count({
        where: { companyId: session.user.currentCompanyId }
      }),
      prisma.project.count({
        where: { companyId: session.user.currentCompanyId }
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
    console.error('Dashboard stats error:', error)
    return new Response(JSON.stringify({
      error: "Failed to fetch stats",
      details: error instanceof Error ? error.message : undefined
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}