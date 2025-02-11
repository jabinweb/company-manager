import { CallData } from '@/types/call'

class CallHandler {
  private static instance: CallHandler;
  private activeListeners: Set<(call: CallData) => void> = new Set();
  private activeCall: CallData | null = null;
  private listeners: Set<(call: any) => void> = new Set();

  static getInstance() {
    if (!this.instance) {
      this.instance = new CallHandler();
    }
    return this.instance;
  }

  async initializeCall(callData: any) {
    try {
      // Get TURN credentials before initializing
      const response = await fetch('/api/turn');
      if (!response.ok) throw new Error('Failed to fetch TURN credentials');
      const config = await response.json();

      // Initialize with custom TURN
      return { ...callData, iceServers: config.iceServers };
    } catch (error) {
      console.error('[CallHandler] Init error:', error);
      throw error;
    }
  }

  addListener(callback: (call: CallData) => void): () => void {
    this.activeListeners.add(callback);
    // If there's an active call, notify immediately
    if (this.activeCall) {
      callback(this.activeCall);
    }
    // Return cleanup function
    return () => this.activeListeners.delete(callback);
  }

  removeListener(callback: (call: CallData) => void): void {
    this.activeListeners.delete(callback);
  }

  notifyIncomingCall(call: CallData): void {
    console.log('[CallHandler] Notifying incoming call:', call);
    this.activeCall = call;
    this.activeListeners.forEach(listener => listener(call));
  }

  getActiveCall(): CallData | null {
    return this.activeCall;
  }

  clearCall(): void {
    this.activeCall = null;
  }
}

export const callHandler = CallHandler.getInstance();
