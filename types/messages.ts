import { MessageStatus, UserStatus } from '@prisma/client';
import type { SSEMessage, SSEEventTypes } from './sse';

export type MessageType = 'TEXT' | 'IMAGE' | 'FILE' | 'new_message' | 'typing';
export type ClientMessageStatus = MessageStatus | 'SENDING' | 'FAILED' | 'DELIVERED' | 'READ' | 'RECEIVED' | 'PENDING';

// Base message interface for all message types
export interface BaseMessage {
  id: string | number; // Allow both string and number IDs
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  createdAt: string;
  status: ClientMessageStatus;
  type: MessageType;
}

export interface ChatMessagePayload extends SSEMessage {
  type: Extract<SSEEventTypes, 'chat_message' | 'typing'>
  payload: {
    id: string
    senderId: string
    receiverId: string
    content: string
    timestamp: string
  }
}

export interface MessageAPIPayload {
  id: string;  // Add id to the interface
  type: string;
  content: string;
  senderId: string;
  receiverId: string;
  timestamp: string;
}

export interface Message extends BaseMessage {
  sender?: {
    avatar?: string;
    name?: string;
  };
}

export interface MessageResponse {
  success: boolean;
  data: Message;
}

export interface ChatContextType {
  createMessage: (content: string, receiverId: string) => Promise<void>;
  messages: Message[];
  isTyping: boolean;
  onlineUsers: Set<string>;
  lastSeen: Map<string, Date>;
  pendingMessages: Set<string>;
  // ... rest of existing properties
}
