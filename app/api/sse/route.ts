import { NextRequest } from 'next/server';
import { getServerSession } from '@/lib/server-session';


export const runtime = 'edge';
export const dynamic = 'force-dynamic';


// Define explicit types for our streaming controllers
type StreamController = ReadableStreamDefaultController<Uint8Array>;


declare global {
  var onlineUsers: Map<string, Set<string>>;
  var lastSeen: Map<string, Date>;
  var connections: Map<string, string[]>;
  var messageStreams: Map<string, StreamController[]>;
}


// Initialize global state if not exists
if (!global.onlineUsers) global.onlineUsers = new Map<string, Set<string>>();
if (!global.lastSeen) global.lastSeen = new Map<string, Date>();
if (!global.connections) global.connections = new Map<string, string[]>();
if (!global.messageStreams) global.messageStreams = new Map();


export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.employeeId) return new Response('Unauthorized', { status: 401 });


    const data = await req.json();
    const encoder = new TextEncoder();


    // Get recipient's stream controllers
    const recipientControllers = global.messageStreams.get(data.receiverId) || [];


    // Send message to recipient
    recipientControllers.forEach(controller => {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
    });


    return new Response('OK');
  } catch (error) {
    console.error('[SSE] Error:', error);
    return new Response('Error', { status: 500 });
  }
}


export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.employeeId) return new Response('Unauthorized', { status: 401 });


    const userId = session.user.employeeId;
    const encoder = new TextEncoder();
    const connectionId = req.headers.get('connection-id') || Date.now().toString();
   
    // Add user to online users
    if (!global.onlineUsers.has(userId)) {
      global.onlineUsers.set(userId, new Set([connectionId]));
    } else {
      global.onlineUsers.get(userId)?.add(connectionId);
    }
    global.lastSeen.set(userId, new Date());


    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        // Add controller to message streams with proper typing
        if (!global.messageStreams.has(userId)) {
          global.messageStreams.set(userId, [controller]);
        } else {
          global.messageStreams.get(userId)?.push(controller);
        }


        // Broadcast status update to ALL connected users
        const statusUpdate = {
          type: 'user_status',
          userId,
          status: 'online',
          onlineUsers: Array.from(global.onlineUsers.keys()),
          lastSeen: global.lastSeen.get(userId)?.toISOString(),
          timestamp: new Date().toISOString()
        };


        // Send to all connected users with proper typing
        Array.from(global.messageStreams.entries()).forEach(([_, controllers]) => {
          controllers.forEach((ctrl: StreamController) => {
            ctrl.enqueue(encoder.encode(`data: ${JSON.stringify(statusUpdate)}\n\n`));
          });
        });


        // Cleanup on disconnect
        req.signal.addEventListener('abort', () => {
          const userConnections = global.onlineUsers.get(userId);
          if (userConnections) {
            userConnections.delete(connectionId);
            if (userConnections.size === 0) {
              global.onlineUsers.delete(userId);
              global.lastSeen.set(userId, new Date());
            }
          }


          // Remove controller from message streams
          const controllers = global.messageStreams.get(userId);
          if (controllers) {
            const index = controllers.indexOf(controller);
            if (index !== -1) {
              controllers.splice(index, 1);
            }
            if (controllers.length === 0) {
              global.messageStreams.delete(userId);
            }
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
    console.error('[SSE] Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}



