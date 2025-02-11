import { NextRequest } from 'next/server';
import { getServerSession } from '@/lib/server-session';

export const runtime = 'edge';

// Store connections in memory
const peers = new Map<string, Set<ReadableStreamDefaultController>>();

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.employeeId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const userId = session.user.employeeId;
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      start(controller) {
        // Initialize peer's stream set
        if (!peers.has(userId)) {
          peers.set(userId, new Set());
        }
        peers.get(userId)?.add(controller);

        // Send connection confirmation
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({
            type: 'connection_established',
            userId,
            timestamp: new Date().toISOString()
          })}\n\n`)
        );

        // Cleanup on disconnect
        req.signal.addEventListener('abort', () => {
          peers.get(userId)?.delete(controller);
          if (peers.get(userId)?.size === 0) {
            peers.delete(userId);
          }
          controller.close();
        });
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });
  } catch (error) {
    console.error('[Relay] Connection error:', error);
    return new Response('Error', { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.employeeId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const data = await req.json();
    const targetPeers = peers.get(data.targetId);
    
    if (targetPeers) {
      const message = JSON.stringify({
        type: 'relay_data',
        sourceId: session.user.employeeId,
        payload: data.payload
      });

      targetPeers.forEach(controller => {
        try {
          controller.enqueue(new TextEncoder().encode(`data: ${message}\n\n`));
        } catch (error) {
          console.error('[Relay] Send error:', error);
        }
      });
    }

    return new Response('OK');
  } catch (error) {
    console.error('[Relay] Send error:', error);
    return new Response('Error', { status: 500 });
  }
}
