import { NextRequest } from 'next/server';
import { getServerSession } from '@/lib/server-session';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.employeeId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const attendance = await prisma.attendance.findFirst({
      where: {
        employeeId: session.user.employeeId,
        createdAt: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        }
      }
    });

    if (!attendance?.checkIn) {
      return new Response(JSON.stringify({ error: 'No check-in record found' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (attendance.checkOut) {
      return new Response(JSON.stringify({ error: 'Already checked out' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const checkInTime = new Date(attendance.checkIn);
    const overtimeMinutes = Math.max(0, Math.floor((now.getTime() - checkInTime.getTime()) / (1000 * 60) - 480)); // 8 hours = 480 minutes

    const updated = await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        checkOut: now,
        overtime: overtimeMinutes,
        metadata: {
          ...attendance.metadata,
          checkOutNotes: 'Checked out via mobile app'
        }
      }
    });

    return new Response(JSON.stringify(updated), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[API] Check-out error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
