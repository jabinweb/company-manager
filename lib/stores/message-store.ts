import { create } from 'zustand';

interface Contact {
  id: string;
  name: string;
  avatar: string;
  lastMessage?: {
    content: string;
    timestamp: string;
    unread: boolean;
  };
}

interface MessageStore {
  contacts: Contact[];
  setContacts: (contacts: Contact[]) => void;
  updateContact: (id: string, updates: Partial<Contact>) => void;
  markAsRead: (contactId: string) => void;
  addMessage: (message: {
    contactId: string;
    content: string;
    timestamp: string;
    isSender: boolean;
  }) => void;
}

// Add debounce utility
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export const useMessageStore = create<MessageStore>((set, get) => ({
  contacts: [],
  setContacts: (contacts) => set({ contacts }),
  updateContact: (id, updates) => set((state) => ({
    contacts: state.contacts.map(contact => 
      contact.id === id ? { ...contact, ...updates } : contact
    )
  })),
  markAsRead: (contactId) => set((state) => ({
    contacts: state.contacts.map(contact =>
      contact.id === contactId
        ? { 
            ...contact, 
            lastMessage: contact.lastMessage 
              ? { ...contact.lastMessage, unread: false } 
              : undefined 
          }
        : contact
    )
  })),
  addMessage: debounce(({ contactId, content, timestamp, isSender }) => {
    set((state) => {
      const newContacts = [...state.contacts];
      const contactIndex = newContacts.findIndex(c => c.id === contactId);
      
      if (contactIndex === -1) return state;

      newContacts[contactIndex] = {
        ...newContacts[contactIndex],
        lastMessage: {
          content,
          timestamp,
          unread: !isSender
        }
      };

      return {
        contacts: newContacts.sort((a, b) => {
          const aTime = a.lastMessage?.timestamp || '0';
          const bTime = b.lastMessage?.timestamp || '0';
          return new Date(bTime).getTime() - new Date(aTime).getTime();
        })
      };
    });
  }, 300), // Debounce for 300ms
}));
