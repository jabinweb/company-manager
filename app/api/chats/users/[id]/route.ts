import { NextRequest } from 'next/server';
import { getServerSession } from '@/lib/server-session';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.employeeId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const user = await prisma.employee.findUnique({
      where: { id: (await params).id },
      select: {
        id: true,
        name: true,
        avatar: true,
        email: true,
        jobTitle: true,
        department: true,
        isApproved: true,
        updatedAt: true
      }
    });

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      data: {
        ...user,
        lastActive: user.updatedAt,
        isOnline: false
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[API] Get user error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch user details' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
