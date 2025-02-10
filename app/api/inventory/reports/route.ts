import { getServerSession } from '@/lib/server-session'
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.primaryCompanyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'stock';
    const period = searchParams.get('period') || 'month';

    let startDate = new Date();
    switch (period) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    let reportData;
    switch (type) {
      case 'stock':
        reportData = await prisma.product.findMany({
          where: {
            companyId: session.user.currentCompanyId,
          },
          select: {
            name: true,
            quantity: true,
            price: true,
          },
        });
        break;

      case 'movement':
        reportData = await prisma.inventory.groupBy({
          by: ['type'],
          where: {
            companyId: session.user.currentCompanyId,
            createdAt: {
              gte: startDate,
            },
          },
          _sum: {
            quantity: true,
          },
        });
        break;

      case 'value':
        reportData = await prisma.product.aggregate({
          where: {
            companyId: session.user.currentCompanyId,
          },
          _sum: {
            quantity: true,
          },
          _avg: {
            price: true,
          },
        });
        break;
    }

    return NextResponse.json({ data: reportData });
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
