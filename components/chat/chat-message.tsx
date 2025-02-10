'use client'

import { cn } from '@/lib/utils'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import type { Message } from '@/types/messages'
import { format } from 'date-fns'
import { Check, CheckCheck, Clock } from 'lucide-react'

interface ChatMessageProps {
  message: Message
  isOwn: boolean
  isPending?: boolean
}

export function ChatMessage({ message, isOwn, isPending }: ChatMessageProps) {
  if (message.type !== 'new_message') return null;

  return (
    <div className={cn(
      'flex gap-2 p-2',
      isOwn ? 'flex-row-reverse' : 'flex-row'
    )}>
      <Avatar className="h-8 w-8">
        <AvatarImage src={message.sender?.avatar || '/avatars/default.png'} />
      </Avatar>
      
      <div className={cn(
        'flex flex-col max-w-[70%]',
        isOwn ? 'items-end' : 'items-start'
      )}>
        <div className={cn(
          'rounded-lg px-3 py-2 text-sm flex items-center gap-2',
          isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted'
        )}>
          <span>{message.content}</span>
          {isOwn && (
            <span className="ml-2 flex items-center text-xs opacity-70">
              {isPending ? (
                <Clock className="h-3 w-3 animate-pulse" />
              ) : message.status === 'DELIVERED' ? (
                <CheckCheck className="h-3 w-3" />
              ) : (
                <Check className="h-3 w-3" />
              )}
            </span>
          )}
        </div>
        <span className="text-xs text-muted-foreground mt-1">
          {message.timestamp ? format(new Date(message.timestamp), 'HH:mm') : ''}
        </span>
      </div>
    </div>
  )
}
