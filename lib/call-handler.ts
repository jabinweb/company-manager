import { CallData } from '@/types/call'

class CallHandler {
  private static instance: CallHandler;
  private activeListeners: Set<(call: CallData) => void> = new Set();
  private activeCall: CallData | null = null;

  static getInstance() {
    if (!this.instance) {
      this.instance = new CallHandler();
    }
    return this.instance;
  }

  getIceConfiguration(): RTCConfiguration {
    return {
      iceServers: [
        {
          urls: [
            'stun:stun.l.google.com:19302',
            'stun:stun1.l.google.com:19302',
            'stun:stun2.l.google.com:19302',
            'stun:stun3.l.google.com:19302'
          ]
        }
      ],
      iceCandidatePoolSize: 10,
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require'
    };
  }

  async initializeCall(callData: CallData): Promise<CallData> {
    try {
      console.log('[CallHandler] Initializing call:', callData);
      const config = this.getIceConfiguration();
      return {
        ...callData,
        iceServers: config.iceServers
      };
    } catch (error) {
      console.error('[CallHandler] Init error:', error);
      throw error;
    }
  }

  addListener(callback: (call: CallData) => void): () => void {
    this.activeListeners.add(callback);
    if (this.activeCall) {
      callback(this.activeCall);
    }
    return () => this.activeListeners.delete(callback);
  }

  notifyIncomingCall(call: CallData): void {
    console.log('[CallHandler] Notifying incoming call:', call);
    this.activeCall = call;
    this.activeListeners.forEach(listener => {
      try {
        listener(call);
      } catch (error) {
        console.error('[CallHandler] Listener error:', error);
      }
    });
  }

  getActiveCall(): CallData | null {
    return this.activeCall;
  }

  clearCall(): void {
    console.log('[CallHandler] Clearing active call');
    this.activeCall = null;
  }
}

export const callHandler = CallHandler.getInstance();
