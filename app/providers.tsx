'use client'

import { ThemeProvider } from "next-themes"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'
import { CallProvider } from '@/contexts/call-context'
import { ChatProvider } from '@/contexts/chat-context'
import { useSession } from '@/hooks/use-session'
import { useSSE } from '@/hooks/use-sse'
import { SessionProvider } from "@/components/providers/session-provider"

function ProtectedProviders({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const { send: sendSSEMessage } = useSSE()

  if (!session?.user?.id) {
    return children
  }

  const currentUser = {
    id: String(session.user.id), // Convert number to string
    name: session.user.name,
    avatar: session.user.avatar || '/avatars/default.png' // Use avatar from User type
  }

  return (
    <CallProvider 
      currentUser={currentUser}
      sendSSEMessage={sendSSEMessage}
    >
      <ChatProvider currentUser={currentUser}>
        {children}
      </ChatProvider>
    </CallProvider>
  )
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  }))

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <ProtectedProviders>
            {children}
          </ProtectedProviders>
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </SessionProvider>
  )
}