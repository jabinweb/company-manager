'use client'

import { useState } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

interface Notification {
  id: string
  title: string
  description: string
  date: string
  read: boolean
}

export function NotificationsPopover() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="flex justify-between items-center">
          <h4 className="font-semibold">Notifications</h4>
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              className="text-xs"
              onClick={() => {
                setNotifications(prev => prev.map(n => ({ ...n, read: true })))
                setUnreadCount(0)
              }}
            >
              Mark all as read
            </Button>
          )}
        </div>
        <Separator className="my-2" />
        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <p className="text-sm text-center text-muted-foreground py-4">
              No notifications
            </p>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg text-sm ${
                    notification.read ? "bg-background" : "bg-muted"
                  }`}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <p className="font-medium">{notification.title}</p>
                  <p className="text-muted-foreground">{notification.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {notification.date}
                  </p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
