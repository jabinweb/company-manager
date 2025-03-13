import useSWR from 'swr';
import { useEffect, useRef } from 'react';
import { sseClient } from '@/lib/sse-client';

export function useChatContacts() {
  const cleanup = useRef<(() => void) | null>(null);
  
  const { data, error, mutate } = useSWR('/api/chats/sorted-contacts', {
    fetcher: async (url) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch contacts');
      return res.json();
    },
    refreshInterval: 0,
    dedupingInterval: 5000,
    revalidateOnFocus: false,
    keepPreviousData: true,
  });

  useEffect(() => {
    let isMounted = true;

    const setupSSE = async () => {
      if (!sseClient.isConnectedState()) {
        await sseClient.connect();
      }
      
      if (isMounted) {
        const handleNewMessage = () => mutate();
        sseClient.subscribe('new_message', handleNewMessage);
        sseClient.subscribe('message_status_update', handleNewMessage);
        
        cleanup.current = () => {
          sseClient.unsubscribe('new_message', handleNewMessage);
          sseClient.unsubscribe('message_status_update', handleNewMessage);
        };
      }
    };

    setupSSE().catch(console.error);

    return () => {
      isMounted = false;
      cleanup.current?.();
    };
  }, [mutate]);

  return {
    contacts: data,
    isLoading: !error && !data,
    isError: error,
    mutate
  };
}
