import { NextRequest } from 'next/server';
import { getServerSession } from '@/lib/server-session';
import { prisma } from '@/lib/prisma';
import { startOfMonth, endOfMonth, parseISO, isValid } from 'date-fns';
import type { Prisma } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.employeeId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const dateStr = searchParams.get('date');
    
    if (!dateStr || !isValid(parseISO(dateStr))) {
      return new Response(JSON.stringify({ error: 'Invalid date' }), { status: 400 });
    }

    const date = parseISO(dateStr);
    const startDate = startOfMonth(date);
    const endDate = endOfMonth(date);

    // Type-safe query
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        employeeId: session.user.employeeId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        status: true,
        checkIn: true,
        checkOut: true,
        overtime: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Calculate statistics with type safety
    const report = {
      totalDays: attendanceRecords.length,
      presentDays: attendanceRecords.filter(r => r.status === 'PRESENT').length,
      lateDays: attendanceRecords.filter(r => r.status === 'LATE').length,
      absentDays: attendanceRecords.filter(r => r.status === 'ABSENT').length,
      totalOvertime: attendanceRecords.reduce((acc, curr) => acc + (curr.overtime || 0), 0),
      records: attendanceRecords.map(record => ({
        id: record.id,
        date: record.createdAt,
        status: record.status,
        checkIn: record.checkIn,
        checkOut: record.checkOut,
        overtime: record.overtime || 0,
      })),
    };

    return new Response(JSON.stringify(report), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (error) {
    console.error('[API] Monthly report error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
