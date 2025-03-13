'use client'

import ChatTopbar from "./chat-topbar"
import { ChatList } from "./chat-list"
import ChatBottombar from "./chat-bottombar"
import { useChat } from "../../contexts/chat-context"
import { useEffect, useState } from "react"

interface ChatProps {
  selectedUser: {
    id: string;
    name: string;
    avatar: string;
  }
  isMobile: boolean
}

export function Chat({ selectedUser, isMobile }: ChatProps) {
  const { messages, setSelectedChat, sendMessage, isLoading } = useChat()
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedUser?.id) {
      setError(null);
      console.debug('[Chat] Loading messages for:', selectedUser.id);
      try {
        setSelectedChat(selectedUser.id)
      } catch (err) {
        console.error('[Chat] Error loading messages:', err);
        setError('Failed to load messages');
      }
    }
  }, [selectedUser?.id, setSelectedChat])

  useEffect(() => {
    console.debug('[Chat] Messages updated:', messages?.length)
  }, [messages])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={() => setSelectedChat(selectedUser.id)}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-between w-full h-full">
      <ChatTopbar selectedUser={selectedUser} />
      <ChatList
        messages={messages}
        selectedUser={selectedUser}
        isMobile={isMobile}
      />
      <ChatBottombar 
        isMobile={isMobile}
        receiverId={selectedUser.id}
        onSend={(content) => sendMessage(content, selectedUser.id)}
        disabled={!selectedUser.id}
      />
    </div>
  )
}