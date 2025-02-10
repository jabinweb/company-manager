import { NextResponse } from "next/server"
import { getServerSession } from '@/lib/server-session'
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user?.currentCompanyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [departments, statuses] = await Promise.all([
      prisma.employee.findMany({
        where: { companyId: session.user.currentCompanyId },
        select: { department: true },
        distinct: ['department'],
      }),
      prisma.employee.findMany({
        where: { companyId: session.user.currentCompanyId },
        select: { status: true },
        distinct: ['status'],
      }),
    ])

    const metadata = {
      departments: departments.map(d => ({
        label: d.department,
        value: d.department
      })),
      statuses: statuses.map(s => ({
        label: s.status.replace(/_/g, ' '),
        value: s.status
      })),
      employmentTypes: [
        { label: 'Full Time', value: 'FULL_TIME' },
        { label: 'Part Time', value: 'PART_TIME' },
        { label: 'Contract', value: 'CONTRACT' },
        { label: 'Intern', value: 'INTERN' },
      ]
    }

    return NextResponse.json(metadata)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch metadata." }, 
      { status: 500 }
    );
  }
}