import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';

    const companies = await prisma.company.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive',
        },
      },
      take: 5,
      select: {
        id: true,
        name: true,
      },
    });

    return NextResponse.json({ companies });
  } catch (error) {
    return NextResponse.json(
      { message: 'Error fetching companies' },
      { status: 500 }
    );
  }
}
