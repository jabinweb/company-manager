'use client'

import { useChat } from '@/contexts/chat-context'
import { useCall } from '@/contexts/call-context'
import { ChatMessageList } from './chat-message-list'
import { ChatMessage } from './chat-message'
import ChatBottombar from './chat-bottombar'
import { CallDialog } from './call-dialog'
import { useRef, useEffect } from 'react'
import type { Message } from '@/types/messages'

export function ChatWindow() {
  const { 
    messages, 
    selectedChat, 
    isLoading,
    sendMessage,
    currentUserId,
    notifyTyping,
    typingUsers,
    pendingMessages
  } = useChat();

  const {
    activeCall,
    incomingCall,
    acceptCall,
    rejectCall,
    endCall
  } = useCall();

  const shouldAutoScroll = useRef(true);

  useEffect(() => {
    console.log('[ChatWindow] State:', {
      messageCount: messages.length,
      selectedChat,
      hasActiveCall: !!activeCall,
      hasIncomingCall: !!incomingCall
    });
  }, [messages, selectedChat, activeCall, incomingCall]);

  const getMessageKey = (message: Message) => {
    return message.id || `${message.timestamp}-${message.senderId}`;
  };

  if (!selectedChat) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Select a chat to start messaging</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ChatMessageList shouldAutoScroll={shouldAutoScroll.current}>
        {messages.map((message) => (
          <ChatMessage 
            key={getMessageKey(message)}
            message={message}
            isOwn={message.senderId === currentUserId}
            isPending={pendingMessages?.has(String(message.id))}
          />
        ))}
        {typingUsers.has(selectedChat) && (
          <div className="flex items-center gap-2 p-2 text-sm text-muted-foreground">
            <div className="flex gap-1">
              <span className="animate-bounce">•</span>
              <span className="animate-bounce delay-100">•</span>
              <span className="animate-bounce delay-200">•</span>
            </div>
            <span>Typing...</span>
          </div>
        )}
      </ChatMessageList>

      <ChatBottombar 
        onSend={(content) => sendMessage(content, selectedChat)}
        onTyping={() => notifyTyping(selectedChat)}
        disabled={isLoading}
        receiverId={selectedChat}
      />

      {/* Call Dialog */}
      {(activeCall || incomingCall) && (
        <CallDialog
          call={activeCall || incomingCall}
          isIncoming={!!incomingCall}
          onAccept={acceptCall}
          onReject={incomingCall ? rejectCall : endCall}
          onClose={incomingCall ? rejectCall : endCall}
        />
      )}
    </div>
  );
}
