import { useCallback, useMemo } from 'react';
import { useChat } from '@/contexts/chat-context';

export type UserStatus = 'active' | 'inactive' | 'typing' | 'offline';

interface UseUserStatusReturn {
  isOnline: boolean;
  status: UserStatus;
  lastSeen: Date | null;
  getStatusText: () => string;
  getStatusClass: () => string;
}

export function useUserStatus(userId: string | undefined): UseUserStatusReturn {
  const { onlineUsers, lastSeen } = useChat();

  const isOnline = useMemo(() => {
    // Simple check if user is in onlineUsers set
    const online = Boolean(userId && onlineUsers.has(userId));
    console.log('[useUserStatus] 🟢 Status check:', {
      userId,
      online,
      allOnlineUsers: Array.from(onlineUsers),
    });
    return online;
  }, [userId, onlineUsers]);

  const status = useMemo((): UserStatus => {
    return isOnline ? 'active' : 'offline';
  }, [isOnline]);

  const userLastSeen = useMemo(() => {
    return userId ? lastSeen.get(userId) || null : null;
  }, [userId, lastSeen]);

  const getStatusText = useCallback(() => {
    if (!userId) {
      return 'Unknown';
    }
    if (onlineUsers.has(userId)) {
      return 'Active Now'; // Important: Show active status if in onlineUsers
    }
    const last = lastSeen.get(userId);
    if (!last) {
      return 'Offline';
    }
    const diff = Date.now() - last.getTime();
    if (diff < 60000) {
      return 'Active just now';
    } else if (diff < 3600000) {
      return `Active ${Math.floor(diff / 60000)}m ago`;
    } else if (diff < 86400000) {
      return `Active ${Math.floor(diff / 3600000)}h ago`;
    }
    return `Last seen on ${last.toLocaleDateString()}`;
  }, [userId, onlineUsers, lastSeen]);

  const getStatusClass = useCallback(() => {
    return isOnline ? 'text-green-500' : 'text-gray-400';
  }, [isOnline]);

  return {
    isOnline,
    status,
    lastSeen: userLastSeen,
    getStatusText,
    getStatusClass
  };
}
