import { NextRequest } from 'next/server';
import { getServerSession } from '@/lib/server-session';
import { prisma } from '@/lib/prisma';
import { LeadStatus } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.employeeId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      currentMonthLeads,
      lastMonthLeads,
      currentMonthWonLeads,
      lastMonthWonLeads,
      totalLeads
    ] = await Promise.all([
      prisma.lead.count({
        where: {
          employeeId: session.user.employeeId,
          createdAt: { gte: thisMonth }
        }
      }),
      prisma.lead.count({
        where: {
          employeeId: session.user.employeeId,
          createdAt: {
            gte: lastMonth,
            lt: thisMonth
          }
        }
      }),
      prisma.lead.count({
        where: {
          employeeId: session.user.employeeId,
          status: LeadStatus.WON,
          updatedAt: { gte: thisMonth }
        }
      }),
      prisma.lead.count({
        where: {
          employeeId: session.user.employeeId,
          status: LeadStatus.WON,
          updatedAt: {
            gte: lastMonth,
            lt: thisMonth
          }
        }
      }),
      prisma.lead.count({
        where: {
          employeeId: session.user.employeeId
        }
      })
    ]);

    // Calculate metrics
    const leadsChange = lastMonthLeads 
      ? ((currentMonthLeads - lastMonthLeads) / lastMonthLeads) * 100 
      : 0;

    const conversionRate = currentMonthLeads 
      ? (currentMonthWonLeads / currentMonthLeads) * 100
      : 0;

    const lastMonthConversionRate = lastMonthLeads 
      ? (lastMonthWonLeads / lastMonthLeads) * 100 
      : 0;

    const conversionChange = lastMonthConversionRate 
      ? ((conversionRate - lastMonthConversionRate) / lastMonthConversionRate) * 100
      : 0;

    return new Response(
      JSON.stringify({
        totalLeads,
        leadsChange: Number(leadsChange.toFixed(1)),
        conversionRate: Number(conversionRate.toFixed(1)),
        conversionChange: Number(conversionChange.toFixed(1))
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'private, max-age=60'
        }
      }
    );
  } catch (error) {
    console.error('[API] Employee metrics error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
