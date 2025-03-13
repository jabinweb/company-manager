import type { Message } from '@prisma/client'

export type SSEEventTypes = 
  | 'chat_message' 
  | 'user_status' 
  | 'notification'
  | 'typing'
  | 'call_request'
  | 'call_accepted'
  | 'call_rejected'
  | 'call_ended';

export interface SSEMessage {
  type: SSEEventTypes;
  payload: any;
  receiverId?: string;
  timestamp?: string;
}

export interface ChatMessage extends SSEMessage {
  type: 'chat_message'
  payload: Message
}

export interface UserStatusMessage extends SSEMessage {
  type: 'user_status'
  payload: {
    isOnline: boolean
    lastActive: Date
  }
}
