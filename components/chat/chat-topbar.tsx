import React, { useEffect, useCallback, useMemo } from "react";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Info, Phone, PhoneOff, Video, VideoOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { useChat } from "@/contexts/chat-context";
import { CallDialog } from './call-dialog';
import { useCall } from "@/contexts/call-context";

interface ChatTopbarProps {
  selectedUser: {
    id: string;
    name: string;
    avatar: string;
  };
}

export default function ChatTopbar({ selectedUser }: ChatTopbarProps) {
  const { onlineUsers } = useChat();
  const { initiateCall, activeCall, incomingCall, acceptCall, rejectCall, endCall } = useCall();

  // Track online status for selected user with debug logging
  const isUserOnline = useMemo(() => {
    const online = onlineUsers.has(selectedUser.id);
    console.log('[ChatTopbar] Checking online status:', {
      userId: selectedUser.id,
      isOnline: online,
      allOnlineUsers: Array.from(onlineUsers)
    });
    return online;
  }, [selectedUser.id, onlineUsers]);

  const handleCallClick = useCallback((type: 'audio' | 'video') => {
    console.log('[ChatTopbar] Call initiated:', { type, userId: selectedUser.id });
    initiateCall(selectedUser.id, type);
  }, [selectedUser.id, initiateCall]);

  return (
    <>
      <div className="flex justify-between items-center p-2 border-b border-muted-foreground/20">
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src={selectedUser.avatar} alt={selectedUser.name} />
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{selectedUser.name}</span>
            <span className={cn("text-xs flex items-center gap-1", {
              "text-green-500": isUserOnline,
              "text-gray-400": !isUserOnline
            })}>
              <span className={cn("h-2 w-2 rounded-full", {
                "bg-green-500 animate-pulse": isUserOnline,
                "bg-gray-400": !isUserOnline
              })} />
              {isUserOnline ? "Active Now" : "Offline"}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant={activeCall ? "destructive" : "ghost"}
            size="icon"
            onClick={() => handleCallClick('audio')}
            className="h-9 w-9"
          >
            {activeCall ? <PhoneOff size={20} /> : <Phone size={20} />}
          </Button>
          <Button
            variant={activeCall ? "destructive" : "ghost"}
            size="icon"
            onClick={() => handleCallClick('video')}
            className="h-9 w-9"
          >
            {activeCall ? <VideoOff size={20} /> : <Video size={20} />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
          >
            <Info size={20} />
          </Button>
        </div>
      </div>

      <CallDialog
        call={activeCall}
        onAccept={acceptCall}
        onReject={endCall}
        onClose={endCall}
        isIncoming={false}
        receiverInfo={{
          name: selectedUser.name,
          avatar: selectedUser.avatar
        }}
      />

      <CallDialog
        call={incomingCall}
        onAccept={acceptCall}
        onReject={rejectCall}
        onClose={rejectCall}
        isIncoming={true}
      />
    </>
  );
}
