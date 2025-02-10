'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { toast } from "@/hooks/use-toast"
import type { Notification } from "@/types/notifications"
import { useRouter } from 'next/navigation';

interface NotificationHandlerProps {
  notification: Notification
  open: boolean
  onOpenChange: (open: boolean) => void
  onDismiss?: (notificationId: string) => void
  onActionComplete?: () => void
}

export function NotificationHandler({
  notification,
  open,
  onOpenChange,
  onDismiss,
  onActionComplete
}: NotificationHandlerProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false)
  const [comment, setComment] = useState("")

  const handleAction = async (action: 'APPROVE' | 'REJECT') => {
    setLoading(true)
    try {
      const requestId = notification.metadata?.requestId
      if (!requestId) {
        throw new Error('Leave request ID not found')
      }

      console.log('Sending action request:', {
        requestId,
        action,
        comment
      })

      const response = await fetch(
        `/api/leave-requests/${requestId}/${action.toLowerCase()}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ comment })
        }
      )

      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.message || data.error || 'Action failed')
      }

      toast({
        title: "Success",
        description: data.message,
      })

      onOpenChange(false)
      onActionComplete?.()
    } catch (error) {
      console.error('Action error:', error instanceof Error ? error.message : error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to ${action.toLowerCase()} request`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDismiss = () => {
    onDismiss?.(notification.id)
    onOpenChange(false)
  }

  const handleMessageNotification = () => {
    const senderId = notification.metadata?.senderId;
    if (senderId) {
      router.push(`/messages?userId=${senderId}`);
      onOpenChange(false);
      onDismiss?.(notification.id);
    }
  };

  const renderContent = () => {
    switch (notification.type) {
      case 'NEW_MESSAGE':
        return (
          <>
            <DialogHeader>
              <DialogTitle>New Message from {notification.metadata?.senderName}</DialogTitle>
              <DialogDescription>
                {notification.metadata?.preview}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={handleMessageNotification}>
                Open Chat
              </Button>
            </DialogFooter>
          </>
        );
      case 'LEAVE_REQUEST':
        return (
          <>
            <DialogHeader>
              <DialogTitle>Leave Request</DialogTitle>
              <div className="space-y-4">
                <DialogDescription>
                  {notification.message}
                </DialogDescription>
                
                {notification.metadata?.reason && (
                  <div>
                    <strong className="text-foreground">Reason:</strong>
                    <DialogDescription className="mt-1">
                      {notification.metadata.reason}
                    </DialogDescription>
                  </div>
                )}

                <div className="text-xs text-muted-foreground grid gap-1">
                  <div>From: {new Date(notification.metadata?.startDate).toLocaleDateString()}</div>
                  <div>To: {new Date(notification.metadata?.endDate).toLocaleDateString()}</div>
                  <div>Type: {notification.metadata?.type}</div>
                  <div>Department: {notification.metadata?.department}</div>
                </div>
              </div>
            </DialogHeader>

            <div className="py-4">
              <Textarea
                placeholder="Add a comment (optional)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="destructive"
                onClick={() => handleAction('REJECT')}
                disabled={loading}
              >
                Reject
              </Button>
              <Button
                onClick={() => handleAction('APPROVE')}
                disabled={loading}
              >
                Approve
              </Button>
            </DialogFooter>
          </>
        )

      case 'LEAVE_APPROVED':
      case 'LEAVE_REJECTED':
        return (
          <>
            <DialogHeader>
              <DialogTitle>Leave Request {notification.type === 'LEAVE_APPROVED' ? 'Approved' : 'Rejected'}</DialogTitle>
              <DialogDescription>
                {notification.message}
              </DialogDescription>
              <div className="mt-4 text-xs text-muted-foreground">
                Processed by: {notification.metadata?.actionBy}
                <br />
                {notification.metadata?.comment && (
                  <>
                    Comment: {notification.metadata.comment}
                    <br />
                  </>
                )}
                Date: {new Date(notification.createdAt).toLocaleString()}
              </div>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={handleDismiss}>
                Dismiss
              </Button>
            </DialogFooter>
          </>
        )

      default:
        return (
          <>
            <DialogHeader>
              <DialogTitle>{notification.title}</DialogTitle>
              <DialogDescription>
                {notification.message}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={handleDismiss}>
                Dismiss
              </Button>
            </DialogFooter>
          </>
        )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {renderContent()}
      </DialogContent>
    </Dialog>
  )
}
