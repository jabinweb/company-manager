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

    const { location, notes } = await req.json();
    const now = new Date();

    // Check if already checked in today
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        employeeId: session.user.employeeId,
        createdAt: {
          gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
        }
      }
    });

    if (existingAttendance?.checkIn) {
      return new Response(JSON.stringify({ error: 'Already checked in' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const attendance = await prisma.attendance.upsert({
      where: {
        id: existingAttendance?.id || 'new',
      },
      create: {
        employeeId: session.user.employeeId,
        status: 'PRESENT',
        checkIn: now,
        metadata: { location, notes }
      },
      update: {
        status: 'PRESENT',
        checkIn: now,
        metadata: { location, notes }
      }
    });

    return new Response(JSON.stringify(attendance), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[API] Check-in error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
