import { MessageStatus } from '@prisma/client';

// Add client-side message statuses
export type ClientMessageStatus = MessageStatus | 'SENDING' | 'FAILED';

export type MessageType = 'new_message' | 'typing' | 'user_status' | 'call';
export type UserStatus = 'online' | 'offline';

interface BaseMessage {
  id: string;
  type: MessageType;
  senderId: string;
  receiverId: string;
  timestamp: string;
}

export interface TextMessage extends BaseMessage {
  type: 'new_message';
  content: string;
  status: ClientMessageStatus; // Update the status type
  sender: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

export interface StatusMessage extends BaseMessage {
  type: 'user_status';
  status: UserStatus;
  onlineUsers?: string[]; // Make onlineUsers optional in the base type
}

export interface TypingMessage extends BaseMessage {
  type: 'typing';
}

export type Message = TextMessage | TypingMessage | StatusMessage;

export interface MessageResponse {
  success: boolean;
  data: Message;
}

export interface ChatContextType {
  messages: Message[];
  isTyping: boolean;
  onlineUsers: Set<string>;
  lastSeen: Map<string, Date>;
  pendingMessages: Set<string>;
  // ... rest of existing properties
}

export type MessageAPIPayload = 
  | (Omit<TextMessage, 'id' | 'sender' | 'status'> & { content: string })
  | (Omit<StatusMessage, 'id' | 'onlineUsers'> & { status: UserStatus }) // Remove onlineUsers from the payload
  | TypingMessage;
