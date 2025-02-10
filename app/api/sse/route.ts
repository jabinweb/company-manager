import { NextRequest } from 'next/server';
import { getServerSession } from '@/lib/server-session';

// Force Node.js runtime and increase duration
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes
export const dynamic = 'force-dynamic';
export const preferredRegion = 'auto';

let messageStreams = new Map<string, Set<ReadableStreamDefaultController>>();
let onlineUsers = new Map<string, Set<string>>();

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.employeeId) return new Response('Unauthorized', { status: 401 });

    const userId = session.user.employeeId;
    const encoder = new TextEncoder();

    // Enhanced headers for better connection stability
    const headers = {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'X-Accel-Buffering': 'no',
      'Transfer-Encoding': 'chunked'
    };

    const stream = new ReadableStream({
      start(controller) {
        // Initialize user's message stream set
        if (!messageStreams.has(userId)) {
          messageStreams.set(userId, new Set());
        }
        messageStreams.get(userId)?.add(controller);

        // Track online status
        if (!onlineUsers.has(userId)) {
          onlineUsers.set(userId, new Set([req.url]));
        } else {
          onlineUsers.get(userId)?.add(req.url);
        }

        // Broadcast online status
        const statusUpdate = {
          type: 'user_status',
          userId,
          status: 'online',
          onlineUsers: Array.from(onlineUsers.keys()),
          timestamp: new Date().toISOString()
        };

        // Broadcast to all connected users
        messageStreams.forEach((controllers) => {
          controllers.forEach((ctrl) => {
            try {
              ctrl.enqueue(encoder.encode(`data: ${JSON.stringify(statusUpdate)}\n\n`));
            } catch (error) {
              console.error('[SSE] Broadcast error:', error);
            }
          });
        });

        // Keep-alive
        const keepAlive = setInterval(() => {
          try {
            controller.enqueue(encoder.encode(': keepalive\n\n'));
          } catch (error) {
            clearInterval(keepAlive);
          }
        }, 15000);

        // Cleanup on disconnect
        req.signal.addEventListener('abort', () => {
          clearInterval(keepAlive);
          
          // Remove controller
          messageStreams.get(userId)?.delete(controller);
          if (messageStreams.get(userId)?.size === 0) {
            messageStreams.delete(userId);
          }

          // Update online status
          onlineUsers.get(userId)?.delete(req.url);
          if (onlineUsers.get(userId)?.size === 0) {
            onlineUsers.delete(userId);
            
            // Broadcast offline status
            const offlineUpdate = {
              type: 'user_status',
              userId,
              status: 'offline',
              onlineUsers: Array.from(onlineUsers.keys()),
              timestamp: new Date().toISOString()
            };

            messageStreams.forEach((controllers) => {
              controllers.forEach((ctrl) => {
                try {
                  ctrl.enqueue(encoder.encode(`data: ${JSON.stringify(offlineUpdate)}\n\n`));
                } catch (error) {
                  console.error('[SSE] Offline broadcast error:', error);
                }
              });
            });
          }

          controller.close();
        });
      }
    });

    return new Response(stream, { headers });
  } catch (error) {
    console.error('[SSE] Connection error:', error);
    return new Response('Error', { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.employeeId) return new Response('Unauthorized', { status: 401 });

    const data = await req.json();
    
    // Handle WebRTC signaling
    if (data.type === 'webrtc_signaling') {
      const recipientControllers = messageStreams.get(data.receiverId);
      if (recipientControllers) {
        const message = {
          type: 'webrtc_signaling',
          payload: data.payload,
          senderId: session.user.employeeId
        };
        recipientControllers.forEach((controller) => {
          try {
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(message)}\n\n`));
          } catch (error) {
            console.error('[SSE] WebRTC signal error:', error);
          }
        });
      }
      return new Response('OK');
    }

    const encoder = new TextEncoder();

    // Get recipient's controllers
    const recipientControllers = messageStreams.get(data.receiverId);
    if (recipientControllers) {
      recipientControllers.forEach((controller) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch (error) {
          console.error('[SSE] Send error:', error);
        }
      });
    }

    return new Response('OK', {
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  } catch (error) {
    console.error('[SSE] Send error:', error);
    return new Response('Error', { status: 500 });
  }
}

export async function OPTIONS(req: NextRequest) {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}
