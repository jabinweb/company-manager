import { cn } from "@/lib/utils";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { CheckCheck } from "lucide-react";

export interface ChatContactItem {
  id: string;
  name: string;
  avatar: string;
  variant: "secondary" | "ghost";
  lastMessage?: {
    content: string;
    timestamp: string;
    unread: boolean;
  };
}

interface ChatContactProps {
  contact: ChatContactItem;
  onSelect: (contact: ChatContactItem) => void;
  isCollapsed: boolean;
}

export function ChatContact({ contact, onSelect, isCollapsed }: ChatContactProps) {
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  if (isCollapsed) {
    return (
      <button
        onClick={() => onSelect(contact)}
        className={cn(
          "w-full p-2 flex justify-center hover:bg-muted/50 transition-colors",
          "border-b border-border/50 last:border-0 relative",
          contact.lastMessage?.unread && "bg-muted/30"
        )}
      >
        <Avatar className="h-12 w-12 shrink-0">
          <AvatarImage src={contact.avatar} alt={contact.name} />
        </Avatar>
        {contact.lastMessage?.unread && (
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={() => onSelect(contact)}
      className={cn(
        "w-full p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors",
        "border-b border-border/50 last:border-0",
        contact.lastMessage?.unread && "bg-muted/30"
      )}
    >
      <Avatar className="h-12 w-12 shrink-0">
        <AvatarImage src={contact.avatar} alt={contact.name} />
      </Avatar>
      
      <div className="flex-1 min-w-0 text-left">
        <div className="flex justify-between items-baseline">
          <span className="font-medium truncate">{contact.name}</span>
          {contact.lastMessage && (
            <span className={cn(
              "text-xs",
              contact.lastMessage.unread ? "text-primary" : "text-muted-foreground"
            )}>
              {formatTimestamp(contact.lastMessage.timestamp)}
            </span>
          )}
        </div>
        
        {contact.lastMessage && (
          <div className="flex items-center gap-1">
            {!contact.lastMessage.unread && (
              <CheckCheck className="h-4 w-4 text-primary shrink-0" />
            )}
            <p className={cn(
              "text-sm truncate flex-1",
              contact.lastMessage.unread ? "text-foreground font-medium" : "text-muted-foreground"
            )}>
              {contact.lastMessage.content}
            </p>
            {contact.lastMessage.unread && (
              <span className="ml-auto">
                <span className="bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  1
                </span>
              </span>
            )}
          </div>
        )}
      </div>
    </button>
  );
}

