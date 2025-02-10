import type { CallData } from './call';

export interface Message {
  id: number;
  content: string;
  senderId: string;
  receiverId: string;
  status: 'SENT' | 'DELIVERED' | 'READ';
  type: 'TEXT' | 'FILE' | 'IMAGE';
  createdAt: Date;
  sender: {
    name: string;
    avatar: string | null;
  };
}

export interface ChatUser {
  id: string;
  name: string;
  avatar: string | null;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  selectedChat: string | null;
  activeCall: CallData | null;
  incomingCall: CallData | null;
  isTyping: boolean;
  onlineUsers: Set<string>;
}

export interface ChatContextType {
  messages: Message[];
  sendMessage: (content: string, receiverId: string) => void;
  isTyping: boolean;
  onlineUsers: Set<string>;
  sendTextMessage: (content: string, receiverId: string) => Promise<void>;
  isLoading: boolean;
  selectedChat: string | null;
  setSelectedChat: (userId: string) => void;
  navigateToChat: (userId: string) => void;
  activeCall: CallData | null;
  incomingCall: CallData | null;
  initiateCall: (userId: string, type: 'audio' | 'video') => void;
  acceptCall: () => void;
  rejectCall: () => void;
  endCall: () => void;
  wsRef: React.MutableRefObject<WebSocket | null>;
  currentUserId: string;
  notifyTyping: (receiverId: string) => void;
}

export interface ChatStateActions {
  setMessages: (messages: Message[]) => void;
  setIsLoading: (loading: boolean) => void;
  setSelectedChat: (userId: string | null) => void;
  setActiveCall: (call: CallData | null) => void;
  setIncomingCall: (call: CallData | null) => void;
  setIsTyping: (typing: boolean) => void;
  addMessage: (message: Message) => void;
  updateOnlineUsers: (userId: string, status: 'online' | 'offline') => void;
  fetchMessages: (userId: string) => Promise<void>;
}

export interface ChatStateRefs {
  typingTimeoutRef: React.MutableRefObject<NodeJS.Timeout | undefined>;
  messageQueueRef: React.MutableRefObject<any[]>;
  prevMessagesRef: React.MutableRefObject<Message[]>;
  lastTypingNotificationRef: React.MutableRefObject<number>;
}
