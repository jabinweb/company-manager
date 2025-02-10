import { NextRequest } from 'next/server'
import { getServerSession } from '@/lib/server-session'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const id = (await params).id
    const companyId = parseInt(id)

    if (isNaN(companyId)) {
      return new Response(JSON.stringify({ error: 'Invalid company ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        name: true,
        website: true, // Changed from domain to website
        logo: true,
        status: true,
        createdAt: true,
      },
    })

    if (!company) {
      return new Response(JSON.stringify({ error: 'Company not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify(company), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch company' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const id = (await params).id
    const companyId = parseInt(id)

    if (isNaN(companyId)) {
      return new Response(JSON.stringify({ error: 'Invalid company ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const data = await request.json()

    const company = await prisma.company.update({
      where: {
        id: companyId,
      },
      data: {
        name: data.name,
        website: data.website, // Changed from domain to website
        logo: data.logo,
        status: data.status,
      },
    })

    return new Response(JSON.stringify(company), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to update company' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}