export type Sender = 'me' | 'them';

export interface Message {
  id: string;
  conversationId: string;
  sender: Sender;
  text: string;
  createdAt: number; // epoch ms
}

export interface Conversation {
  id: string;
  username: string;
  avatar: string | null;
  online: boolean;
  unreadCount: number;
  lastMessage: string | null;
  lastMessageAt: number | null; // epoch ms
}
