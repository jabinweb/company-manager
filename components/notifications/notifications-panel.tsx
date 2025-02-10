'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, Calendar, Clock, Wallet, ClipboardList, FileText, Award } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useNotifications } from '@/hooks/use-notifications'
import { NotificationHandler } from './notification-handler'
import type { Notification, NotificationType } from '@/types/notifications'
import { useState, useEffect } from 'react'

interface NotificationsPanelProps {
  userRole: string
}

// Add return type for useNotifications
interface UseNotificationsReturn {
  notifications: Notification[]
  loading: boolean
  error: string | null
  fetchNotifications: () => Promise<void>
  markAsRead: (notificationId: string) => Promise<void>
  unreadCount: number
  dismissNotification: (notificationId: string) => void
}

export function NotificationsPanel({ userRole }: NotificationsPanelProps) {
  const { 
    notifications, 
    loading, 
    error, 
    unreadCount, 
    fetchNotifications,
    dismissNotification
  } = useNotifications(userRole) as UseNotificationsReturn
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)

  // useEffect(() => {
  //   console.log('NotificationsPanel state:', {
  //     loading,
  //     error,
  //     notificationCount: notifications.length,
  //     unreadCount
  //   })
  // }, [notifications, loading, error, unreadCount])

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'LEAVE_REQUEST':
      case 'LEAVE_APPROVED':
      case 'LEAVE_REJECTED':
        return <Calendar className="h-4 w-4" />
      case 'ATTENDANCE':
        return <Clock className="h-4 w-4" />
      case 'PAYROLL':
        return <Wallet className="h-4 w-4" />
      case 'TASK_ASSIGNED':
      case 'TASK_COMPLETED':
        return <ClipboardList className="h-4 w-4" />
      case 'DOCUMENT_UPLOADED':
        return <FileText className="h-4 w-4" />
      case 'PERFORMANCE_REVIEW':
        return <Award className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    switch (notification.type) {
      case 'NEW_MESSAGE':
        setSelectedNotification(notification);
        break;
      // ... your existing cases ...
      case 'LEAVE_REQUEST':
        if (userRole === 'ADMIN' || userRole === 'MANAGER') {
          setSelectedNotification(notification)
        }
        break
      case 'LEAVE_APPROVED':
      case 'LEAVE_REJECTED':
        setSelectedNotification(notification)
        break
    }
  }

  const handleNotificationDismiss = (notificationId: string) => {
    dismissNotification(notificationId)
  }

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0"
                variant="destructive"
              >
                {unreadCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Notifications</SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
            <div className="space-y-4">
              {notifications.length === 0 ? (
                <p className="text-center text-muted-foreground">
                  {loading ? 'Loading notifications...' : 'No notifications'}
                </p>
              ) : (
                notifications.map(notification => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      "p-4 rounded-lg",
                      // Only show pointer cursor for actionable notifications
                      (notification.type === 'LEAVE_REQUEST' && 
                       (userRole === 'ADMIN' || userRole === 'MANAGER')) || 
                      ['LEAVE_APPROVED', 'LEAVE_REJECTED'].includes(notification.type)
                        ? "cursor-pointer hover:bg-accent"
                        : "cursor-default",
                      notification.read ? "bg-muted/50" : "bg-primary/5"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {getNotificationIcon(notification.type)}
                      <h4 className="font-medium flex-1">{notification.title}</h4>
                      {!notification.read && (
                        <Badge variant="default" className="h-2 w-2 rounded-full p-0" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {selectedNotification && (
        <NotificationHandler
          notification={selectedNotification}
          open={!!selectedNotification}
          onOpenChange={(open) => !open && setSelectedNotification(null)}
          onDismiss={handleNotificationDismiss}
          onActionComplete={() => {
            fetchNotifications()
            setSelectedNotification(null)
          }}
        />
      )}
    </>
  )
}
