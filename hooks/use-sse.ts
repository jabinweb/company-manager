import { useEffect, useRef, useCallback, useState } from 'react';
import { useSession } from './use-session';
import type { MessageAPIPayload } from '@/types/messages';


export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';


export function useSSE() {
  const { data: session } = useSession();
  const eventSourceRef = useRef<EventSource | null>(null);
  const messageHandlerRef = useRef<((event: MessageEvent) => void) | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();


  const connect = useCallback(() => {
    if (!session?.user?.employeeId || eventSourceRef.current) return;


    try {
      const connectionId = Date.now().toString();
      const eventSource = new EventSource(`/api/sse?connectionId=${connectionId}`);
      eventSourceRef.current = eventSource;
      setConnectionStatus('connecting');


      eventSource.onopen = () => {
        console.log('[SSE] 🔌 Connected');
        setConnectionStatus('connected');
      };


      eventSource.onmessage = (event) => {
        try {
          messageHandlerRef.current?.(event);
        } catch (error) {
          console.error('[SSE] Message handling error:', error);
        }
      };


      eventSource.onerror = (error) => {
        console.error('[SSE] Connection error:', error);
        eventSource.close();
        setConnectionStatus('disconnected');
       
        // Attempt to reconnect after a delay
        reconnectTimeoutRef.current = setTimeout(connect, 3000);
      };


      return () => {
        console.log('[SSE] Cleaning up connection');
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        eventSource.close();
        eventSourceRef.current = null;
        setConnectionStatus('disconnected');
      };
    } catch (error) {
      console.error('[SSE] Setup error:', error);
      setConnectionStatus('disconnected');
    }
  }, [session?.user?.employeeId]);


  const sendMessage = useCallback(async (data: MessageAPIPayload) => {
    try {
      console.log('[SSE] Sending message:', data);


      // For new messages, save to database first
      if (data.type === 'new_message') {
        const dbResponse = await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
       
        if (!dbResponse.ok) {
          const error = await dbResponse.json();
          console.error('[SSE] Database save failed:', error);
          throw new Error('Failed to save message');
        }
       
        const result = await dbResponse.json();
        console.log('[SSE] Message saved:', result);


        // Send through SSE for real-time delivery
        const sseResponse = await fetch('/api/sse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(result.data)
        });


        if (!sseResponse.ok) {
          console.error('[SSE] Real-time delivery failed:', await sseResponse.text());
          throw new Error('Failed to send through SSE');
        }


        return result;
      }


      // For other types (typing, status), just send through SSE
      const response = await fetch('/api/sse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });


      if (!response.ok) throw new Error('Failed to send message');
      return { success: true };
    } catch (error) {
      console.error('[SSE] Send error:', error);
      throw error;
    }
  }, []);


  const setMessageHandler = useCallback((handler: (event: MessageEvent) => void) => {
    messageHandlerRef.current = handler;
  }, []);


  // Set up connection
  useEffect(() => {
    const cleanup = connect();
    return () => cleanup?.();
  }, [connect]);


  return {
    sendMessage,
    setMessageHandler,
    connectionStatus
  };
}



