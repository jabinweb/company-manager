import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      console.log("Missing email or password"); // Debugging
      return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log("Invalid credentials: User not found"); // Debugging
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Invalid credentials: Password mismatch"); // Debugging
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const employee = await prisma.employee.findUnique({ where: { userId: user.id } });
    if (!employee) {
      console.log("Employee account not found"); // Debugging
      return NextResponse.json({ error: "Employee account not found" }, { status: 403 });
    }

    if (employee.status !== 'ACTIVE') {
      console.log(`Employee status is not ACTIVE; current status: ${employee.status}`); // Debugging
      return NextResponse.json({
        error: `Employee status is not ACTIVE; current status: ${employee.status}`
      }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      message: "Login successful",
      user: { id: user.id, email: user.email },
      employee: { id: employee.id, status: employee.status },
    });
  } catch (error) {
    console.error('Employee Login Error:', error ?? "No error data"); // Debugging
    return NextResponse.json({
      error: error instanceof Error ? error.message : "An unexpected error occurred"
    }, { status: 500 });
  }
}