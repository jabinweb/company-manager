"use client";

import { MoreHorizontal, SquarePen } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from '@/components/ui/scroll-area'

interface ChatItem {
  id: string;
  name: string;
  avatar: string;
  variant: "secondary" | "ghost";
}

interface SidebarProps {
  isCollapsed: boolean;
  chats: ChatItem[];
  isMobile: boolean;
  onSelect: (user: ChatItem) => void;
}

export function Sidebar({ chats, isCollapsed, isMobile, onSelect }: SidebarProps) {
  return (
    <div
      data-collapsed={isCollapsed}
      className="relative group flex flex-col h-full bg-muted/10 dark:bg-muted/20 gap-4 p-2 data-[collapsed=true]:p-2"
    >
      {!isCollapsed && (
        <div className="flex justify-between p-2 items-center">
          <div className="flex gap-2 items-center text-2xl">
            <p className="font-medium">Chats</p>
            <span className="text-zinc-300">({chats.length})</span>
          </div>

          <div>
            <button
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "h-9 w-9",
              )}
            >
              <MoreHorizontal size={20} />
            </button>

            <button
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "h-9 w-9",
              )}
            >
              <SquarePen size={20} />
            </button>
          </div>
        </div>
      )}
      <ScrollArea className="h-[calc(100vh-10rem)]">
        <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
          {chats.map((chat) =>
            isCollapsed ? (
              <TooltipProvider key={chat.id}>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onSelect(chat)}
                      className={cn(
                        buttonVariants({ variant: chat.variant, size: "icon" }),
                        "h-11 w-11 md:h-16 md:w-16",
                        chat.variant === "secondary" &&
                          "dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white",
                      )}
                    >
                      <Avatar className="flex justify-center items-center">
                        <AvatarImage
                          src={chat.avatar}
                          alt={chat.name}
                          className="w-10 h-10"
                        />
                      </Avatar>
                      <span className="sr-only">{chat.name}</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    className="flex items-center gap-4"
                  >
                    {chat.name}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <button
                key={chat.id}
                onClick={() => onSelect(chat)}
                className={cn(
                  buttonVariants({ variant: chat.variant, size: "lg" }),
                  chat.variant === "secondary" &&
                    "dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white shrink",
                  "justify-start gap-4 w-full",
                )}
              >
                <Avatar className="flex justify-center items-center">
                  <AvatarImage
                    src={chat.avatar}
                    alt={chat.name}
                    className="w-10 h-10"
                  />
                </Avatar>
                <div className="flex flex-col max-w-28 text-left">
                  <span>{chat.name}</span>
                </div>
              </button>
            ),
          )}
        </nav>
      </ScrollArea>
    </div>
  );
}