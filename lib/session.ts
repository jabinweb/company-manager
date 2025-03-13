'use client'

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useRouter } from 'next/navigation';
import { useEffect, useCallback } from 'react';
import { redirect } from 'next/navigation';
import type { Session, User } from '@/types/auth';
import { AUTH_CONFIG } from '@/config/auth';

interface SessionStore {
  token: string | null;
  user: User | null;
  sessionId: string | null;
  setSession: (token: string, user: User, sessionId: string) => void;
  clearSession: () => void;
  isExpired: () => boolean;
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      sessionId: null,

      setSession: (token, user, sessionId) => {
        console.log('[Session] Setting session:', { userId: user.id, role: user.role });
        set({ token, user, sessionId });
      },

      clearSession: () => {
        console.log('[Session] Clearing session');
        set({ token: null, user: null, sessionId: null });
        console.log('Redirecting to login page');
        
        redirect('/auth/login');
      },

      isExpired: () => {
        const token = get().token;
        if (!token) return true;
        try {
          const [, payload] = token.split('.');
          const { exp = 0 } = JSON.parse(atob(payload));
          return Date.now() >= exp * 1000;
        } catch {
          return true;
        }
      }
    }),
    {
      name: AUTH_CONFIG.COOKIE.name, // Use same cookie name as auth config
      skipHydration: true // Important for SSR
    }
  )
);

// Hook to handle session checks and auto logout
export function useSessionCheck() {
  const router = useRouter();
  const { isExpired, clearSession } = useSessionStore();

  const handleLogout = useCallback(() => {
    clearSession();
    router.push('/auth/login');
  }, [clearSession, router]);

  // Check session on mount and setup refresh interval
  useEffect(() => {
    // Initial check
    if (isExpired()) {
      handleLogout();
      return;
    }

    // Check every minute
    const interval = setInterval(() => {
      if (isExpired()) {
        handleLogout();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [handleLogout, isExpired]);

  return { handleLogout };
}
