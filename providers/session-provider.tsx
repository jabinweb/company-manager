'use client';

import { createContext, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSessionStore } from '@/lib/session';

const SessionContext = createContext<ReturnType<typeof useSessionStore> | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const session = useSessionStore();
  const router = useRouter();

  useEffect(() => {
    if (!session.token) {
      const currentPath = window.location.pathname;
      if (!currentPath.startsWith('/auth/')) {
        router.push(`/auth/login?from=${currentPath}`);
      }
    }
  }, [session.token, router]);

  return (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession must be used within SessionProvider');
  return context;
};