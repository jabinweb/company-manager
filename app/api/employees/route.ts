// /app/api/employees/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/server-session";

// GET: Fetch employees with optional filters.
export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Different queries based on user role
    let employees = [];
    const companyId = session.user.currentCompanyId || session.user.primaryCompanyId;

    if (session.user.role === 'SUPER_ADMIN') {
      employees = await prisma.employee.findMany({
        orderBy: { name: 'asc' }
      });
    } else {
      employees = await prisma.employee.findMany({
        where: {
          companyId,
          NOT: { id: session.user.employeeId } // Exclude current user
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatar: true,
          department: true,
          dateJoined: true,
          status: true
        },
        orderBy: { name: 'asc' }
      });
    }

    console.log('Fetched employees:', employees);
    
    
    // Return array directly instead of wrapping in data property
    return NextResponse.json(employees);

  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json(
      { error: "Failed to fetch employees" },
      { status: 500 }
    );
  }
}

// POST: Create a new employee.
export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.currentCompanyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    // Validate required fields.
    if (!data.name || !data.email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    const employee = await prisma.employee.create({
      data: {
        ...data,
        companyId: session.user.currentCompanyId,
        status: "ACTIVE",
      },
    });

    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    console.error(
      "Error creating employee:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      { error: "Failed to create employee" },
      { status: 500 }
    );
  }
}
