'use client'

import { useEffect, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSessionStore } from '@/lib/session';
import type { LoginFormData, Session, AuthStatus, LoginResponse } from '@/types/auth';

export function useSession() {
  const { token, user, sessionId, setSession, clearSession, isExpired } = useSessionStore();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');

  const login = useCallback(async (credentials: LoginFormData): Promise<LoginResponse> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        return { 
          success: false, 
          error: data.error 
        };
      }

      setSession(data.token, data.user, data.sessionId);
      console.log('[useSession] Login success:', { userId: data.user.id });
      
      router.push(data.redirectTo);
      
      return { success: true, ...data };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: 'Login failed'
      };
    }
  }, [setSession, router]);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } finally {
      clearSession();
      router.push('/auth/login');
    }
  }, [clearSession, router]);

  const refreshSession = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/refresh');
      if (!response.ok) throw new Error('Refresh failed');

      const data = await response.json();
      setSession(data.token, data.user, data.sessionId);
      return true;
    } catch (error) {
      console.error('Session refresh error:', error);
      logout();
      return false;
    }
  }, [setSession, logout]);

  const getExpiryTime = (user: Session['user'] | null) => {
    const DEFAULT_EXPIRY = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days
    return user?.expiresAt || DEFAULT_EXPIRY;
  };

  // Auto refresh token before expiry
  useEffect(() => {
    if (!token || isExpired()) return;

    const expiryTime = getExpiryTime(user);
    const timeLeft = expiryTime - Date.now();
    const refreshTime = timeLeft * 0.8;

    const timeout = setTimeout(refreshSession, refreshTime);
    return () => clearTimeout(timeout);
  }, [token, user, refreshSession, isExpired]);

  // Base fetch wrapper with auth
  const fetchWithAuth = useCallback(async (url: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers);
    
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (response.status === 401) {
      logout();
      throw new Error('Session expired');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }, [token, logout]);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const data = await response.json();

        // console.log('[useSession] Session check:', {
        //   success: !!data.user,
        //   userId: data.user?.id
        // });

        if (data.user) {
          setSession(data.token, data.user, data.user.sessionId);
          setStatus('authenticated');
        } else {
          clearSession();
          setStatus('unauthenticated');
        }
      } catch (error) {
        console.error('[useSession] Check error:', error);
        clearSession();
        setStatus('unauthenticated');
      }
    };

    checkSession();
  }, [setSession, clearSession]);

  return {
    data: token && user ? {
      token,
      user,
      expires: user.expiresAt
    } : null,
    status,
    isLoading: false,
    login,
    logout,  // export logout function
    refreshSession,
    fetchWithAuth
  };
}

export type { Session };
