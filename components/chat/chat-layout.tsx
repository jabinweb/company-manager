"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "@/hooks/use-session";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { cn } from "@/lib/utils";
import { Sidebar } from "./sidebar";
import { Chat } from "./chat";
import { ChatProvider } from '@/contexts/chat-context';
import { User } from "@/types";
import { useMessageStore } from '@/lib/stores/message-store';

interface ChatLayoutProps {
  defaultLayout: number[] | undefined;
  defaultCollapsed?: boolean;
  navCollapsedSize: number;
}

type ExtendedUser = {
  image?: string
} & User

export function ChatLayout({
  defaultLayout = [320, 480],
  defaultCollapsed = false,
  navCollapsedSize,
}: ChatLayoutProps) {
  const { data: session } = useSession();
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedChatItem, setSelectedChatItem] = React.useState<{
    id: string
    name: string
    avatar: string
  } | null>(null);
  
  const messageStore = useMessageStore();

  // Fetch sorted contacts
  useEffect(() => {
    const fetchSortedContacts = async () => {      
      try {
        const response = await fetch('/api/chats/sorted-contacts');
        if (!response.ok) throw new Error('Failed to fetch contacts');
        const data = await response.json();
        
        const formattedContacts = data.map((contact: any) => ({
          id: contact.id,
          name: contact.name,
          avatar: contact.avatar ?? '/avatars/default.png',
          lastMessage: contact.lastMessageContent ? {
            content: contact.lastMessageContent,
            timestamp: contact.lastMessageTimestamp,
            unread: contact.isUnread
          } : undefined
        }));
        
        messageStore.setContacts(formattedContacts);

        // Set first contact as default if none selected
        if (!selectedChatItem && formattedContacts.length > 0) {
          setSelectedChatItem({
            id: formattedContacts[0].id,
            name: formattedContacts[0].name,
            avatar: formattedContacts[0].avatar,
          });
        }
      } catch (error) {
        console.error('Error fetching contacts:', error);
      }
    };

    if (session?.user?.currentCompanyId) {
      fetchSortedContacts();
    }
  }, [session?.user?.currentCompanyId, messageStore, selectedChatItem]);

  // Listen for SSE messages
  useEffect(() => {
    if (!session?.user?.employeeId) return;

    let eventSource = new EventSource('/api/sse');
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'message') {
          const isSender = data.senderId === session.user.employeeId;
          const contactId = isSender ? data.receiverId : data.senderId;
          
          messageStore.addMessage(contactId, {
            id: data.id,
            content: data.content,
            senderId: data.senderId,
            receiverId: contactId,
            timestamp: data.timestamp,
            status: 'SENT'
          });

          if (selectedChatItem?.id === contactId) {
            messageStore.markAsRead(contactId);
          }
        }
      } catch (error) {
        console.error('Error processing SSE message:', error);
      }
    };

    // Add error and reconnection handling
    eventSource.onerror = () => {
      eventSource.close();
      setTimeout(() => {
        // Reconnect after 5 seconds
        const newEventSource = new EventSource('/api/sse');
        eventSource = newEventSource;
      }, 5000);
    };

    return () => eventSource.close();
  }, [session?.user?.employeeId, selectedChatItem, messageStore]);

  // Mobile responsiveness
  useEffect(() => {
    const checkScreenWidth = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkScreenWidth();
    window.addEventListener("resize", checkScreenWidth);
    return () => window.removeEventListener("resize", checkScreenWidth);
  }, []);

  function handleSelectUser(user: { id: string; name: string; avatar: string }) {
    setSelectedChatItem(user);
    if (messageStore.markAsRead) {
      messageStore.markAsRead(user.id).catch(error => {
        console.error('Failed to mark messages as read:', error);
      });
    }
  }

  if (!session?.user) return null;

  const currentUser = session.user as ExtendedUser

  return (
    <ChatProvider 
      currentUser={{
        id: currentUser.employeeId!,
        name: currentUser.name!,
        avatar: currentUser.image ?? '/avatars/default.png'
      }}
    >
      <ResizablePanelGroup
        direction="horizontal"
        onLayout={(sizes: number[]) => {
          document.cookie = `react-resizable-panels:layout=${JSON.stringify(sizes)}`;
        }}
        className="h-full items-stretch"
      >
        <ResizablePanel
          defaultSize={defaultLayout[0]}
          collapsedSize={navCollapsedSize}
          collapsible={true}
          minSize={isMobile ? 0 : 24}
          maxSize={isMobile ? 8 : 30}
          onCollapse={() => {
            setIsCollapsed(true);
            document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(true)}`;
          }}
          onExpand={() => {
            setIsCollapsed(false);
            document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(false)}`;
          }}
          className={cn(
            isCollapsed && "min-w-[50px] md:min-w-[70px] transition-all duration-300 ease-in-out"
          )}
        >
          <Sidebar
            isCollapsed={isCollapsed || isMobile}
            onSelect={handleSelectUser}
            isMobile={isMobile}
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
          {selectedChatItem && (
            <Chat
              selectedUser={selectedChatItem}
              isMobile={isMobile}
            />
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </ChatProvider>
  );
}