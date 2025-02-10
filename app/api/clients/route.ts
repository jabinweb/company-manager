import { NextRequest } from "next/server"
import { getServerSession } from '@/lib/server-session'
import { prisma } from "@/lib/prisma"

export async function GET(
  _request: NextRequest
): Promise<Response> {
  try {
    const session = await getServerSession()
    if (!session?.user?.currentCompanyId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const clients = await prisma.client.findMany({
      where: { companyId: session.user.currentCompanyId },
      orderBy: { createdAt: "desc" }
    })

    return new Response(JSON.stringify(clients), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error("Error fetching clients:", error)
    return new Response(JSON.stringify({
      error: "Failed to fetch clients",
      details: error instanceof Error ? error.message : undefined
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export async function POST(
  request: NextRequest
): Promise<Response> {
  try {
    const session = await getServerSession()
    if (!session?.user?.role || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const body = await request.json()
    const newClient = await prisma.client.create({
      data: {
        ...body,
        companyId: session.user.currentCompanyId!
      }
    })

    return new Response(JSON.stringify(newClient), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error("Error creating client:", error)
    return new Response(JSON.stringify({
      error: "Failed to create client",
      details: error instanceof Error ? error.message : undefined
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}