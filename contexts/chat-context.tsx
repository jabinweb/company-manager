'use client'

import { createContext, useContext, useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { useMessageStore } from '@/lib/stores/message-store'
import { CallProvider, useCall } from './call-context'
import { useSSE } from '@/hooks/use-sse'
import type { Message, MessageAPIPayload } from '@/types/messages'
import type { CallData } from '@/types/call'
import { generateId } from '@/lib/utils';
import type { ChatUser } from '@/types/chat'

interface ChatContextType {
  messages: Message[]
  isTyping: boolean
  onlineUsers: Set<string>
  lastSeen: Map<string, Date>
  isLoading: boolean
  selectedChat: string | null
  sendMessage: (content: string, receiverId: string) => Promise<void>
  setSelectedChat: (chatId: string | null) => void
  currentUserId: string
  notifyTyping: (receiverId: string) => void
  typingUsers: Map<string, NodeJS.Timeout>
  pendingMessages: Set<string>
  activeCall: CallData | null
  incomingCall: CallData | null
  initiateCall: (receiverId: string, type: 'audio' | 'video') => void
  acceptCall: () => void
  rejectCall: () => void
  endCall: () => void
}

const ChatContext = createContext<ChatContextType | null>(null)

interface ChatProviderProps {
  children: React.ReactNode;
  currentUser: ChatUser;
}

export const ChatProvider = ({ 
  children, 
  currentUser 
}: ChatProviderProps) => {
  const store = useMessageStore()
  const callContext = useCall()
  const messageQueueRef = useRef<MessageAPIPayload[]>([])
  
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const [lastSeen, setLastSeen] = useState<Map<string, Date>>(new Map())
  const [typingUsers, setTypingUsers] = useState<Map<string, NodeJS.Timeout>>(new Map())
  const [pendingMessages, setPendingMessages] = useState<Set<string>>(new Set())

  // Handle typing event
  const handleTypingEvent = useCallback((data: any) => {
    setTypingUsers(prev => {
      const next = new Map(prev)
      const existingTimeout = next.get(data.senderId)
      if (existingTimeout) clearTimeout(existingTimeout)
      
      const timeout = setTimeout(() => {
        setTypingUsers(prev => {
          const next = new Map(prev)
          next.delete(data.senderId)
          return next
        })
      }, 3000)
      
      next.set(data.senderId, timeout)
      return next
    })
  }, [])

  const { status: connectionStatus, send: sendSSEMessage, addHandler } = useSSE({
    onError: (error) => {
      console.error('[Chat] SSE Error:', error)
    }
  })

  const handleMessage = useCallback((message: any) => {
    if (!sendSSEMessage) return // Add null check
    sendSSEMessage(message)
  }, [sendSSEMessage])

  // Register message handlers
  useEffect(() => {
    if (!addHandler) return

    addHandler('message', (data) => {
      store.addMessage(data.chatId, {
        id: data.id,
        content: data.content,
        timestamp: data.timestamp,
        senderId: data.senderId
      })
    })

    addHandler('user_status', (data) => {
      setOnlineUsers(new Set(data.onlineUsers))
      if (data.userId && data.lastSeen) {
        setLastSeen(prev => new Map(prev).set(data.userId, new Date(data.lastSeen)))
      }
    })

    addHandler('typing', handleTypingEvent)
    addHandler('call_request', callContext.handleCallEvent)
    addHandler('call_accepted', callContext.handleCallEvent)
    addHandler('call_rejected', callContext.handleCallEvent)
    addHandler('call_ended', callContext.handleCallEvent)
  }, [store, handleTypingEvent, callContext, addHandler])

  // Send queued messages when connection is established
  useEffect(() => {
    if (connectionStatus === 'connected' && messageQueueRef.current.length > 0) {
      const messages = [...messageQueueRef.current]
      messageQueueRef.current = []
      messages.forEach(msg => sendSSEMessage(msg))
    }
  }, [connectionStatus, sendSSEMessage])

  // Send message
  const sendMessage = useCallback(async (content: string, receiverId: string) => {
    const tempId = generateId();
    
    try {
      setPendingMessages(prev => new Set(prev).add(tempId));
      
      const response = await fetch(`/api/chats/${receiverId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });

      // ...rest of implementation...
    } catch (error) {
      // ...error handling...
    } finally {
      setPendingMessages(prev => {
        const next = new Set(prev);
        next.delete(tempId);
        return next;
      });
    }
  }, []);

  // Notify typing
  const notifyTyping = useCallback((receiverId: string) => {
    const message: MessageAPIPayload = {
      id: crypto.randomUUID(),
      type: 'typing',
      senderId: currentUser.id,
      receiverId,
      timestamp: new Date().toISOString(),
      content: ''
    }
    sendSSEMessage(message)
  }, [currentUser.id, sendSSEMessage])

  const value = useMemo(() => ({
    messages: store.messages[store.selectedChat || ''] || [],
    isTyping: typingUsers.size > 0,
    onlineUsers,
    lastSeen,
    isLoading: false,
    selectedChat: store.selectedChat,
    sendMessage,
    setSelectedChat: store.setSelectedChat,
    currentUserId: currentUser.id,
    notifyTyping,
    typingUsers,
    pendingMessages,
    activeCall: callContext.activeCall,
    incomingCall: callContext.incomingCall,
    initiateCall: (receiverId: string, type: 'audio' | 'video') => 
      callContext.initiateCall(receiverId, type),
    acceptCall: () => callContext.acceptCall(),
    rejectCall: () => callContext.rejectCall(),
    endCall: () => callContext.endCall()
  }), [
    store.messages,
    store.selectedChat,
    typingUsers,
    onlineUsers,
    lastSeen,
    sendMessage,
    store.setSelectedChat,
    notifyTyping,
    currentUser.id,
    pendingMessages,
    callContext
  ])

  return (
    <CallProvider 
      currentUser={{
        id: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatar
      }}
    >
      <ChatContext.Provider value={value}>
        {children}
      </ChatContext.Provider>
    </CallProvider>
  )
}

export const useChat = () => {
  const context = useContext(ChatContext)
  if (!context) throw new Error('useChat must be used within ChatProvider')
  return context
}







