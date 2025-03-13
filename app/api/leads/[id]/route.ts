import { NextRequest } from 'next/server';
import { getServerSession } from '@/lib/server-session';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.employeeId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const lead = await prisma.lead.findUnique({
      where: { id: params.id },
      include: {
        assignedTo: true,
        activities: {
          include: {
            employee: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        documents: true,
        convertedClient: true
      }
    });

    if (!lead) {
      return new Response('Lead not found', { status: 404 });
    }

    return new Response(JSON.stringify(lead), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching lead:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.employeeId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const data = await req.json();
    const lead = await prisma.lead.update({
      where: { id: params.id },
      data
    });

    return new Response(JSON.stringify(lead), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error updating lead:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
