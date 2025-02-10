'use client'

import { AuthProvider, useAuth } from '@/contexts/auth-context'
import { CallProvider } from '@/contexts/call-context'
import { ChatProvider } from '@/contexts/chat-context'
import { useSSE } from '@/hooks/use-sse'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ProtectedProviders>
        {children}
      </ProtectedProviders>
    </AuthProvider>
  )
}

// Separate component for protected providers that need auth
function ProtectedProviders({ children }: { children: React.ReactNode }) {
  const { sendMessage: sendSSEMessage } = useSSE()
  const { data: session } = useAuth() // Now this is safe because we're inside AuthProvider

  if (!session?.user?.employeeId || !session?.user?.name) {
    return children
  }

  const currentUser = {
    id: session.user.employeeId,
    name: session.user.name,
    avatar: session.user.image ?? null
  } as const

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