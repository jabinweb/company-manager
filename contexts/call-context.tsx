'use client'

import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react'
import { createCallData, type CallData } from '@/types/call'
import { audioService } from '@/lib/audio-service'
import { webRTCService } from '@/lib/webrtc-service'
import { callHandler } from '@/lib/call-handler'

interface CallContextType {
  activeCall: CallData | null
  incomingCall: CallData | null
  initiateCall: (userId: string, type: 'audio' | 'video') => void
  acceptCall: () => void
  rejectCall: () => void
  endCall: () => void
  handleCallEvent: (event: any) => void
}

const CallContext = createContext<CallContextType | null>(null)

interface CallProviderProps {
  children: React.ReactNode
  currentUser: { 
    id: string
    name: string
    avatar: string | null 
  }
  sendSSEMessage?: (data: any) => void
}

export function CallProvider({ 
  children, 
  currentUser,
  sendSSEMessage = () => {} // Provide default no-op function
}: CallProviderProps) {
  const [activeCall, setActiveCall] = useState<CallData | null>(null)
  const [incomingCall, setIncomingCall] = useState<CallData | null>(null)

  // Handle incoming calls
  useEffect(() => {
    const cleanup = callHandler.addListener((call: CallData) => {
      if (call.receiverId === currentUser.id) {
        setIncomingCall(call);
        audioService.playRingTone();
      }
    });

    // Use the returned cleanup function
    return cleanup;
  }, [currentUser.id]);

  // Add cleanup effect
  useEffect(() => {
    return () => {
      audioService.stopAll();
      webRTCService.cleanup();
    };
  }, []);

  const initiateCall = useCallback(async (receiverId: string, type: 'audio' | 'video') => {
    try {
      console.log('[CallContext] 📞 Initiating call:', { receiverId, type });
     
      const callData = createCallData({
        callerId: currentUser.id,
        timestamp: new Date().toISOString(),
        callerName: currentUser.name,
        callerAvatar: currentUser.avatar,
        receiverId,
        type,
        status: 'ringing'
      });

      const offer = await webRTCService.createOffer();
      console.log('[CallContext] Created offer:', offer);

      // Set call with SDP
      const callWithSdp = { ...callData, sdp: offer };
      setActiveCall(callWithSdp);
      audioService.playDialTone();

      // Send call with offer
      sendSSEMessage({
        type: 'call_initiate',
        callData: callWithSdp,
        sdp: offer,
        senderId: currentUser.id,
        receiverId,
        timestamp: new Date().toISOString()
      });

      console.log('[CallContext] Call initiated:', callWithSdp);
    } catch (error) {
      console.error('[CallContext] Call initiation failed:', error);
      handleCallEnd(null);
    }
  }, [currentUser, sendSSEMessage]);

  const handleCallAccept = useCallback(async () => {
    if (!incomingCall?.sdp) {
      console.error('[CallContext] No SDP in incoming call');
      handleCallEnd(incomingCall);
      return;
    }

    try {
      // Stop audio synchronously
      audioService.stopAll();

      // Initialize WebRTC first
      await webRTCService.initializeCall(
        incomingCall.type === 'video',
        incomingCall.callerId,
        (candidate) => {
          sendSSEMessage({
            type: 'call_ice',
            callId: incomingCall.callId,
            candidate,
            senderId: currentUser.id,
            receiverId: incomingCall.callerId,
          });
        }
      );

      // Create and send answer
      console.log('[CallContext] Creating answer');
      const answer = await webRTCService.handleOffer(incomingCall.sdp);
     
      setActiveCall({ ...incomingCall, status: 'connected' });
      setIncomingCall(null);

      sendSSEMessage({
        type: 'call_accept',
        callData: { ...incomingCall, status: 'connected' },
        sdp: answer,
        senderId: currentUser.id,
        receiverId: incomingCall.callerId,
      });
    } catch (error) {
      console.error('[CallContext] Accept failed:', error);
      handleCallEnd(incomingCall);
    }
  }, [incomingCall, currentUser.id, sendSSEMessage]);

  const handleCallEnd = useCallback((call: CallData | null) => {
    if (!call) return;

    console.log('[CallContext] Ending call:', call);
    
    // Ensure cleanup happens first
    audioService.stopAll();
    webRTCService.cleanup();
    
    // Clear local state immediately
    setActiveCall(null);
    setIncomingCall(null);
    
    // Notify other party with guaranteed delivery
    const sendEndSignal = async (retries = 3) => {
      try {
        await sendSSEMessage({
          type: 'call_end',
          callData: call,
          senderId: currentUser.id,
          receiverId: call.receiverId === currentUser.id ? call.callerId : call.receiverId,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        if (retries > 0) {
          console.log('[CallContext] Retrying end signal, attempts left:', retries - 1);
          await new Promise(resolve => setTimeout(resolve, 1000));
          return sendEndSignal(retries - 1);
        }
        console.error('[CallContext] Failed to send end signal:', error);
      }
    };

    sendEndSignal();
  }, [currentUser.id, sendSSEMessage]);

  const rejectCall = useCallback(() => {
    if (!incomingCall) return;
    handleCallEnd(incomingCall);
  }, [incomingCall, handleCallEnd]);

  const endCall = useCallback(() => {
    if (!activeCall) return;
    handleCallEnd(activeCall);
  }, [activeCall, handleCallEnd]);

  const handleCallEvent = useCallback((event: any) => {
    console.log('[CallContext] Handling call event:', event);
    if (!event.callData) return;

    switch (event.type) {
      case 'call_initiate':
        if (event.receiverId === currentUser.id) {
          console.log('[CallContext] Incoming call received');
          setIncomingCall({ ...event.callData, sdp: event.sdp });
          audioService.playRingTone();
        }
        break;

      case 'call_accept':
        if (event.receiverId === currentUser.id && activeCall) {
          console.log('[CallContext] Call accepted, handling answer');
          audioService.stopAll();
          
          (async () => {
            try {
              if (!webRTCService.getLocalStream()) {
                await webRTCService.initializeCall(
                  activeCall.type === 'video',
                  activeCall.receiverId,
                  (candidate) => {
                    sendSSEMessage({
                      type: 'call_ice',
                      callId: activeCall.callId,
                      candidate,
                      senderId: currentUser.id,
                      receiverId: activeCall.receiverId,
                    });
                  }
                );
                await webRTCService.createOffer();
              }

              await webRTCService.handleAnswer(event.sdp);
              setActiveCall(prev => prev ? { ...prev, status: 'connected' } : null);
            } catch (error) {
              console.error('[CallContext] Failed to handle answer:', error);
              handleCallEnd(activeCall);
            }
          })();
        }
        break;

      case 'call_ice':
        if (activeCall?.callId === event.callId) {
          webRTCService.handleIceCandidate(event.candidate).catch(console.error);
        }
        break;

      case 'call_reject':
      case 'call_end':
        console.log('[CallContext] Call end/reject received from:', event.senderId);
        if ((activeCall?.callerId === event.senderId) || 
            (activeCall?.receiverId === event.senderId) ||
            (incomingCall?.callerId === event.senderId)) {
          audioService.stopAll();
          webRTCService.cleanup();
          setActiveCall(null);
          setIncomingCall(null);
        }
        break;
    }
  }, [currentUser.id, activeCall, incomingCall, sendSSEMessage]);

  // Fix connection state monitoring
  useEffect(() => {
    if (!activeCall) return;

    const handleConnectionStateChange = (state: RTCPeerConnectionState) => {
      console.log('[CallContext] Connection state changed:', state);
      if (state === 'disconnected' || state === 'failed' || state === 'closed') {
        handleCallEnd(activeCall);
      }
    };

    webRTCService.onConnectionStateChange(handleConnectionStateChange);
    
    // Check connection periodically
    const checkConnection = setInterval(() => {
      const state = webRTCService.getConnectionState();
      if (state && ['disconnected', 'failed', 'closed'].includes(state)) {
        handleCallEnd(activeCall);
      }
    }, 2000);

    return () => {
      clearInterval(checkConnection);
      webRTCService.offConnectionStateChange();
    };
  }, [activeCall, handleCallEnd]);

  const value = useMemo(() => ({
    activeCall,
    incomingCall,
    initiateCall,
    acceptCall: handleCallAccept,
    rejectCall,
    endCall,
    handleCallEvent
  }), [activeCall, incomingCall, initiateCall, handleCallAccept, rejectCall, endCall, handleCallEvent]);

  return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
}

// Rename useCallContext to useCall for consistency
export function useCall() {
  const context = useContext(CallContext)
  if (!context) throw new Error('useCall must be used within CallProvider')
  return context
}

export type { CallData }



