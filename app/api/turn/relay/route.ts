import { NextRequest } from 'next/server';
import { getServerSession } from '@/lib/server-session';

// Use Edge Runtime for WebSocket support
export const runtime = 'edge';

const peers = new Map<string, WebSocket>();
const relayConnections = new Map<string, Set<string>>();

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.employeeId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const userId = session.user.employeeId;
    const { socket, response } = Deno.upgradeWebSocket(req);

    // Store peer connection
    peers.set(userId, socket);

    socket.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'relay_request':
            handleRelayRequest(userId, data.targetId);
            break;
            
          case 'relay_data':
            relayData(userId, data.targetId, data.payload);
            break;
        }
      } catch (error) {
        console.error('[TURN Relay] Message handling error:', error);
      }
    };

    socket.onclose = () => {
      peers.delete(userId);
      cleanupRelayConnections(userId);
    };

    return response;
  } catch (error) {
    console.error('[TURN Relay] Connection error:', error);
    return new Response('Error', { status: 500 });
  }
}

function handleRelayRequest(sourceId: string, targetId: string) {
  if (!relayConnections.has(sourceId)) {
    relayConnections.set(sourceId, new Set());
  }
  relayConnections.get(sourceId)?.add(targetId);
}

function relayData(sourceId: string, targetId: string, data: any) {
  const targetSocket = peers.get(targetId);
  if (targetSocket && relayConnections.get(sourceId)?.has(targetId)) {
    targetSocket.send(JSON.stringify({
      type: 'relay_data',
      sourceId,
      payload: data
    }));
  }
}

function cleanupRelayConnections(userId: string) {
  relayConnections.delete(userId);
  relayConnections.forEach(connections => {
    connections.delete(userId);
  });
}
