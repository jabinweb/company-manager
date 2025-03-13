import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Message } from '@/types/messages';
import { generateId } from '@/lib/utils';

interface MessagesState {
  contacts: any[];
  messages: Record<string, Message[]>;
  lastFetched: Record<string, number>;
  isLoading: Record<string, boolean>;
  selectedChat: string | null;
  lastMessageTimestamps: Record<string, string>;
  markAsRead: (chatId: string) => Promise<void>;
  
  setContacts: (contacts: any[]) => void;
  addMessage: (chatId: string, message: Partial<Message>) => void;
  setMessages: (chatId: string, messages: Message[]) => void;
  setSelectedChat: (chatId: string | null) => void;
  updateLastFetched: (chatId: string) => void;
  canFetch: (chatId: string) => boolean;
  hasNewMessages: (chatId: string, lastMessageTimestamp: string) => boolean;
  fetchMessages: (chatId: string) => Promise<void>;
}

const FETCH_COOLDOWN = 2000; // 2 seconds between fetches

export const useMessageStore = create<MessagesState>()(
  devtools(
    (set, get) => ({
      contacts: [],
      messages: {},
      lastFetched: {},
      isLoading: {},
      selectedChat: null,
      lastMessageTimestamps: {},

      setContacts: (contacts) => set({ contacts }),

      addMessage: (chatId, message) => set((state) => {
        const existingMessages = state.messages[chatId] || [];
        if (existingMessages.some((m: Message) => m.id === message.id)) {
          return state;
        }

        // Ensure message conforms to Message type
        const fullMessage: Message = {
          id: message.id || generateId(),
          content: message.content || '',
          senderId: message.senderId || '',
          receiverId: message.receiverId || chatId,
          timestamp: message.timestamp || new Date().toISOString(),
          status: message.status || 'SENT',
          type: message.type || 'TEXT',
          createdAt: message.createdAt || new Date().toISOString()
        };

        return {
          messages: {
            ...state.messages,
            [chatId]: [...existingMessages, fullMessage].sort((a, b) => 
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            )
          },
          lastMessageTimestamps: {
            ...state.lastMessageTimestamps,
            [chatId]: fullMessage.timestamp
          }
        };
      }),

      setMessages: (chatId, messages) => set((state) => ({
        messages: { 
          ...state.messages, 
          [chatId]: messages.sort((a, b) => 
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          ) 
        },
        lastFetched: { ...state.lastFetched, [chatId]: Date.now() },
        lastMessageTimestamps: {
          ...state.lastMessageTimestamps,
          [chatId]: messages[messages.length - 1]?.timestamp || state.lastMessageTimestamps[chatId]
        }
      })),

      setSelectedChat: (chatId) => {
        // Prevent unnecessary updates if chat is already selected
        if (get().selectedChat === chatId) return;
        
        set({ selectedChat: chatId });
        // Only fetch if chat changed and we can fetch
        if (chatId && get().canFetch(chatId)) {
          get().fetchMessages(chatId).catch(console.error);
        }
      },

      updateLastFetched: (chatId) => set((state) => ({
        lastFetched: { ...state.lastFetched, [chatId]: Date.now() }
      })),

      canFetch: (chatId) => {
        const state = get();
        const lastFetch = state.lastFetched[chatId] || 0;
        return Date.now() - lastFetch > FETCH_COOLDOWN;
      },

      hasNewMessages: (chatId, lastMessageTimestamp) => {
        const state = get();
        const currentLastTimestamp = state.lastMessageTimestamps[chatId];
        return currentLastTimestamp ? currentLastTimestamp > lastMessageTimestamp : false;
      },

      fetchMessages: async (chatId: string) => {
        const state = get();
        if (state.isLoading[chatId]) return;
        
        try {
         
          set(state => ({
            isLoading: { ...state.isLoading, [chatId]: true }
          }));

          const response = await fetch(`/api/chats/${chatId}`);
          if (!response.ok) throw new Error('Failed to fetch messages');

          const messages = await response.json();
          if (Array.isArray(messages)) {
            const existingMessages = state.messages[chatId] || [];
            const newMessageIds = new Set(messages.map(m => m.id));
            
            const uniqueMessages = [
              ...existingMessages.filter(m => !newMessageIds.has(m.id)),
              ...messages
            ];

            set(state => ({
              messages: {
                ...state.messages,
                [chatId]: uniqueMessages.sort((a, b) => 
                  new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                )
              },
              lastFetched: {
                ...state.lastFetched,
                [chatId]: Date.now()
              }
            }));
          }
        } catch (error) {
          console.error('[Messages] Fetch error:', error);
        } finally {
          set(state => ({
            isLoading: { ...state.isLoading, [chatId]: false }
          }));
        }
      },

      markAsRead: async (chatId: string) => {
        try {
          // Optimistic update
          set(state => ({
            contacts: state.contacts.map(contact => 
              contact.id === chatId 
                ? { ...contact, unreadCount: 0 }
                : contact
            )
          }));

          // Send to server
          await fetch(`/api/chats/${chatId}/read`, {
            method: 'POST'
          });
        } catch (error) {
          console.error('Failed to mark messages as read:', error);
          // Revert on error by re-fetching contacts
          const response = await fetch('/api/chats/sorted-contacts');
          const data = await response.json();
          set({ contacts: data });
        }
      }
    }),
    { name: 'message-store' }
  )
);
