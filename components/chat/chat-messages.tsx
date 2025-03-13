import { useEffect, useRef } from 'react';
import { useMessageStore } from '@/lib/stores/message-store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from './chat-message';
import { useSession } from '@/hooks/use-session';

interface ChatMessagesProps {
  chatId: string;
}

export function ChatMessages({ chatId }: ChatMessagesProps) {
  const messages = useMessageStore(state => state.messages[chatId] || []);
  const fetchMessages = useMessageStore(state => state.fetchMessages);
  const { data: session } = useSession();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatId) {
      fetchMessages(chatId);
    }
  }, [chatId, fetchMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!messages?.length) {
    return <div className="flex-1 p-4">No messages yet</div>;
  }

  return (
    <ScrollArea ref={scrollRef} className="flex-1 p-4">
      <div className="space-y-4">
        {messages.map((message) => (
          <ChatMessage 
            key={message.id} 
            message={message}
            isOwn={message.senderId === session?.user?.employeeId}
            isPending={message.status === 'SENDING'}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
