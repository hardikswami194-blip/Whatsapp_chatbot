import { supabase } from './supabase';
import type { Conversation, Message, Sender } from '../types';

// Raw row shapes as they come back from Postgres.
interface ConversationRow {
  id: string;
  username: string;
  avatar: string | null;
  online: boolean;
  unread_count: number;
  last_message: string | null;
  last_message_at: string | null; // ISO timestamp
}

interface MessageRow {
  id: string;
  conversation_id: string;
  sender: string;
  text: string;
  created_at: string; // ISO timestamp
}

const toMs = (iso: string | null): number | null => (iso ? new Date(iso).getTime() : null);

const mapConversation = (r: ConversationRow): Conversation => ({
  id: r.id,
  username: r.username,
  avatar: r.avatar,
  online: r.online,
  unreadCount: r.unread_count,
  lastMessage: r.last_message,
  lastMessageAt: toMs(r.last_message_at),
});

const mapMessage = (r: MessageRow): Message => ({
  id: r.id,
  conversationId: r.conversation_id,
  sender: r.sender as Sender,
  text: r.text,
  createdAt: new Date(r.created_at).getTime(),
});

export async function fetchConversations(): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select('id, username, avatar, online, unread_count, last_message, last_message_at')
    .order('last_message_at', { ascending: false, nullsFirst: false });

  if (error) throw error;
  return (data as ConversationRow[]).map(mapConversation);
}

export async function fetchMessages(conversationId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('id, conversation_id, sender, text, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data as MessageRow[]).map(mapMessage);
}

export async function markConversationRead(conversationId: string): Promise<void> {
  const { error } = await supabase
    .from('conversations')
    .update({ unread_count: 0 })
    .eq('id', conversationId);
  if (error) throw error;
}

export async function sendMessage(
  conversationId: string,
  text: string,
  sender: Sender
): Promise<Message> {
  const nowIso = new Date().toISOString();

  const { data: msgRow, error: insertError } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, sender, text, created_at: nowIso })
    .select('id, conversation_id, sender, text, created_at')
    .single();

  if (insertError) throw insertError;

  // Keep the conversation preview + timestamp in sync.
  const { error: updateError } = await supabase
    .from('conversations')
    .update({ last_message: text, last_message_at: nowIso, unread_count: 0 })
    .eq('id', conversationId);
  if (updateError) throw updateError;

  return mapMessage(msgRow as MessageRow);
}
