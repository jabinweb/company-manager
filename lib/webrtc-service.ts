const ICE_SERVERS = {
  iceServers: [
    {
      urls: [
        'stun:stun1.l.google.com:19302',
        'stun:stun2.l.google.com:19302',
        'stun:stun3.l.google.com:19302',
        'stun:stun4.l.google.com:19302',
        'stun:stun.l.google.com:19302',
        'stun:global.stun.twilio.com:3478'
      ]
    }
  ],
  iceCandidatePoolSize: 10,
  iceTransportPolicy: 'all',
  bundlePolicy: 'max-bundle',
  rtcpMuxPolicy: 'require'
};

export class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private onIceCandidate: ((candidate: RTCIceCandidate) => void) | null = null;
  private onStreamHandler: ((stream: MediaStream) => void) | null = null;
  private activeCallId: string | null = null;
  private connectionStateHandler: ((state: RTCPeerConnectionState) => void) | null = null;

  private async ensurePeerConnection(): Promise<RTCPeerConnection> {
    if (!this.peerConnection) {
      this.peerConnection = new RTCPeerConnection(ICE_SERVERS);
      this.setupConnectionHandlers();
    }
    return this.peerConnection;
  }

  private logPeerState() {
    if (!this.peerConnection) return;
    
    console.log('[WebRTC] State:', {
      connectionState: this.peerConnection.connectionState,
      iceConnectionState: this.peerConnection.iceConnectionState,
      iceGatheringState: this.peerConnection.iceGatheringState,
      signalingState: this.peerConnection.signalingState,
      hasLocalStream: !!this.localStream,
      hasRemoteStream: !!this.remoteStream,
      activeCallId: this.activeCallId
    });
  }

   getActiveCallId(): string | null {
    return this.activeCallId;
  }

  getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  setConnectionStateHandler(handler: (state: RTCPeerConnectionState) => void): void {
    this.connectionStateHandler = handler;
    
    // Apply handler to current connection if exists
    if (this.peerConnection) {
      this.peerConnection.onconnectionstatechange = () => {
        handler(this.peerConnection!.connectionState);
      };
    }
  }

  async initializeCall(enableVideo: boolean, onIceCandidate: (candidate: RTCIceCandidate) => void): Promise<MediaStream> {
    try {
      console.log('[WebRTC] Initializing call with config:', ICE_SERVERS);
      
      // Cleanup any existing connections
      this.cleanup();

      // Create new peer connection with enhanced logging
      this.peerConnection = new RTCPeerConnection(ICE_SERVERS);
      this.setupConnectionHandlers();
      this.onIceCandidate = onIceCandidate;

      // Log ICE gathering state changes
      this.peerConnection.onicegatheringstatechange = () => {
        console.log('[WebRTC] ICE gathering state:', this.peerConnection?.iceGatheringState);
      };

      // Get media with fallback
      try {
        this.localStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: enableVideo
        });
      } catch (mediaError) {
        console.error('[WebRTC] Media error:', mediaError);
        // Fallback to audio only if video fails
        if (enableVideo) {
          console.log('[WebRTC] Falling back to audio only');
          this.localStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: false
          });
        } else {
          throw mediaError;
        }
      }

      // Add tracks with error handling
      this.localStream.getTracks().forEach(track => {
        if (!this.peerConnection || !this.localStream) return;
        try {
          this.peerConnection.addTrack(track, this.localStream);
        } catch (error) {
          console.error('[WebRTC] Failed to add track:', error);
        }
      });

      return this.localStream;
    } catch (error) {
      console.error('[WebRTC] Setup error:', error);
      this.cleanup();
      throw error;
    }
  }

  private setupConnectionHandlers(): void {
    if (!this.peerConnection) return;

    this.peerConnection.onicecandidate = ({ candidate }) => {
      if (candidate && this.onIceCandidate) {
        this.onIceCandidate(candidate);
      }
    };

    this.peerConnection.ontrack = (event) => {
      if (this.onStreamHandler) {
        this.onStreamHandler(event.streams[0]);
      }
    };

    this.peerConnection.onconnectionstatechange = () => {
      const currentState = this.peerConnection?.connectionState;
      if (currentState && this.connectionStateHandler) {
        this.connectionStateHandler(currentState);
      }
    };

    this.peerConnection.oniceconnectionstatechange = () => {
      console.log('[WebRTC] ICE state:', this.peerConnection?.iceConnectionState);
      
      // Auto-restart ICE if it fails
      if (this.peerConnection?.iceConnectionState === 'failed') {
        this.peerConnection.restartIce();
      }
    };

    this.peerConnection.oniceconnectionstatechange = () => {
      this.logPeerState();
      if (this.connectionStateHandler) {
        this.connectionStateHandler();
      }
    };

    this.peerConnection.onconnectionstatechange = () => {
      this.logPeerState();
      if (this.connectionStateHandler) {
        this.connectionStateHandler();
      }
    };
  }

  private async resetSignalingState() {
    if (!this.peerConnection) return;
    
    try {
      if (this.peerConnection.signalingState !== 'stable') {
        console.warn('[WebRTC] Resetting unstable connection state');
        // Create empty rollback description
        const rollback = new RTCSessionDescription({ type: 'rollback', sdp: '' });
        await this.peerConnection.setLocalDescription(rollback);
      }
    } catch (error) {
      console.error('[WebRTC] Failed to reset signaling state:', error);
    }
  }

  async createOffer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    try {
      await this.resetSignalingState();
      
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });

      await this.peerConnection.setLocalDescription(offer);
      console.log('[WebRTC] Local description set:', offer.type);
      
      return offer;
    } catch (error) {
      console.error('[WebRTC] Create offer error:', error);
      throw error;
    }
  }

  async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    const pc = await this.ensurePeerConnection();
    if (!answer?.type) throw new Error('Invalid SDP answer');

    try {
      // Only set remote description if we're in the right state
      if (pc.signalingState === 'have-local-offer') {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        console.log('[WebRTC] Remote description set successfully');
        this.logPeerState();
      } else {
        console.warn('[WebRTC] Cannot set remote description in state:', pc.signalingState);
      }
    } catch (error) {
      console.error('[WebRTC] Handle answer failed:', error);
      throw error;
    }
  }

  async handleOffer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    const pc = await this.ensurePeerConnection();

    try {
      // Reset signaling state if needed
      if (pc.signalingState !== 'stable') {
        console.warn('[WebRTC] Resetting unstable connection state');
        await pc.setLocalDescription({ type: 'rollback', sdp: '' });
      }

      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      return answer;
    } catch (error) {
      console.error('[WebRTC] Handle offer error:', error);
      throw error;
    }
  }

  async handleIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    try {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      console.log('[WebRTC] Added ICE candidate');
    } catch (error) {
      console.error('[WebRTC] Failed to add ICE candidate:', error);
      throw error;
    }
  }

  setOnStreamUpdate(callback: (stream: MediaStream) => void): void {
    this.onStreamHandler = callback;
  }

  onConnectionStateChange(handler: (state: RTCPeerConnectionState) => void): void {
    this.connectionStateHandler = handler;
    
    // Apply handler to current connection if exists
    if (this.peerConnection) {
      const currentState = this.peerConnection.connectionState;
      handler(currentState);
    }
  }

  offConnectionStateChange(): void {
    this.connectionStateHandler = null;
  }

  getConnectionState(): RTCPeerConnectionState | null {
    return this.peerConnection?.connectionState || null;
  }

  cleanup(): void {
    console.log('[WebRTC] Cleaning up...');
    
    this.localStream?.getTracks().forEach(track => {
      track.stop();
      console.log('[WebRTC] Stopped track:', track.kind);
    });

    if (this.peerConnection?.signalingState !== 'closed') {
      this.peerConnection?.close();
    }

    this.localStream = null;
    this.remoteStream = null;
    this.peerConnection = null;
    this.onIceCandidate = null;
    this.activeCallId = null;
    this.onStreamHandler = null;
    this.connectionStateHandler = null;
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  setActiveCallId(callId: string) {
    this.activeCallId = callId;
    console.log('[WebRTC] 📞 Set active call ID:', callId);
  }
}

export const webRTCService = new WebRTCService();
