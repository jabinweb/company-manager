import type { ReadableStreamDefaultController } from 'stream/web';

export type StreamController = ReadableStreamDefaultController<Uint8Array>;

class SSEStore {
    
  private static instance: SSEStore;
  private messageStreams: Map<string, StreamController[]>;
  private onlineUsers: Map<string, Set<string>>;
  private lastSeen: Map<string, Date>;
  private encoder: TextEncoder;

  private constructor() {
    this.messageStreams = new Map();
    this.onlineUsers = new Map();
    this.lastSeen = new Map();
    this.encoder = new TextEncoder();
  }

  static getInstance(): SSEStore {
    if (!this.instance) {
      this.instance = new SSEStore();
    }
    return this.instance;
  }

  addUser(userId: string, connectionId: string, controller: StreamController) {
    // Add to message streams
    if (!this.messageStreams.has(userId)) {
      this.messageStreams.set(userId, [controller]);
    } else {
      this.messageStreams.get(userId)?.push(controller);
    }

    // Add to online users
    if (!this.onlineUsers.has(userId)) {
      this.onlineUsers.set(userId, new Set([connectionId]));
    } else {
      this.onlineUsers.get(userId)?.add(connectionId);
    }

    this.lastSeen.set(userId, new Date());
    this.broadcastUserStatus(userId, 'online');
  }

  removeUser(userId: string, connectionId: string, controller: StreamController) {
    // Remove from message streams
    const controllers = this.messageStreams.get(userId);
    if (controllers) {
      const index = controllers.indexOf(controller);
      if (index !== -1) {
        controllers.splice(index, 1);
      }
      if (controllers.length === 0) {
        this.messageStreams.delete(userId);
      }
    }

    // Remove from online users
    const connections = this.onlineUsers.get(userId);
    if (connections) {
      connections.delete(connectionId);
      if (connections.size === 0) {
        this.onlineUsers.delete(userId);
        this.lastSeen.set(userId, new Date());
        this.broadcastUserStatus(userId, 'offline');
      }
    }
  }

  sendMessage(receiverId: string, data: any) {
    const controllers = this.messageStreams.get(receiverId) || [];
    const message = `data: ${JSON.stringify(data)}\n\n`;
    
    controllers.forEach(controller => {
      try {
        controller.enqueue(this.encoder.encode(message));
      } catch (error) {
        console.error('[SSEStore] Failed to send message:', error);
      }
    });
  }

  private broadcastUserStatus(userId: string, status: 'online' | 'offline') {
    const statusUpdate = {
      type: 'user_status',
      userId,
      status,
      onlineUsers: Array.from(this.onlineUsers.keys()),
      lastSeen: this.lastSeen.get(userId)?.toISOString(),
      timestamp: new Date().toISOString()
    };

    // Broadcast to all connected users
    Array.from(this.messageStreams.entries()).forEach(([_, controllers]) => {
      controllers.forEach(controller => {
        try {
          controller.enqueue(
            this.encoder.encode(`data: ${JSON.stringify(statusUpdate)}\n\n`)
          );
        } catch (error) {
          console.error('[SSEStore] Failed to broadcast status:', error);
        }
      });
    });
  }

  broadcastToAll(data: any) {
    const message = `data: ${JSON.stringify(data)}\n\n`;
    Array.from(this.messageStreams.values()).flat().forEach(controller => {
      try {
        controller.enqueue(this.encoder.encode(message));
      } catch (error) {
        console.error('[SSEStore] Failed to broadcast:', error);
      }
    });
  }

  getOnlineUsers(): string[] {
    return Array.from(this.onlineUsers.keys());
  }

  isUserOnline(userId: string): boolean {
    return this.onlineUsers.has(userId);
  }

  getLastSeen(userId: string): Date | undefined {
    return this.lastSeen.get(userId);
  }
}

export const sseStore = SSEStore.getInstance();
