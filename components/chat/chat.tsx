'use client'

import ChatTopbar from "./chat-topbar"
import { ChatList } from "./chat-list"
import ChatBottombar from "./chat-bottombar"
import { useChat } from "../../contexts/chat-context"
import { useEffect } from "react"
import { useSession } from "@/hooks/use-session"

interface ChatProps {
  selectedUser: {
    id: string;
    name: string;
    avatar: string;
  }
  isMobile: boolean
}

export function Chat({ selectedUser, isMobile }: ChatProps) {
  const { data: session } = useSession()
  const { messages, setSelectedChat, sendTextMessage } = useChat()

  useEffect(() => {
    if (selectedUser?.id) {
      console.log('[Chat] Setting selected chat:', selectedUser.id)
      setSelectedChat(selectedUser.id)
    }
  }, [selectedUser?.id, setSelectedChat])

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
        onSend={(content) => sendTextMessage(content, selectedUser.id)}
        disabled={!selectedUser.id}
      />
    </div>
  )
}