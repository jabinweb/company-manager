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
  const [isOpen, setIsOpen] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);

  // Add interaction handler for audio
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    const handleInteraction = () => {
      setHasInteracted(true);
      if (call?.status === 'ringing') {
        isIncoming ? audioService.playRingTone() : audioService.playDialTone();
      }
    };

    window.addEventListener('mousedown', handleInteraction, { once: true });
    window.addEventListener('touchstart', handleInteraction, { once: true });
    window.addEventListener('keydown', handleInteraction, { once: true });

    return () => {
      window.removeEventListener('mousedown', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, [call?.status, isIncoming]);

  useEffect(() => {
    console.log('[CallDialog] Call state changed:', {
      hasCall: !!call,
      callStatus: call?.status,
      isIncoming
    });
    setIsOpen(!!call);
  }, [call, isIncoming]);


  useEffect(() => {
    if (!call) {
      setIsOpen(false);
      return;
    }


    console.log('[CallDialog] Call state changed:', {
      status: call.status,
      type: call.type,
      isIncoming
    });


    setIsOpen(true);


    if (call.status === 'ringing' && !isIncoming) {
      console.log('[CallDialog] Initializing outgoing call');
      webRTCService.initializeCall(
        call.type === 'video',
        call.receiverId,
        (candidate) => {
          // Handle ICE candidate
          fetch('/api/sse', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'webrtc_signaling',
              payload: {
                type: 'ice_candidate',
                candidate,
                callId: call.callId
              },
              receiverId: call.receiverId
            })
          }).catch(console.error);
        }
      )
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
  }, [call, isIncoming, onReject]);


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
  }, [call, call?.status, call?.sdp]);


  // Modify audio effect to work with interaction state
  useEffect(() => {
    if (!call?.status || !hasInteracted) return;

    const playAudio = async () => {
      if (call.status === 'ringing') {
        if (isIncoming) {
          await audioService.playRingTone();
        } else {
          await audioService.playDialTone();
        }
      }
    };

    playAudio();

    return () => {
      audioService.stopAll();
    };
  }, [call?.status, isIncoming, hasInteracted]);

  useEffect(() => {
    if (call?.status === 'connected' && !callStartTime) {
      setCallStartTime(new Date())
      audioService.stopAll()
    } else if (!call || call.status !== 'connected') {
      setCallStartTime(null)
    }
  }, [call, call?.status, callStartTime])


  // Early return if no call data
  if (!call) {
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



