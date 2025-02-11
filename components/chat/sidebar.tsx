"use client";

import { MoreHorizontal, Search, MessageSquarePlus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMessageStore } from '@/lib/stores/message-store';
import { useMemo, useState } from 'react';
import { ChatContact, type ChatContactItem } from './chat-contact';
import { cn } from "@/lib/utils";

interface SidebarProps {
  isCollapsed: boolean;
  isMobile: boolean;
  onSelect: (user: ChatContactItem) => void;
}

type ChatVariant = "secondary" | "ghost";

export function Sidebar({ isCollapsed, isMobile, onSelect }: SidebarProps) {
  const contacts = useMessageStore((state) => state.contacts);
  const [searchQuery, setSearchQuery] = useState("");

  const chatItems = useMemo<ChatContactItem[]>(() => 
    contacts
      .filter(contact => contact.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .map(contact => {
        const variant: ChatVariant = contact.lastMessage?.unread ? "secondary" : "ghost";
        return {
          id: contact.id,
          name: contact.name,
          avatar: contact.avatar,
          variant,
          lastMessage: contact.lastMessage
        };
      }),
    [contacts, searchQuery]
  );

  return (
    <div className={cn(
      "m-auto flex flex-col h-full bg-background transition-all duration-300 ease-in-out",
      isCollapsed ? "w-16" : "w-full md:w-80"
    )}>
      <div className="p-3 flex justify-between items-center bg-muted/30">
        {!isCollapsed && (
          <Avatar className="h-10 w-10">
            <AvatarImage src="/avatars/default.png" />
          </Avatar>
        )}
        <div className={cn(
          "flex gap-2",
          isCollapsed && "w-full justify-center"
        )}>
          {!isCollapsed && (
            <button className={buttonVariants({ variant: "ghost", size: "icon" })}>
              <MessageSquarePlus className="h-5 w-5" />
            </button>
          )}
          <button className={buttonVariants({ variant: "ghost", size: "icon" })}>
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search chats"
              className="w-full pl-9 pr-4 py-2 bg-muted/50 rounded-lg text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      )}

      <ScrollArea className="h-[calc(100vh-11.5rem)]">
        <div className="flex flex-col">
          {chatItems.map((contact) => (
            <ChatContact
              key={contact.id}
              contact={contact}
              onSelect={onSelect}
              isCollapsed={isCollapsed}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}