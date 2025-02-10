const ICE_SERVERS = {
  iceServers: [
    {
      urls: [
        'stun:stun1.l.google.com:19302',
        'stun:stun2.l.google.com:19302'
      ]
    }
  ],
  iceCandidatePoolSize: 10
};

// Define interface for public methods
interface IWebRTCService {
  initializeCall(enableVideo: boolean): Promise<MediaStream>;
  cleanup(): void;
  setOnStreamUpdate(callback: (stream: MediaStream) => void): void;
  getLocalStream(): MediaStream | null;
  onConnectionStateChange(handler: (state: RTCPeerConnectionState) => void): void;
  offConnectionStateChange(): void;
  createOffer(): Promise<RTCSessionDescriptionInit>;
  handleSignalingMessage(message: any): Promise<void>;
  getConnectionState(): RTCPeerConnectionState | null;
  handleOffer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit>;
  handleAnswer(answer: RTCSessionDescriptionInit): Promise<void>;
  setLocalDescription(description: RTCSessionDescriptionInit): Promise<void>;
}

class WebRTCService implements IWebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private onStreamHandler: ((stream: MediaStream) => void) | null = null;
  private pendingCandidates: RTCIceCandidate[] = [];
  private connectionStateHandler: ((state: RTCPeerConnectionState) => void) | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializePeerConnection();
    }
  }

  private initializePeerConnection() {
    if (typeof window === 'undefined') return;

    try {
      this.peerConnection = new window.RTCPeerConnection(ICE_SERVERS);
      this.setupConnectionHandlers();
    } catch (error) {
      console.error('[WebRTC] Failed to initialize:', error);
    }
  }

  private setupConnectionHandlers() {
    if (!this.peerConnection) return;

    this.peerConnection.onicecandidate = ({ candidate }) => {
      if (candidate) {
        this.emitSignalingMessage({ type: 'ice_candidate', candidate });
      }
    };

    this.peerConnection.ontrack = (event) => {
      this.remoteStream = event.streams[0];
      if (this.onStreamHandler) {
        this.onStreamHandler(event.streams[0]);
      }
    };

    this.peerConnection.onconnectionstatechange = () => {
      console.log('[WebRTC] Connection state:', this.peerConnection?.connectionState);
      if (this.connectionStateHandler && this.peerConnection) {
        this.connectionStateHandler(this.peerConnection.connectionState);
      }
      if (this.peerConnection?.connectionState === 'failed') {
        this.peerConnection.restartIce();
      }
    };
  }

  private async ensurePeerConnection(): Promise<RTCPeerConnection> {
    if (typeof window === 'undefined') {
      throw new Error('WebRTC is only available in browser environment');
    }

    if (!this.peerConnection) {
      this.peerConnection = new window.RTCPeerConnection(ICE_SERVERS);
      this.setupConnectionHandlers();
    }
    return this.peerConnection;
  }

  async initializeCall(enableVideo: boolean): Promise<MediaStream> {
    try {
      this.cleanup();
      this.peerConnection = new window.RTCPeerConnection(ICE_SERVERS);
      this.setupConnectionHandlers();

      const constraints = {
        audio: { echoCancellation: true, noiseSuppression: true },
        video: enableVideo ? { width: 1280, height: 720 } : false
      };

      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      this.localStream.getTracks().forEach(track => {
        if (this.peerConnection && this.localStream) {
          this.peerConnection.addTrack(track, this.localStream);
        }
      });

      return this.localStream;
    } catch (error) {
      console.error('[WebRTC] Setup error:', error);
      this.cleanup();
      throw error;
    }
  }

  async createOffer(): Promise<RTCSessionDescriptionInit> {
    const pc = await this.ensurePeerConnection();
    
    try {
      // Reset signaling state if needed
      if (pc.signalingState !== 'stable') {
        console.warn('[WebRTC] Resetting unstable signaling state');
        await pc.setLocalDescription({ type: 'rollback' });
      }

      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      
      await pc.setLocalDescription(offer);
      console.log('[WebRTC] Created and set local offer:', offer.type);
      return offer;
    } catch (error) {
      console.error('[WebRTC] Create offer error:', error);
      throw error;
    }
  }

  async handleSignalingMessage(message: any) {
    const pc = await this.ensurePeerConnection();

    try {
      switch (message.type) {
        case 'offer':
          const answer = await this.handleOffer(message);
          this.emitSignalingMessage(answer);
          break;

        case 'answer':
          await this.handleAnswer(message);
          break;

        case 'ice_candidate':
          const candidate = new window.RTCIceCandidate(message.candidate);
          if (pc.remoteDescription) {
            await pc.addIceCandidate(candidate);
          } else {
            this.pendingCandidates.push(candidate);
          }
          break;
      }
    } catch (error) {
      console.error('[WebRTC] Signaling error:', error);
    }
  }

  async handleOffer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    const pc = await this.ensurePeerConnection();

    try {
      if (pc.signalingState !== 'stable') {
        console.warn('[WebRTC] Resetting unstable signaling state');
        await pc.setLocalDescription({ type: 'rollback' });
      }

      await pc.setRemoteDescription(new window.RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      console.log('[WebRTC] Created and set local answer');
      return answer;
    } catch (error) {
      console.error('[WebRTC] Handle offer error:', error);
      throw error;
    }
  }

  async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    const pc = await this.ensurePeerConnection();

    try {
      if (pc.signalingState === 'have-local-offer') {
        await pc.setRemoteDescription(new window.RTCSessionDescription(answer));
        console.log('[WebRTC] Set remote answer successfully');
      } else {
        console.warn('[WebRTC] Cannot set remote answer in state:', pc.signalingState);
      }
    } catch (error) {
      console.error('[WebRTC] Handle answer error:', error);
      throw error;
    }
  }

  async setLocalDescription(description: RTCSessionDescriptionInit): Promise<void> {
    const pc = await this.ensurePeerConnection();
    await pc.setLocalDescription(new window.RTCSessionDescription(description));
    console.log('[WebRTC] Set local description:', description.type);
  }

  private emitSignalingMessage(message: any) {
    fetch('/api/sse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'webrtc_signaling', payload: message })
    }).catch(console.error);
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

  cleanup(): void {
    this.localStream?.getTracks().forEach(track => track.stop());
    this.peerConnection?.close();
    this.localStream = null;
    this.remoteStream = null;
    this.peerConnection = null;
    this.onStreamHandler = null;
    this.pendingCandidates = [];
    this.connectionStateHandler = null;
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  getConnectionState(): RTCPeerConnectionState | null {
    return this.peerConnection?.connectionState || null;
  }
}

// Create mock implementation that matches the interface
class MockWebRTCService implements IWebRTCService {
  async initializeCall(): Promise<MediaStream> {
    return Promise.reject('WebRTC not available during SSR');
  }
  cleanup(): void {}
  setOnStreamUpdate(): void {}
  getLocalStream(): null { return null; }
  onConnectionStateChange(): void {}
  offConnectionStateChange(): void {}
  async createOffer(): Promise<RTCSessionDescriptionInit> {
    return Promise.reject('WebRTC not available during SSR');
  }
  async handleSignalingMessage(): Promise<void> {
    return Promise.resolve();
  }
  getConnectionState(): RTCPeerConnectionState | null {
    return null;
  }
  
  async handleOffer(): Promise<RTCSessionDescriptionInit> {
    return Promise.reject('WebRTC not available during SSR');
  }
  
  async handleAnswer(): Promise<void> {
    return Promise.resolve();
  }
  
  async setLocalDescription(): Promise<void> {
    return Promise.reject('WebRTC not available during SSR');
  }
}

// Export the appropriate implementation
export const webRTCService: IWebRTCService = typeof window !== 'undefined' 
  ? new WebRTCService()
  : new MockWebRTCService();
