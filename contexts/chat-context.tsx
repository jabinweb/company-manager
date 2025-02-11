'use client'


import { createContext, useContext, useState, useCallback, useEffect, useRef, useMemo } from 'react'
import {
  Message,
  TextMessage,
  MessageAPIPayload,
  StatusMessage
} from '@/types/messages'
import { useSSE } from '@/hooks/use-sse'
import { CallProvider, useCall } from './call-context'
import { CallData } from '@/types/call'


interface ChatContextType {
  messages: Message[]
  isTyping: boolean
  onlineUsers: Set<string>
  lastSeen: Map<string, Date> // Add this line
  sendTextMessage: (content: string, receiverId: string) => Promise<void>
  isLoading: boolean
  selectedChat: string | null
  setSelectedChat: (userId: string) => void
  navigateToChat: (userId: string) => void
  currentUserId: string
  notifyTyping: (receiverId: string) => void
  // Add these call-related properties
  initiateCall: (userId: string, type: 'audio' | 'video') => void
  activeCall: CallData | null
  incomingCall: CallData | null
  acceptCall: () => void
  rejectCall: () => void
  endCall: () => void
  typingUsers: Map<string, NodeJS.Timeout> // Add this line
  pendingMessages: Set<string>  // Add this line
}


const ChatContext = createContext<ChatContextType | null>(null)


interface Props {
  children: React.ReactNode
  currentUser: { id: string; name: string; avatar: string | null }
}


export function ChatProvider({ children, currentUser }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const prevMessagesRef = useRef<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const [lastSeen, setLastSeen] = useState<Map<string, Date>>(new Map());
  const typingTimeoutRef = useRef<NodeJS.Timeout>()
  const messageQueue = useRef<any[]>([])
  const [typingUsers, setTypingUsers] = useState<Map<string, NodeJS.Timeout>>(new Map());
  const [pendingMessages, setPendingMessages] = useState<Set<string>>(new Set());


  const {
    sendMessage: sendSSEMessage,
    setMessageHandler,
    connectionStatus
  } = useSSE()


  const callContext = useCall();


  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
     
      if (data.type === 'user_status' && Array.isArray(data.onlineUsers)) {
        setOnlineUsers(prev => {
          const newUsers = new Set<string>(data.onlineUsers);
          console.log('[ChatContext] Updating online users:', {
            previous: Array.from(prev),
            new: Array.from(newUsers),
            currentUserId: currentUser.id
          });
          return newUsers;
        });


        if (data.userId && data.lastSeen) {
          setLastSeen(prev => new Map(prev).set(data.userId, new Date(data.lastSeen)));
        }
      }


      if (data.type === 'typing') {
        setTypingUsers(prev => {
          const next = new Map(prev);
          // Clear existing timeout
          const existingTimeout = next.get(data.senderId);
          if (existingTimeout) clearTimeout(existingTimeout);
         
          // Set new timeout to clear typing status
          const timeout = setTimeout(() => {
            setTypingUsers(prev => {
              const next = new Map(prev);
              next.delete(data.senderId);
              return next;
            });
          }, 3000);
         
          next.set(data.senderId, timeout);
          return next;
        });
      }


      if (data.type?.startsWith('call_')) {
        callContext.handleCallEvent?.(data);
      }
    } catch (error) {
      console.error('[ChatContext] Message handling error:', error);
    }
  }, [currentUser.id, callContext]);


  // Remove messageHandlerRef as we're handling messages directly
  useEffect(() => {
    setMessageHandler(handleMessage);
  }, [handleMessage, setMessageHandler]);


  useEffect(() => {
    console.log('[ChatProvider] Mounted for user:', currentUser.id)
    return () => console.log('[ChatProvider] Unmounting for user:', currentUser.id)
  }, [currentUser.id])


  const fetchMessages = useCallback(async (userId: string) => {
    try {
      const response = await fetch(`/api/messages?userId=${userId}`);
      const result = await response.json();
     
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch messages');
      }


      if (result.success && Array.isArray(result.data)) {
        const newMessages = result.data;
        if (JSON.stringify(newMessages) !== JSON.stringify(prevMessagesRef.current)) {
          setMessages(newMessages);
          prevMessagesRef.current = newMessages;
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, []);


  useEffect(() => {
    if (!selectedChat) return
    fetchMessages(selectedChat)
    const poll = setInterval(() => fetchMessages(selectedChat), 3000)
    return () => clearInterval(poll)
  }, [selectedChat, fetchMessages])


  const navigateToChat = useCallback((userId: string) => {
    setSelectedChat(userId);
    fetchMessages(userId);
  }, [fetchMessages]);


  // Update sendTextMessage to properly handle WebSocket reference
  const sendTextMessage = useCallback(async (content: string, receiverId: string) => {
    if (connectionStatus !== 'connected') {
      messageQueue.current.push({ content, receiverId });
      return;
    }


    const tempId = crypto.randomUUID();
   
    try {
      // Add to pending and show optimistic update
      setPendingMessages(prev => new Set(prev).add(tempId));
     
      const tempMessage: TextMessage = {
        id: tempId,
        type: 'new_message',
        content: content.trim(),
        senderId: currentUser.id,
        receiverId,
        timestamp: new Date().toISOString(),
        status: 'SENDING' as const,
        sender: {
          id: currentUser.id,
          name: currentUser.name,
          avatar: currentUser.avatar
        }
      };


      // Show immediately
      setMessages(prev => [...prev, tempMessage]);


      const result = await sendSSEMessage({
        type: 'new_message',
        content: content.trim(),
        senderId: currentUser.id,
        receiverId,
        timestamp: new Date().toISOString()
      });


      // Remove pending status and update with server response
      setPendingMessages(prev => {
        const next = new Set(prev);
        next.delete(tempId);
        return next;
      });


      if (result.success && result.data) {
        setMessages(prev => prev.map(msg =>
          msg.id === tempId ? result.data : msg
        ));
      }
    } catch (error) {
      console.error('[ChatContext] Failed to send:', error);
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      setPendingMessages(prev => {
        const next = new Set(prev);
        next.delete(tempId);
        return next;
      });
    }
  }, [currentUser, connectionStatus, sendSSEMessage]);


  // Add message queue processing
  useEffect(() => {
    if (connectionStatus === 'connected' && messageQueue.current.length > 0) {
      console.log('[ChatProvider] Processing queued messages:', messageQueue.current.length)
      messageQueue.current.forEach(msg => sendTextMessage(msg.content, msg.receiverId))
      messageQueue.current = []
    }
  }, [connectionStatus, sendTextMessage])


  // Update notifyTyping to use memoized WebSocket reference
  const notifyTyping = useCallback((receiverId: string) => {
    const typingMessage = {
      id: crypto.randomUUID(),
      type: 'typing' as const,
      receiverId,
      senderId: currentUser.id,
      timestamp: new Date().toISOString()
    };
    sendSSEMessage(typingMessage);
  }, [currentUser.id, sendSSEMessage]);


  // Add cleanup for typing timeout
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);


  // Simplified activity tracking
  const updateActivity = useCallback(() => {
    const statusMessage: MessageAPIPayload = {
      type: 'user_status',
      senderId: currentUser.id,
      receiverId: 'broadcast',
      status: 'online',
      timestamp: new Date().toISOString()
      // onlineUsers is handled on the server side
    };
    sendSSEMessage(statusMessage);
  }, [currentUser.id, sendSSEMessage]);


  useEffect(() => {
    if (!currentUser.id || connectionStatus !== 'connected') return;


    updateActivity();
    const activityInterval = setInterval(updateActivity, 30000);


    const activityHandler = () => {
      if (connectionStatus === 'connected') {
        updateActivity();
      }
    };


    window.addEventListener('mousemove', activityHandler);
    window.addEventListener('keydown', activityHandler);
    window.addEventListener('click', activityHandler);


    return () => {
      clearInterval(activityInterval);
      window.removeEventListener('mousemove', activityHandler);
      window.removeEventListener('keydown', activityHandler);
      window.removeEventListener('click', activityHandler);
    };
  }, [currentUser.id, connectionStatus, updateActivity]);


  // Add memoization for contextValue
  const contextValue = useMemo(() => ({
    messages,
    sendMessage: sendTextMessage,
    sendTextMessage,            
    isLoading,
    selectedChat,
    setSelectedChat,
    navigateToChat,
    currentUserId: currentUser.id,
    notifyTyping,
    isTyping,
    onlineUsers,
    lastSeen, // Add this line
    typingUsers, // Add this line
    pendingMessages, // Add this line
    ...callContext
  }), [
    messages,
    sendTextMessage,
    isLoading,
    selectedChat,
    isTyping,
    setSelectedChat,
    navigateToChat,
    currentUser.id,
    notifyTyping,
    isTyping,
    onlineUsers,
    lastSeen, // Add this line
    typingUsers, // Add this line
    pendingMessages, // Add this line
    callContext
  ]);


  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
}


export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within ChatProvider');
  return context;
};







