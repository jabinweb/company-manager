import { NextRequest } from 'next/server';
import { getServerSession } from '@/lib/server-session';
import { prisma } from '@/lib/prisma';
import { Prisma, LeadStatus, Priority } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    // Add caching headers
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=59'
    })

    const session = await getServerSession();
    if (!session?.user?.employeeId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('query') || '';
    const statuses = searchParams.getAll('status') as LeadStatus[];
    const priorities = searchParams.getAll('priority') as Priority[];
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const where: Prisma.LeadWhereInput = {
      companyId: session.user.currentCompanyId,
      ...(statuses.length > 0 && { 
        status: { 
          in: statuses.filter((status): status is LeadStatus => 
            Object.values(LeadStatus).includes(status as LeadStatus)
          )
        }
      }),
      ...(priorities.length > 0 && { 
        priority: { 
          in: priorities.filter((priority): priority is Priority => 
            Object.values(Priority).includes(priority as Priority)
          )
        }
      }),
      ...(query && {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { contactName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ]
      }),
      ...(!session.user.role?.includes('ADMIN') && { 
        employeeId: session.user.employeeId 
      })
    };

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: {
          assignedTo: {
            select: {
              id: true,
              name: true,
              avatar: true,
              email: true
            }
          },
          activities: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: {
              employee: {
                select: {
                  id: true,
                  name: true,
                  avatar: true
                }
              }
            }
          },
          _count: {
            select: {
              activities: true,
              documents: true
            }
          }
        },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.lead.count({ where })
    ]);
  

    return new Response(JSON.stringify({
      data: leads,
      meta: {
        total,
        page,
        limit,
        pageCount: Math.ceil(total / limit)
      }
    }), { headers })
  } catch (error) {
    console.error('[API] Leads error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.employeeId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = await req.json();
    
    // Extract only valid fields from the request
    const {
      name,
      company,
      email,
      phone,
      status,
      priority,
      description,
      sourceType
    } = data;

    // Create lead with proper schema fields
    const lead = await prisma.lead.create({
      data: {
        name: name.trim(),
        company: company?.trim(),
        email: email?.trim(),
        phone: phone?.trim(),
        status,
        priority,
        description: description?.trim(),
        sourceType,
        // Connect directly to employee
        assignedTo: {
          connect: {
            id: session.user.employeeId
          }
        }
      },
      include: {
        assignedTo: true,
        activities: {
          include: {
            employee: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    });

    // Create initial activity
    await prisma.leadActivity.create({
      data: {
        type: 'NOTE',
        description: 'Lead created',
        lead: {
          connect: { id: lead.id }
        },
        employee: {
          connect: { id: session.user.employeeId }
        }
      }
    });

    return new Response(JSON.stringify({ data: lead }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[API] Create lead error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to create lead',
      details: error instanceof Error ? error.message : undefined
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
