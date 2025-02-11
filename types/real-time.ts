export interface RTCSignalMessage {
  type: 'webrtc_signaling';
  payload: {
    type: 'offer' | 'answer' | 'ice_candidate';
    sdp?: string;
    candidate?: RTCIceCandidate;
  };
  senderId: string;
  receiverId: string;
  timestamp: string;
}

export interface UserStatusMessage {
  type: 'user_status';
  userId: string;
  status: 'online' | 'offline';
  onlineUsers: string[];
  timestamp: string;
}

export interface ChatMessage {
  type: 'message';
  content: string;
  senderId: string;
  receiverId: string;
  timestamp: string;
}

export type StreamMessage = RTCSignalMessage | UserStatusMessage | ChatMessage;
