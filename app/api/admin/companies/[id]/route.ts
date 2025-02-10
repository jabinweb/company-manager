import { NextRequest } from "next/server"
import { getServerSession } from '@/lib/server-session'
import { prisma } from "@/lib/prisma"
import { CompanyStatus, Prisma } from "@prisma/client"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const session = await getServerSession()
    if (!session?.user?.role || session.user.role !== "SUPER_ADMIN") {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const id = (await params).id
    const companyId = parseInt(id)

    if (isNaN(companyId)) {
      return new Response(JSON.stringify({ error: "Invalid company ID" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const body = await request.json()
    const updatedCompany = await prisma.company.update({
      where: { id: companyId },
      data: {
        name: body.name,
        website: body.website,
        status: body.status as CompanyStatus,
      },
      include: {
        Employee_Company_adminIdToEmployee: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        UserCompany: {
          include: {
            User: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          }
        }
      }
    })

    return new Response(JSON.stringify(updatedCompany), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Company update error:', error)
    return new Response(JSON.stringify({
      error: 'Failed to update company',
      details: error instanceof Error ? error.message : undefined
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const session = await getServerSession()
    if (!session?.user?.role || session.user.role !== "SUPER_ADMIN") {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const id = (await params).id
    const companyId = parseInt(id)

    if (isNaN(companyId)) {
      return new Response(JSON.stringify({ error: "Invalid company ID" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    await prisma.$transaction(async (tx) => {
      // Delete all related records in order
      await tx.userCompanyRole.deleteMany({ where: { companyId } })
      await tx.userCompany.deleteMany({ where: { companyId } })
      await tx.employee.deleteMany({ where: { companyId } })
      await tx.company.delete({ where: { id: companyId } })
    })

    return new Response(JSON.stringify({ message: "Company deleted successfully" }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Company deletion error:', error)
    
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return new Response(JSON.stringify({ error: "Company not found" }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({
      error: 'Failed to delete company',
      details: error instanceof Error ? error.message : undefined
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}