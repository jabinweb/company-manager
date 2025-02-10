import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MessageStatus, MessageType } from '@prisma/client';
import { getServerSession } from '@/lib/server-session';
import { rateLimit } from '@/lib/rate-limit';
import type { MessageAPIPayload } from '@/types/messages';

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.employeeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Get messages between both users
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { AND: [{ senderId: session.user.employeeId }, { receiverId: userId }] },
          { AND: [{ senderId: userId }, { receiverId: session.user.employeeId }] }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Mark unread messages as delivered
    if (messages.length > 0) {
      await prisma.message.updateMany({
        where: {
          receiverId: session.user.employeeId,
          status: MessageStatus.SENT
        },
        data: {
          status: MessageStatus.DELIVERED
        }
      });
    }

    return new NextResponse(
      JSON.stringify({ success: true, data: messages }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'private, no-cache, no-store, must-revalidate',
          'Expires': '-1',
          'Pragma': 'no-cache'
        }
      }
    );
  } catch (error) {
    console.error('[Messages API] Fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.employeeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: MessageAPIPayload = await req.json();
    
    if (body.type !== 'new_message' || !body.content?.trim()) {
      return NextResponse.json({ error: 'Invalid message' }, { status: 400 });
    }

    const message = await prisma.message.create({
      data: {
        content: body.content.trim(),
        senderId: session.user.employeeId,
        receiverId: body.receiverId,
        status: MessageStatus.SENT,
        type: MessageType.TEXT
      },
      include: {
        sender: {
          select: { id: true, name: true, avatar: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        ...message,
        id: message.id.toString(),
        type: 'new_message' as const,
        timestamp: message.createdAt.toISOString()
      }
    });
  } catch (error) {
    console.error('[Messages API] Error:', error);
    return NextResponse.json({ error: 'Failed to save message' }, { status: 500 });
  }
}
