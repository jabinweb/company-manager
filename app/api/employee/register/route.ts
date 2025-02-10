import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Prisma, Role, EmployeeRole, EmployeeStatus, EmploymentType } from "@prisma/client";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log("Received registration data:", data);

    // Find company
    const company = await prisma.company.findFirst({
      where: { 
        name: data.company,
        status: 'APPROVED'
      }
    });

    if (!company) {
      return NextResponse.json({
        success: false,
        error: "Company not found or not approved"
      }, { status: 404 });
    }

    // Create user and employee in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: await bcrypt.hash(data.password, 10),
          role: Role.EMPLOYEE,
          status: 'PENDING',
          companyId: company.id,
          primaryCompanyId: company.id,
        }
      });

      // Create employee
      const employee = await tx.employee.create({
        data: {
          id: randomUUID(),
          employeeId: `EMP${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          name: data.name,
          email: data.email,
          phone: '',
          jobTitle: 'Employee',
          department: 'General',
          companyId: company.id,
          userId: user.id,
          role: EmployeeRole.EMPLOYEE,
          employmentType: EmploymentType.FULL_TIME,
          status: EmployeeStatus.PENDING,
          isApproved: false,
          dateJoined: new Date(),
          updatedAt: new Date(),
          address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: ''
          }
        }
      });

      // Create user company role
      await tx.userCompanyRole.create({
        data: {
          id: randomUUID(),
          userId: user.id,
          companyId: company.id,
          role: Role.EMPLOYEE,
          assignedById: employee.id,
          updatedAt: new Date()
        }
      });

      return { user, employee };
    });

    return NextResponse.json({
      success: true,
      message: "Registration successful",
      data: {
        employeeId: result.employee.employeeId,
        email: result.employee.email,
        status: result.employee.status
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({
        success: false,
        error: "Registration failed",
        details: error.message
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: "Registration failed",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
