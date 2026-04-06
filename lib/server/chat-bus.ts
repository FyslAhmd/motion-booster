import { EventEmitter } from 'events';

export interface LiveChatMessageEvent {
  participantUserIds: string[];
  message: {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    messageType: 'TEXT' | 'IMAGE' | 'VIDEO' | 'FILE' | 'VOICE';
    fileUrl?: string | null;
    fileName?: string | null;
    fileSize?: number | null;
    mimeType?: string | null;
    duration?: number | null;
    status: 'SENT' | 'DELIVERED' | 'READ';
    createdAt: Date;
    sender: {
      id: string;
      username: string;
      fullName: string;
      role: string;
    };
  };
}

class ChatBus extends EventEmitter {}

export const chatBus = new ChatBus();