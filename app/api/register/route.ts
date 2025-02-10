import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { Role, UserStatus, CompanyStatus, Prisma } from "@prisma/client";
import { randomUUID } from "crypto";

// Define validation schema matching your Prisma schema
const registerSchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  website: z.string().min(2, "Website is required"),
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

export async function POST(request: NextRequest) {
  try {
    // Validate request body
    const body = await request.json().catch(() => null);
    
    if (!body) {
      return NextResponse.json({
        success: false,
        message: "Invalid request body"
      }, { status: 400 });
    }

    // Validate against schema
    const validatedData = registerSchema.parse(body);

    // Format website URL
    const websiteUrl = validatedData.website.toLowerCase().trim()
      .replace(/^https?:\/\//, '')
      .replace(/\/$/, '');

    // Check for existing user or company
    const [existingUser, existingCompany] = await Promise.all([
      prisma.user.findUnique({
        where: { email: validatedData.email.toLowerCase() }
      }),
      prisma.company.findUnique({
        where: { website: websiteUrl }
      })
    ]);

    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: "Email already registered"
      }, { status: 400 });
    }

    if (existingCompany) {
      return NextResponse.json({
        success: false,
        message: "Company already registered"
      }, { status: 400 });
    }

    // Create records in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create company first
      const company = await tx.company.create({
        data: {
          name: validatedData.companyName,
          website: websiteUrl,
          status: CompanyStatus.PENDING,
        }
      });

      // Create initial admin employee record
      const employee = await tx.employee.create({
        data: {
          id: randomUUID(),
          employeeId: `ADM${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          name: validatedData.name,
          email: validatedData.email.toLowerCase(),
          phone: '',
          jobTitle: 'Admin',
          department: 'Administration',
          role: 'ADMIN',
          status: 'PENDING',
          companyId: company.id,
          address: {
            street: '',
            city: '',
            state: '',
            country: '',
            zipCode: ''
          },
          updatedAt: new Date()
        }
      });

      // Create user with company associations
      const user = await tx.user.create({
        data: {
          name: validatedData.name,
          email: validatedData.email.toLowerCase(),
          password: await bcrypt.hash(validatedData.password, 10),
          role: Role.ADMIN,
          status: UserStatus.PENDING,
          primaryCompanyId: company.id,
          companyId: company.id,
          // Link to employee profile
          employeeProfile: {
            connect: {
              id: employee.id
            }
          },
          // Create UserCompany relation
          UserCompany: {
            create: {
              id: randomUUID(),
              companyId: company.id
            }
          },
          // Create UserCompanyRole relation
          UserCompanyRole: {
            create: {
              id: randomUUID(),
              companyId: company.id,
              role: Role.ADMIN,
              assignedById: employee.id, // Use the created employee's ID
              updatedAt: new Date()
            }
          }
        }
      });

      // Update employee with user ID
      await tx.employee.update({
        where: { id: employee.id },
        data: { userId: user.id }
      });

      return { user, company, employee };
    });

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Registration successful! Please wait for admin approval.",
      data: {
        userId: result.user.id,
        companyId: result.company.id
      }
    }, { status: 201 });

  } catch (error) {
    console.error("Registration failed:", error)

    // Proper error type checking
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("Registration error details:", {
        name: error.name,
        message: error.message,
        code: error.code,
        meta: error.meta
      })

      // Handle specific Prisma errors
      if (error.code === 'P2002') {
        return NextResponse.json({
          success: false,
          error: "Email already registered"
        }, { status: 409 })
      }
    }

    // Generic error response
    return NextResponse.json({
      success: false,
      error: "Registration failed",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
