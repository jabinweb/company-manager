import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from '@/lib/server-session'
import { prisma } from "@/lib/prisma";


export async function GET() {
  try {
    const session = await getServerSession()

    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const companies = await prisma.company.findMany({
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
      orderBy: {
        createdAt: 'desc'
      },
    });

    return NextResponse.json({
      success: true,
      data: companies
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error('Error fetching companies:', errorMessage);
    
    return NextResponse.json(
      { success: false, error: "Failed to fetch companies" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({
        success: false,
        message: "Unauthorized"
      }, { 
        status: 401 
      });
    }

    const body = await request.json().catch(() => null);

    if (!body || !body.name || !body.website) {
      return NextResponse.json({
        success: false,
        message: "Missing required fields"
      }, { 
        status: 400 
      });
    }

    const company = await prisma.company.create({
      data: {
        name: body.name.trim(),
        website: body.website.toLowerCase().trim(),
        status: 'PENDING'
      }
    });

    return NextResponse.json({
      success: true,
      data: company
    }, { 
      status: 201 
    });

  } catch (error) {
    console.error('Error creating company:', error);

    return NextResponse.json({
        success: false,
        message: "Failed to create company",
        error: error instanceof Error ? error.message : "Unknown error"
    }, { 
      status: 500 
    });
  }
}