"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "@/hooks/use-session";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { cn } from "@/lib/utils";
import { Sidebar } from "./sidebar";
import { Chat } from "./chat";
import { ChatProvider } from '../../contexts/chat-context';
import { User } from "@/types";

interface ChatLayoutProps {
  defaultLayout: number[] | undefined;
  defaultCollapsed?: boolean;
  navCollapsedSize: number;
}

interface Employee {
  id: string;
  name: string;
  avatar: string | null;
  department: string;
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
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedChatItem, setSelectedChatItem] = React.useState<{
    id: string
    name: string
    avatar: string
  } | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Fetch employees for chat
  useEffect(() => {
    const fetchEmployees = async () => {      
      try {
        const response = await fetch('/api/employees/chat-contacts');
        
        if (!response.ok) throw new Error('Failed to fetch employees');
        const data = await response.json();
        
        if (data.success && Array.isArray(data.data)) {
          setEmployees(data.data);
          // Set first employee as default selected user if none selected
          if (!selectedChatItem && data.data.length > 0) {
            setSelectedChatItem({
              id: data.data[0].id,
              name: data.data[0].name,
              avatar: data.data[0].avatar ?? '/avatars/default.png'
            });
          }
        }
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };

    if (session?.user?.currentCompanyId) { // Check for companyId instead of employeeId
      fetchEmployees();
    }
  }, [session?.user?.currentCompanyId, selectedChatItem]);

  // Mobile check effect
  useEffect(() => {
    const checkScreenWidth = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkScreenWidth();
    window.addEventListener("resize", checkScreenWidth);
    return () => window.removeEventListener("resize", checkScreenWidth);
  }, []);

  if (!session?.user) return null;

  const currentUser = session.user as ExtendedUser

  function handleSelectUser(user: { id: string; name: string; avatar: string }) {
    setSelectedChatItem(user);
  }

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
            chats={employees.map((emp) => ({
              id: emp.id,
              name: emp.name,
              avatar: emp.avatar ?? '/avatars/default.png',
              variant: selectedChatItem?.id === emp.id ? "secondary" : "ghost",
            }))}
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