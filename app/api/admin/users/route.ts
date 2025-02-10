import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from '@/lib/server-session'
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const users = await prisma.user.findMany({
      where: {
        role: { not: Role.SUPER_ADMIN }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        Company_User_primaryCompanyIdToCompany: {
          select: {
            id: true,
            name: true,
            status: true,
          }
        },
        UserCompany: {
          select: {
            Company: {
              select: {
                id: true,
                name: true,
                status: true,
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform the data to match expected format
    const transformedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      primaryCompany: user.Company_User_primaryCompanyIdToCompany,
      companies: user.UserCompany.map(uc => uc.Company)
    }));

    return NextResponse.json({
      success: true,
      data: transformedUsers
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error('Error fetching users:', errorMessage);
    
    return NextResponse.json(
      { success: false, error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        Company_User_primaryCompanyIdToCompany: {
          select: {
            id: true,
            name: true,
            status: true,
          }
        },
        UserCompany: {
          select: {
            Company: {
              select: {
                id: true,
                name: true,
                status: true,
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        ...updatedUser,
        primaryCompany: updatedUser.Company_User_primaryCompanyIdToCompany,
        companies: updatedUser.UserCompany.map(uc => uc.Company)
      }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error('Error updating user:', errorMessage);
    
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to update user",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
