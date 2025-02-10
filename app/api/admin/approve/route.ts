import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from '@/lib/server-session'
import { prisma } from "@/lib/prisma";
import { CompanyStatus, UserStatus, EmployeeStatus, Prisma } from "@prisma/client";

export async function GET() {
  try {
    const session = await getServerSession()

    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Updated queries to match schema relationships
    const [pendingCompanies, pendingUsers] = await Promise.all([
      prisma.company.findMany({
        where: { status: CompanyStatus.PENDING },
        select: {
          id: true,
          name: true,
          website: true,
          status: true,
          createdAt: true,
          adminId: true,
          Employee_Company_adminIdToEmployee: {
            select: {
              name: true,
              email: true,
            }
          }
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.findMany({
        where: {
          AND: [
            { status: UserStatus.PENDING },
            { role: "ADMIN" }
          ]
        },
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          createdAt: true,
          Company_User_primaryCompanyIdToCompany: {
            select: {
              name: true,
              website: true,
            }
          }
        },
        orderBy: { createdAt: "desc" },
      })
    ]);

    // Transform the data to match the expected format
    const formattedCompanies = pendingCompanies.map(company => ({
      id: company.id,
      name: company.name,
      website: company.website,
      status: company.status,
      createdAt: company.createdAt,
      admin: company.Employee_Company_adminIdToEmployee
    }));

    const formattedUsers = pendingUsers.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      status: user.status,
      createdAt: user.createdAt,
      primaryCompany: user.Company_User_primaryCompanyIdToCompany
    }));

    return NextResponse.json({
      success: true,
      data: {
        companies: formattedCompanies,
        users: formattedUsers
      }
    });

  } catch (error) {
    console.error("Error fetching pending items:", error instanceof Error ? error.message : "Unknown error");
    
    return NextResponse.json(
      { success: false, error: "Failed to fetch pending items" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, action, type } = body;

    if (!id || !action || !type) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newStatus = action === 'approve' ? UserStatus.ACTIVE : UserStatus.REJECTED;
    const companyStatus = action === 'approve' ? CompanyStatus.APPROVED : CompanyStatus.REJECTED;

    try {
      await prisma.$transaction(async (tx) => {
        if (type === 'company') {
          console.log('Updating company:', id, 'to status:', companyStatus); // Debug log

          // Update company status with correct relation names
          const company = await tx.company.update({
            where: { id: Number(id) },
            data: { status: companyStatus },
            include: {
              Employee_Employee_companyIdToCompany: true, // employees
              Employee_Company_adminIdToEmployee: true,   // admin
              UserCompany: {
                include: {
                  User: true
                }
              }
            }
          });

          console.log('Company updated:', company); // Debug log

          if (action === 'approve') {
            // Update admin user if exists
            if (company.Employee_Company_adminIdToEmployee?.userId) {
              await tx.user.update({
                where: { id: company.Employee_Company_adminIdToEmployee.userId },
                data: { status: UserStatus.ACTIVE }
              });
            }

            // Update all company users
            if (company.UserCompany.length > 0) {
              await tx.user.updateMany({
                where: {
                  id: {
                    in: company.UserCompany.map(uc => uc.userId)
                  }
                },
                data: { status: UserStatus.ACTIVE }
              });
            }

            // Update all employees
            if (company.Employee_Employee_companyIdToCompany.length > 0) {
              await tx.employee.updateMany({
                where: { companyId: company.id },
                data: { 
                  status: EmployeeStatus.ACTIVE,
                  isApproved: true 
                }
              });
            }
          }
        }

        if (type === 'user') {
          // Update user and related records with correct relation names
          const user = await tx.user.update({
            where: { id: Number(id) },
            data: { status: newStatus },
            include: {
              employeeProfile: true, // Changed from 'employee' to 'employeeProfile'
              Company_User_primaryCompanyIdToCompany: true // Changed from 'primaryCompany'
            }
          });

          if (action === 'approve' && user.employeeProfile) {
            // Update employee status using correct relation
            await tx.employee.update({
              where: { id: user.employeeProfile.id },
              data: { 
                status: 'ACTIVE',
                isApproved: true 
              }
            });

            // If user is admin, update company status
            if (user.role === 'ADMIN' && user.Company_User_primaryCompanyIdToCompany) {
              await tx.company.update({
                where: { id: user.Company_User_primaryCompanyIdToCompany.id },
                data: { status: 'APPROVED' }
              });
            }
          }
        }
      });

      // Fetch updated data with correct relation names
      const [updatedCompanies, updatedUsers] = await Promise.all([
        prisma.company.findMany({
          where: { status: CompanyStatus.PENDING },
          select: {
            id: true,
            name: true,
            website: true,
            status: true,
            createdAt: true,
            Employee_Company_adminIdToEmployee: {
              select: {
                name: true,
                email: true,
              }
            }
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.user.findMany({
          where: {
            AND: [
              { status: UserStatus.PENDING },
              { role: "ADMIN" }
            ]
          },
          select: {
            id: true,
            name: true,
            email: true,
            status: true,
            createdAt: true,
            Company_User_primaryCompanyIdToCompany: {
              select: {
                name: true,
                website: true,
              }
            }
          },
          orderBy: { createdAt: "desc" },
        })
      ]);

      // Transform data for response
      const formattedUsers = updatedUsers.map(user => ({
        ...user,
        primaryCompany: user.Company_User_primaryCompanyIdToCompany
      }));

      return NextResponse.json({
        success: true,
        message: `Successfully ${action}d the ${type}`,
        data: {
          companies: updatedCompanies,
          users: formattedUsers
        }
      });

    } catch (txError) {
      if (txError instanceof Prisma.PrismaClientKnownRequestError) {
        return NextResponse.json(
          { success: false, error: "Database operation failed" },
          { status: 400 }
        );
      }
      throw txError;
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error processing approval:", errorMessage);

    return NextResponse.json(
      { success: false, error: "Failed to process approval" },
      { status: 500 }
    );
  }
}