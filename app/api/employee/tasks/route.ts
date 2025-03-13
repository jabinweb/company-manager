import { NextRequest } from 'next/server';
import { getServerSession } from '@/lib/server-session';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.employeeId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const tasks = await prisma.task.findMany({
      where: {
        assignedToId: session.user.employeeId,
        status: {
          not: 'COMPLETED'
        }
      },
      orderBy: [
        {
          priority: 'desc'
        },
        {
          dueDate: 'asc'
        }
      ],
      select: {
        id: true,
        title: true,
        description: true,
        dueDate: true,
        status: true,
        priority: true,
        category: true,
        progress: true,
        attachments: true,
        tags: true,
        metadata: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return new Response(JSON.stringify(tasks), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[API] Get tasks error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}