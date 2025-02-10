'use client'

import { useEffect, useRef, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { Phone, PhoneOff, Video, VideoOff, PhoneCall, PhoneIncoming } from 'lucide-react'
import type { CallData } from '@/types/call'
import { VisuallyHidden } from '@reach/visually-hidden'
import { audioService } from '@/lib/audio-service'
import React from 'react'
import { webRTCService } from '@/lib/webrtc-service'
import { CallTimer } from './call-timer'

interface CallDialogProps {
  call: CallData | null
  onAccept: () => void
  onReject: () => void
  onClose: () => void
  isIncoming?: boolean
  receiverInfo?: {
    name: string
    avatar: string | null
  }
}

interface CallDialogState {
  hasError: boolean;
}

class CallDialogErrorBoundary extends React.Component<{children: React.ReactNode}, CallDialogState> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught in CallDialogErrorBoundary: ", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children; 
  }
}

export function CallDialog({ call, onAccept, onReject, onClose, isIncoming, receiverInfo }: CallDialogProps) {
  const isBrowser = typeof window !== 'undefined';
  const [isOpen, setIsOpen] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);

  useEffect(() => {
    console.log('[CallDialog] Call state changed:', {
      hasCall: !!call,
      callStatus: call?.status,
      isIncoming
    });
    setIsOpen(!!call);
  }, [call, isIncoming]);

  useEffect(() => {
    if (!isBrowser || !call) return;

    console.log('[CallDialog] Call state changed:', { 
      status: call.status, 
      type: call.type,
      isIncoming 
    });

    setIsOpen(true);

    if (call.status === 'ringing' && !isIncoming) {
      console.log('[CallDialog] Initializing outgoing call');
      webRTCService.initializeCall(call.type === 'video', call.receiverId)
        .then(stream => {
          console.log('[CallDialog] Local stream obtained');
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        })
        .catch(error => {
          console.error('[CallDialog] Media error:', error);
          onReject();
        });
    }

    return () => {
      console.log('[CallDialog] Cleaning up call');
      webRTCService.cleanup();
      audioService.stopAll();
    };
  }, [isBrowser, call, isIncoming, onReject]);

  useEffect(() => {
    if (!call) return;

    const handleSignalingMessage = async (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      if (data.type === 'webrtc_signaling') {
        console.log('[CallDialog] Received WebRTC signaling message:', data.payload);
        await webRTCService.handleSignalingMessage(data.payload);
      }
    };

    // Listen for WebRTC signaling messages
    const eventSource = new EventSource('/api/sse');
    eventSource.onmessage = handleSignalingMessage;

    return () => {
      eventSource.close();
    };
  }, [call]);

  useEffect(() => {
    if (!call) return;

    if (call.status === 'connected') {
      // Create and send offer if we're the caller
      if (!isIncoming) {
        webRTCService.createOffer()
          .then(async (offer) => {
            await webRTCService.setLocalDescription(offer);
            // Offer will be sent through the emitSignalingMessage method
          })
          .catch(error => {
            console.error('[CallDialog] Offer creation failed:', error);
          });
      }
    }
  }, [call?.status, isIncoming]);

  useEffect(() => {
    if (!call || !call.sdp) return;

    if (call.status === 'connected') {
      webRTCService.setOnStreamUpdate((stream) => {
        console.log('[CallDialog] Received stream update');
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
        }
      });

      // Show local stream
      const localStream = webRTCService.getLocalStream();
      if (localStream && localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
      }
    }
  }, [call?.status, call?.sdp]);

  useEffect(() => {
    // Only play sounds in browser environment
    if (typeof window === 'undefined') return;

    if (call?.status === 'ringing') {
      if (isIncoming) {
        audioService.playRingTone();
      } else {
        audioService.playDialTone();
      }
    }

    return () => {
      audioService.stopAll();
    };
  }, [call?.status, isIncoming]);

  useEffect(() => {
    if (call?.status === 'connected' && !callStartTime) {
      setCallStartTime(new Date())
      audioService.stopAll()
    } else if (!call || call.status !== 'connected') {
      setCallStartTime(null)
    }
  }, [call, callStartTime])

  // Early return if no call data
  if (!call) {
    console.log('[CallDialog] No call data, not rendering');
    return (
      <Dialog open={false} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md" />
      </Dialog>
    );
  }

  // Show receiver info for outgoing calls, caller info for incoming calls
  const displayName = isIncoming ? call.callerName : (receiverInfo?.name || 'Unknown User')
  const displayAvatar = isIncoming ? call.callerAvatar : (receiverInfo?.avatar || '')

  // Ensure dialog is always mounted but hidden when no call
  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open) {
          console.log('[CallDialog] Dialog closing');
          audioService.stopAll();
          webRTCService.cleanup();
          onClose();
        }
        setIsOpen(open);
      }}
      modal={true}
    >
      <CallDialogErrorBoundary>
        <DialogContent className="sm:max-w-md">
          {call && (
            <>
              <DialogHeader>
                <VisuallyHidden>
                  <DialogTitle>
                    {isIncoming ? 'Incoming Call' : 'Outgoing Call'}
                  </DialogTitle>
                </VisuallyHidden>
              </DialogHeader>
              <div className="flex flex-col items-center gap-6 py-10">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={displayAvatar || ''} alt={displayName} />
                </Avatar>
                
                <div className="flex flex-col items-center gap-2 text-center">
                  <h2 className="text-xl font-semibold">{displayName}</h2>
                  <div className="text-muted-foreground flex items-center gap-2">
                    {call.status === 'ringing' ? (
                      <>
                        {isIncoming ? (
                          <PhoneIncoming className="h-4 w-4 animate-pulse text-primary" />
                        ) : (
                          <PhoneCall className="h-4 w-4 animate-pulse text-primary" />
                        )}
                        {isIncoming ? 'Incoming' : 'Calling'}
                      </>
                    ) : call.status === 'connected' ? (
                      <div className="flex items-center">
                        <span className="text-green-500 mr-2">Connected</span>
                        {callStartTime && <CallTimer startTime={callStartTime} />}
                      </div>
                    ) : (
                      call.status
                    )} {call.type} call...
                  </div>
                </div>

                <div className="flex gap-4">
                  {isIncoming ? (
                    call.status === 'ringing' ? (
                      <>
                        <Button
                          size="lg"
                          variant="destructive"
                          className="rounded-full h-16 w-16"
                          onClick={onReject}
                        >
                          <PhoneOff className="h-6 w-6" />
                        </Button>
                        <Button
                          size="lg"
                          variant="default"
                          className="rounded-full h-16 w-16 bg-green-500 hover:bg-green-600"
                          onClick={onAccept}
                        >
                          {call.type === 'audio' ? (
                            <Phone className="h-6 w-6" />
                          ) : (
                            <Video className="h-6 w-6" />
                          )}
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="lg"
                        variant="destructive"
                        className="rounded-full h-16 w-16"
                        onClick={onReject}
                      >
                        {call.type === 'audio' ? (
                          <PhoneOff className="h-6 w-6" />
                        ) : (
                          <VideoOff className="h-6 w-6" />
                        )}
                      </Button>
                    )
                  ) : (
                    <Button
                      size="lg"
                      variant="destructive"
                      className="rounded-full h-16 w-16"
                      onClick={onReject}
                    >
                      {call.type === 'audio' ? (
                        <PhoneOff className="h-6 w-6" />
                      ) : (
                        <VideoOff className="h-6 w-6" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
              {call?.type === 'video' && (
                <div className="grid grid-cols-2 gap-4">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full"
                  />
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full"
                  />
                </div>
              )}
            </>
          )}
        </DialogContent>
      </CallDialogErrorBoundary>
    </Dialog>
  )
}
