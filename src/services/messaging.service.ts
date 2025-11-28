/**
 * @fileoverview Messaging Service - Real-time chat with Supabase
 */

import { supabase } from '@/lib/supabaseClient';
import type { Database } from '@/types/database';
import { RealtimeChannel } from '@supabase/supabase-js';

export type Conversation = Database['public']['Tables']['conversations']['Row'];
export type Message = Database['public']['Tables']['messages']['Row'];
export type MessageInsert = Database['public']['Tables']['messages']['Insert'];

/**
 * Get or create a conversation between two users
 */
export async function getOrCreateConversation(otherUserId: string, assignmentId?: string, applicationId?: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Order participant IDs (smaller UUID first) for unique constraint
  const [participant1, participant2] = [user.id, otherUserId].sort();

  // Check if conversation already exists
  const { data: existing, error: fetchError } = await supabase
    .from('conversations')
    .select('*')
    .eq('participant_1_id', participant1)
    .eq('participant_2_id', participant2)
    .maybeSingle();

  if (fetchError) throw fetchError;
  if (existing) return existing;

  // Create new conversation
  const { data: newConversation, error: createError } = await supabase
    .from('conversations')
    .insert({
      participant_1_id: participant1,
      participant_2_id: participant2,
      assignment_id: assignmentId,
      application_id: applicationId,
    })
    .select()
    .single();

  if (createError) throw createError;
  return newConversation;
}

/**
 * Get all conversations for the current user
 */
export async function getConversations() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      participant_1:profiles!conversations_participant_1_id_fkey(id, display_name, business_name),
      participant_2:profiles!conversations_participant_2_id_fkey(id, display_name, business_name),
      assignment:assignments(id, title)
    `)
    .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`)
    .order('last_message_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Get messages for a conversation
 */
export async function getMessages(conversationId: string, limit = 50, offset = 0) {
  const { data, error } = await supabase
    .from('messages')
    .select('*, sender:profiles!messages_sender_id_fkey(id, display_name)')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data.reverse(); // Return in chronological order
}

/**
 * Send a message
 */
export async function sendMessage(conversationId: string, content: string, attachmentUrl?: string, attachmentName?: string, attachmentSize?: number) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content,
      attachment_url: attachmentUrl,
      attachment_name: attachmentName,
      attachment_size: attachmentSize,
    })
    .select('*, sender:profiles!messages_sender_id_fkey(id, display_name)')
    .single();

  if (error) throw error;
  return data;
}

/**
 * Mark messages as read
 */
export async function markMessagesAsRead(conversationId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Mark all unread messages in conversation as read
  const { error: updateMessagesError } = await supabase
    .from('messages')
    .update({ read: true, read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .neq('sender_id', user.id)
    .eq('read', false);

  if (updateMessagesError) throw updateMessagesError;

  // Reset unread count in conversation
  const { data: conversation } = await supabase
    .from('conversations')
    .select('participant_1_id, participant_2_id')
    .eq('id', conversationId)
    .single();

  if (conversation) {
    const isParticipant1 = conversation.participant_1_id === user.id;
    const { error: updateConvError } = await supabase
      .from('conversations')
      .update({
        [isParticipant1 ? 'participant_1_unread_count' : 'participant_2_unread_count']: 0
      })
      .eq('id', conversationId);

    if (updateConvError) throw updateConvError;
  }
}

/**
 * Subscribe to new messages in a conversation
 */
export function subscribeToMessages(
  conversationId: string,
  callback: (message: Message) => void
): RealtimeChannel {
  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        callback(payload.new as Message);
      }
    )
    .subscribe();

  return channel;
}

/**
 * Subscribe to conversation updates
 */
export function subscribeToConversations(
  userId: string,
  callback: (conversation: Conversation) => void
): RealtimeChannel {
  const channel = supabase
    .channel(`conversations:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'conversations',
        filter: `participant_1_id=eq.${userId}`,
      },
      (payload) => {
        callback(payload.new as Conversation);
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'conversations',
        filter: `participant_2_id=eq.${userId}`,
      },
      (payload) => {
        callback(payload.new as Conversation);
      }
    )
    .subscribe();

  return channel;
}

/**
 * Delete a message (sender only)
 */
export async function deleteMessage(messageId: string) {
  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('id', messageId);

  if (error) throw error;
}

/**
 * Edit a message (sender only)
 */
export async function editMessage(messageId: string, newContent: string) {
  const { data, error } = await supabase
    .from('messages')
    .update({
      content: newContent,
      edited: true,
      edited_at: new Date().toISOString(),
    })
    .eq('id', messageId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get unread message count
 */
export async function getUnreadCount() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const { data, error } = await supabase
    .from('conversations')
    .select('participant_1_id, participant_1_unread_count, participant_2_unread_count')
    .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`);

  if (error) {
    console.error('Error fetching unread count:', error);
    return 0;
  }

  return data.reduce((total, conv) => {
    const isParticipant1 = conv.participant_1_id === user.id;
    return total + (isParticipant1 ? conv.participant_1_unread_count : conv.participant_2_unread_count);
  }, 0);
}
