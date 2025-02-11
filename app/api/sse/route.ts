import { NextRequest } from 'next/server';
import { getServerSession } from '@/lib/server-session';
import { sseStore } from '@/lib/sse-store';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.employeeId) return new Response('Unauthorized', { status: 401 });

    const userId = session.user.employeeId;
    const connectionId = crypto.randomUUID();

    const stream = new ReadableStream({
      start(controller) {
        sseStore.addUser(userId, connectionId, controller);

        // Keep connection alive
        const keepAlive = setInterval(() => {
          try {
            controller.enqueue(new TextEncoder().encode(': keepalive\n\n'));
          } catch (error) {
            clearInterval(keepAlive);
          }
        }, 15000);

        // Cleanup on disconnect
        req.signal.addEventListener('abort', () => {
          clearInterval(keepAlive);
          sseStore.removeUser(userId, connectionId, controller);
        });
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'Keep-Alive': 'timeout=60',
        'X-Accel-Buffering': 'no'
      }
    });
  } catch (error) {
    console.error('[SSE] Error:', error);
    return new Response('Error', { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.employeeId) return new Response('Unauthorized', { status: 401 });

    const data = await req.json();
    
    // For call events, broadcast to specific recipient
    if (data.type?.startsWith('call_')) {
      sseStore.sendMessage(data.receiverId, {
        ...data,
        senderId: session.user.employeeId,
        timestamp: new Date().toISOString()
      });
      return new Response('OK');
    }

    // For chat messages
    if (data.type === 'new_message') {
      sseStore.sendMessage(data.receiverId, {
        ...data,
        senderId: session.user.employeeId,
        timestamp: new Date().toISOString()
      });
    }

    return new Response('OK', {
      headers: { 'Cache-Control': 'no-store' }
    });
  } catch (error) {
    console.error('[SSE] Error:', error);
    return new Response('Error', { status: 500 });
  }
}



