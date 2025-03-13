import { getServerSession } from '@/lib/server-session';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

interface FormattedAction {
  id: string | number;
  type: 'LEAD_ACTIVITY' | 'TASK';
  title: string;
  leadId?: string;
  dueDate: Date | null;
  priority: string;
  status?: string;
  category?: string;
  description?: string;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.employeeId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [leadActions, tasks] = await Promise.all([
      // Get lead follow-ups
      prisma.leadActivity.findMany({
        where: {
          employeeId: session.user.employeeId,
          completed: false,
          dueDate: {
            gte: today,
            lte: nextWeek
          }
        },
        include: {
          lead: {
            select: {
              id: true,
              name: true,
              company: true,
              status: true,
              priority: true
            }
          }
        },
        orderBy: {
          dueDate: 'asc'
        },
        take: 5
      }),

      // Get upcoming tasks
      prisma.task.findMany({
        where: {
          assignedToId: session.user.employeeId,
          status: 'TODO',
          dueDate: {
            gte: today,
            lte: nextWeek
          }
        },
        select: {
          id: true,
          title: true,
          dueDate: true,
          priority: true,
          category: true
        },
        orderBy: {
          dueDate: 'asc'
        },
        take: 5
      })
    ]);

    // Format the response with proper type checking
    const actions: FormattedAction[] = [
      ...leadActions.map(action => ({
        id: action.id,
        type: 'LEAD_ACTIVITY' as const,
        title: `Follow up with ${action.lead.name}`,
        leadId: action.lead.id,
        dueDate: action.dueDate,
        priority: action.lead.priority,
        status: action.lead.status,
        description: action.description
      })),
      ...tasks.map(task => ({
        id: task.id,
        type: 'TASK' as const,
        title: task.title,
        dueDate: task.dueDate,
        priority: task.priority,
        category: task.category
      }))
    ].sort((a, b) => {
      // Handle null dates by putting them at the end
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.getTime() - b.dueDate.getTime();
    });

    return new Response(JSON.stringify(actions), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'private, max-age=60'
      }
    });
  } catch (error) {
    console.error('[API] Upcoming actions error:', error);
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
