import React, { useRef, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useChat } from '../../contexts/chat-context';
import { ChatMessageList } from "@/components/chat/chat-message-list";
import { ChatBubbleAvatar, ChatBubble, ChatBubbleMessage, ChatBubbleTimestamp } from "./chat-bubble";

interface ChatListProps {
  messages: any[]
  selectedUser: {
    id: string
    name: string
    avatar: string
  }
  isMobile: boolean
}

export function ChatList({ selectedUser }: ChatListProps) {
  const { messages, isLoading } = useChat();
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const prevMessagesLength = useRef(messages.length);

  // Deduplicate messages based on ID
  const uniqueMessages = useMemo(() => {
    const seen = new Set();
    return messages.filter(message => {
      const duplicate = seen.has(message.id);
      seen.add(message.id);
      return !duplicate;
    });
  }, [messages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (uniqueMessages.length > prevMessagesLength.current) {
      lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevMessagesLength.current = uniqueMessages.length;
  }, [uniqueMessages.length]);

  return (
    <div className="w-full overflow-y-hidden h-full flex flex-col">
      <ChatMessageList shouldAutoScroll={uniqueMessages.length > prevMessagesLength.current}>
        <AnimatePresence>
          {uniqueMessages.map((message) => {
            const isLastMessage = message.id === uniqueMessages[uniqueMessages.length - 1]?.id;
            const variant = message.senderId === selectedUser.id ? "received" : "sent";
            
            return (
              <motion.div
                key={`${message.id}-${message.timestamp}`}
                ref={isLastMessage ? lastMessageRef : null}
                layout
                initial={{ opacity: 0, scale: 1, y: 50, x: 0 }}
                animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                exit={{ opacity: 0, scale: 1, y: 1, x: 0 }}
                transition={{
                  opacity: { duration: 0.1 },
                  layout: {
                    type: "spring",
                    bounce: 0.3,
                    duration: 0.2
                  }
                }}
                style={{ originX: 0.5, originY: 0.5 }}
                className="flex flex-col gap-2 p-4"
              >
                <ChatBubble variant={variant}>
                  <ChatBubbleMessage>
                    {message.content}
                    <ChatBubbleTimestamp 
                      timestamp={new Date(message.createdAt).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    />
                  </ChatBubbleMessage>
                </ChatBubble>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </ChatMessageList>
    </div>
  );
}