import { NextRequest } from 'next/server';
import { getServerSession } from '@/lib/server-session';
import { Message, Employee, MessageStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { cache } from 'react';

// Cache duration in seconds
const CACHE_DURATION = 30;

// Cache the database query with user-specific key
const getCachedContacts = cache(async (userId: string, companyId: number) => {
  const cacheKey = `contacts:${userId}:${companyId}`;
  
  return prisma.employee.findMany({
    where: {
      NOT: { id: userId },
      companyId: companyId
    },
    include: {
      ReceivedMessages: {
        where: { senderId: userId },
        orderBy: { createdAt: 'desc' },
        take: 1
      },
      SentMessages: {
        where: { receiverId: userId },
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    }
  });
});

interface ContactWithMessages extends Employee {
  ReceivedMessages: Message[];
  SentMessages: Message[];
}

interface FormattedContact {
  id: string;
  name: string;
  avatar: string | null;
  lastMessageContent: string | null;
  lastMessageTimestamp: Date | null;
  isUnread: boolean;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.employeeId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const userId = session.user.employeeId;
    const companyId = session.user.currentCompanyId!;

    // Add cache headers with ETag support
    const headers = {
      'Content-Type': 'application/json',
      'Cache-Control': `public, max-age=${CACHE_DURATION}, stale-while-revalidate=60`,
      'ETag': `"contacts-${session.user.employeeId}-${Date.now()}"`
    };

    // Check if we can return 304 Not Modified
    const ifNoneMatch = req.headers.get('if-none-match');
    if (ifNoneMatch && ifNoneMatch === headers.ETag) {
      return new Response(null, { status: 304, headers });
    }

    // Use cached query
    const contacts = await getCachedContacts(userId, companyId) as ContactWithMessages[];

    const formattedContacts = contacts.map((contact: ContactWithMessages): FormattedContact => {
      const lastReceivedMessage = contact.ReceivedMessages[0];
      const lastSentMessage = contact.SentMessages[0];
      
      let lastMessage = null;
      if (lastReceivedMessage && lastSentMessage) {
        lastMessage = lastReceivedMessage.createdAt > lastSentMessage.createdAt
          ? lastReceivedMessage
          : lastSentMessage;
      } else {
        lastMessage = lastReceivedMessage || lastSentMessage;
      }

      return {
        id: contact.id,
        name: contact.name,
        avatar: contact.avatar,
        lastMessageContent: lastMessage?.content || null,
        lastMessageTimestamp: lastMessage?.createdAt || null,
        isUnread: lastMessage 
          ? lastMessage.receiverId === userId && lastMessage.status === MessageStatus.SENT
          : false
      };
    });

    // Sort by last message timestamp
    const sortedContacts = formattedContacts.sort((a, b) => {
      if (!a.lastMessageTimestamp) return 1;
      if (!b.lastMessageTimestamp) return -1;
      return b.lastMessageTimestamp.getTime() - a.lastMessageTimestamp.getTime();
    });

    return new Response(JSON.stringify(sortedContacts), { headers });
  } catch (error) {
    console.error('Error fetching sorted contacts:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
