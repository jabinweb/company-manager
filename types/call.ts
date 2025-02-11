export type CallStatus = 'ringing' | 'connected' | 'ended' | 'rejected';
export type CallType = 'audio' | 'video';

import { v4 as uuidv4 } from 'uuid'

export interface CallData {
  callId: string;
  callerId: string;
  timestamp: string;
  callerName: string;
  callerAvatar: string | null;
  receiverId: string;
  type: 'audio' | 'video';
  status: 'ringing' | 'connected' | 'ended';
  sdp?: RTCSessionDescriptionInit;
}

export interface CallEvent {
  type: 'call_initiate' | 'call_accept' | 'call_reject' | 'call_end' | 'call_ice';
  callData: CallData;
  senderId: string;
  receiverId: string;
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  timestamp: string;
}

// Optional: Add helper functions for type safety
export const isValidCallStatus = (status: string): status is CallStatus => {
  return ['ringing', 'connected', 'ended', 'rejected', 'missed'].includes(status)
}

// Add helper function to create CallData
export function createCallData(params: Omit<CallData, 'callId' | 'sdp'>): CallData {
  return {
    callId: uuidv4(),
    ...params
  };
}
