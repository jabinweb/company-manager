import { NextRequest } from 'next/server';
import { getServerSession } from '@/lib/server-session';
import { prisma } from '@/lib/prisma';
import { startOfMonth, endOfMonth } from 'date-fns';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.employeeId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const month = searchParams.get('month') || new Date().getMonth() + 1;
    const year = searchParams.get('year') || new Date().getFullYear();

    const startDate = startOfMonth(new Date(year, month - 1));
    const endDate = endOfMonth(new Date(year, month - 1));

    const records = await prisma.attendance.findMany({
      where: {
        employeeId: session.user.employeeId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        employee: {
          select: {
            name: true,
            employeeId: true,
          },
        },
      },
    });

    // Calculate statistics
    const stats = {
      totalDays: records.length,
      presentDays: records.filter(r => r.status === 'PRESENT').length,
      lateDays: records.filter(r => r.status === 'LATE').length,
      absentDays: records.filter(r => r.status === 'ABSENT').length,
      halfDays: records.filter(r => r.status === 'HALF_DAY').length,
      onLeaveDays: records.filter(r => r.status === 'ON_LEAVE').length,
      totalOvertime: records.reduce((acc, curr) => acc + (curr.overtime || 0), 0),
      averageCheckIn: calculateAverageTime(records.map(r => r.checkIn)),
      averageCheckOut: calculateAverageTime(records.map(r => r.checkOut)),
      records: records.map(formatAttendanceRecord),
    };

    return new Response(JSON.stringify(stats), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[API] Attendance report error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

function calculateAverageTime(dates: (Date | null)[]): string | null {
  const validDates = dates.filter((d): d is Date => d !== null);
  if (validDates.length === 0) return null;

  const totalMinutes = validDates.reduce((acc, date) => {
    return acc + date.getHours() * 60 + date.getMinutes();
  }, 0);

  const avgMinutes = Math.round(totalMinutes / validDates.length);
  const hours = Math.floor(avgMinutes / 60);
  const minutes = avgMinutes % 60;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

function formatAttendanceRecord(record: any) {
  return {
    id: record.id,
    date: record.createdAt,
    status: record.status,
    checkIn: record.checkIn,
    checkOut: record.checkOut,
    overtime: record.overtime,
    notes: record.metadata?.notes,
  };
}
