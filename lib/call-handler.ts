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
