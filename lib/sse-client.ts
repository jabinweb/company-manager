type EventCallback = (data: any) => void;

class SSEClient {
  private static instance: SSEClient;
  private eventSource: EventSource | null = null;
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private isConnected = false;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): SSEClient {
    if (!SSEClient.instance) {
      SSEClient.instance = new SSEClient();
    }
    return SSEClient.instance;
  }

  isConnectedState() {
    return this.isConnected;
  }

  async connect(): Promise<void> {
    if (this.isConnected || this.eventSource) {
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        this.eventSource = new EventSource('/api/sse');
        
        this.eventSource.onopen = () => {
          this.isConnected = true;
          this.setupHeartbeat();
          resolve();
        };

        this.eventSource.onerror = (error) => {
          this.handleError(error);
          reject(error);
        };

        this.eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'heartbeat') {
              return; // Ignore heartbeat messages
            }
            this.notifyListeners(data.type, data);
          } catch (error) {
            console.error('SSE parse error:', error);
          }
        };
      } catch (error) {
        this.handleError(error);
        reject(error);
      }
    });
  }

  private setupHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }
    // Check connection every 45 seconds (heartbeat is 30s)
    this.heartbeatTimer = setInterval(() => {
      if (!this.isConnected) {
        this.reconnect();
      }
    }, 45000);
  }

  private handleError(error: any) {
    console.error('SSE error:', error);
    this.cleanup();
    this.scheduleReconnect();
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    this.reconnectTimer = setTimeout(() => {
      this.reconnect();
    }, 5000);
  }

  private async reconnect() {
    this.cleanup();
    await this.connect();
  }

  private cleanup() {
    this.isConnected = false;
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  subscribe(event: string, callback: EventCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
  }

  unsubscribe(event: string, callback: EventCallback) {
    this.listeners.get(event)?.delete(callback);
  }

  private notifyListeners(event: string, data: any) {
    this.listeners.get(event)?.forEach(callback => callback(data));
  }

  disconnect() {
    this.cleanup();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.listeners.clear();
  }
}

export const sseClient = SSEClient.getInstance();
