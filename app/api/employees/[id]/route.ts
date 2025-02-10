import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from '@/lib/server-session'
;

import { Prisma } from "@prisma/client";
import { UTApi } from "uploadthing/server";
import { NextRequest } from 'next/server'

// Initialize the UploadThing API client
const utapi = new UTApi();

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const id = (await params).id
    const session = await getServerSession()
    if (!session?.user?.primaryCompanyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const employee = await prisma.employee.findUnique({
      where: { id: (await params).id }
    });

    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(employee);

  } catch (error) {
    console.error("Error fetching employee:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to fetch employee",
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
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
    const body = await request.json()

    const employee = await prisma.employee.update({
      where: { id },
      data: body,
      include: {
        Company_Employee_companyIdToCompany: true,
        user: true
      }
    })

    return new Response(JSON.stringify(employee), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Employee update error:', error)
    return new Response(JSON.stringify({ 
      error: 'Failed to update employee',
      details: error instanceof Error ? error.message : undefined
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }>}
): Promise<Response> {
  try {
    const id = (await params).id
    const session = await getServerSession()
    
    if (!session?.user?.primaryCompanyId) {
      return NextResponse.json({ 
        error: "Unauthorized",
        message: "You must be logged in to delete an employee" 
      }, { status: 401 });
    }

    // Get employee data before deletion to access avatar URL
    const employee = await prisma.employee.findUnique({
      where: {
        id,
        companyId: session.user.currentCompanyId,
      },
      select: {
        avatar: true,
      }
    });

    if (!employee) {
      return NextResponse.json({ 
        error: "Not found",
        message: "Employee not found" 
      }, { status: 404 });
    }

    // Delete the employee from the database
    await prisma.employee.delete({
      where: {
        id,
        companyId: session.user.currentCompanyId,
      },
    });

    // If employee had an avatar, delete it from UploadThing
    if (employee.avatar) {
      try {
        // Extract fileKey from the URL
        const fileKey = employee.avatar.split('/').pop();
        if (fileKey) {
          await utapi.deleteFiles(fileKey);
        }
      } catch (error) {
        console.error("Failed to delete avatar file:", error);
        // Continue even if file deletion fails
      }
    }

    return NextResponse.json({ 
      message: "Employee deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting employee:", error);
    return NextResponse.json({ 
      error: "Failed to delete employee",
      message: "An error occurred while deleting the employee" 
    }, { status: 500 });
  }
}