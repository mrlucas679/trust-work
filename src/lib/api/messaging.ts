/**
 * @fileoverview Messaging API functions with real-time support
 */

import { supabase } from '../supabaseClient';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface Conversation {
    id: string;
    participant_1_id: string;
    participant_2_id: string;
    assignment_id: string | null;
    application_id: string | null;
    last_message_at: string | null;
    last_message_preview: string | null;
    participant_1_unread_count: number;
    participant_2_unread_count: number;
    created_at: string;
    updated_at: string;
}

export interface ConversationWithParticipant extends Conversation {
    other_participant?: {
        id: string;
        display_name: string;
        role: string;
        business_name: string | null;
    };
}

export interface Message {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    attachment_url: string | null;
    attachment_name: string | null;
    attachment_size: number | null;
    read: boolean;
    read_at: string | null;
    edited: boolean;
    edited_at: string | null;
    created_at: string;
}

export interface MessageWithSender extends Message {
    sender?: {
        id: string;
        display_name: string;
        role: string;
    };
}

export interface CreateMessageInput {
    conversation_id: string;
    content: string;
    attachment_url?: string;
    attachment_name?: string;
    attachment_size?: number;
}

/**
 * Get or create a conversation between two users
 */
export async function getOrCreateConversation(
    otherUserId: string,
    assignmentId?: string,
    applicationId?: string
): Promise<Conversation> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
        throw new Error('User not authenticated');
    }

    const userId = user.user.id;

    // Ensure participants are ordered correctly (smaller UUID first)
    const [participant1, participant2] = [userId, otherUserId].sort();

    // Check if conversation already exists
    const { data: existing } = await supabase
        .from('conversations')
        .select('*')
        .eq('participant_1_id', participant1)
        .eq('participant_2_id', participant2)
        .single();

    if (existing) {
        return existing as Conversation;
    }

    // Create new conversation
    const { data, error } = await supabase
        .from('conversations')
        .insert({
            participant_1_id: participant1,
            participant_2_id: participant2,
            assignment_id: assignmentId || null,
            application_id: applicationId || null,
        })
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to create conversation: ${error.message}`);
    }

    return data as Conversation;
}

/**
 * Get all conversations for the current user
 */
export async function getConversations(): Promise<ConversationWithParticipant[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
        throw new Error('User not authenticated');
    }

    const userId = user.user.id;

    const { data, error } = await supabase
        .from('conversations')
        .select(`
      *,
      participant_1:profiles!participant_1_id(
        id,
        display_name,
        role,
        business_name
      ),
      participant_2:profiles!participant_2_id(
        id,
        display_name,
        role,
        business_name
      )
    `)
        .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`)
        .order('last_message_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });

    if (error) {
        throw new Error(`Failed to fetch conversations: ${error.message}`);
    }

    // Transform data to include the "other" participant
    const conversations = (data || []).map((conv: Record<string, unknown>) => {
        const isParticipant1 = conv.participant_1_id === userId;
        const otherParticipant = isParticipant1 ? conv.participant_2 : conv.participant_1;

        return {
            ...conv,
            other_participant: otherParticipant,
        } as ConversationWithParticipant;
    });

    return conversations;
}

/**
 * Get a single conversation by ID
 */
export async function getConversation(id: string): Promise<ConversationWithParticipant> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
        throw new Error('User not authenticated');
    }

    const userId = user.user.id;

    const { data, error } = await supabase
        .from('conversations')
        .select(`
      *,
      participant_1:profiles!participant_1_id(
        id,
        display_name,
        role,
        business_name
      ),
      participant_2:profiles!participant_2_id(
        id,
        display_name,
        role,
        business_name
      )
    `)
        .eq('id', id)
        .single();

    if (error) {
        throw new Error(`Failed to fetch conversation: ${error.message}`);
    }

    const conv = data as unknown as {
        participant_1_id: string;
        participant_2_id: string;
        participant_1: unknown;
        participant_2: unknown;
        [key: string]: unknown;
    };
    const isParticipant1 = conv.participant_1_id === userId;
    const otherParticipant = isParticipant1 ? conv.participant_2 : conv.participant_1;

    return {
        ...conv,
        other_participant: otherParticipant,
    } as unknown as ConversationWithParticipant;
}

/**
 * Get messages for a conversation
 */
export async function getMessages(
    conversationId: string,
    limit = 50,
    before?: string
): Promise<MessageWithSender[]> {
    let query = supabase
        .from('messages')
        .select(`
      *,
      sender:profiles!messages_sender_id_fkey(
        id,
        display_name,
        role
      )
    `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (before) {
        query = query.lt('created_at', before);
    }

    const { data, error } = await query;

    if (error) {
        throw new Error(`Failed to fetch messages: ${error.message}`);
    }

    return ((data as unknown as MessageWithSender[]) || []).reverse();
}

/**
 * Send a message in a conversation
 */
export async function sendMessage(input: CreateMessageInput): Promise<Message> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
        throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
        .from('messages')
        .insert({
            sender_id: user.user.id,
            ...input,
        })
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to send message: ${error.message}`);
    }

    return data as Message;
}

/**
 * Mark messages as read in a conversation
 */
export async function markMessagesAsRead(conversationId: string): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
        throw new Error('User not authenticated');
    }

    const userId = user.user.id;

    // Mark all messages from other participant as read
    const { error: messagesError } = await supabase
        .from('messages')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .neq('sender_id', userId)
        .eq('read', false);

    if (messagesError) {
        throw new Error(`Failed to mark messages as read: ${messagesError.message}`);
    }

    // Reset unread count in conversation
    const { data: conv } = await supabase
        .from('conversations')
        .select('participant_1_id, participant_2_id')
        .eq('id', conversationId)
        .single();

    if (conv) {
        const isParticipant1 = conv.participant_1_id === userId;
        const updateField = isParticipant1
            ? 'participant_1_unread_count'
            : 'participant_2_unread_count';

        await supabase
            .from('conversations')
            .update({ [updateField]: 0 })
            .eq('id', conversationId);
    }
}

/**
 * Edit a message
 */
export async function editMessage(id: string, content: string): Promise<Message> {
    const { data, error } = await supabase
        .from('messages')
        .update({
            content,
            edited: true,
            edited_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to edit message: ${error.message}`);
    }

    return data as Message;
}

/**
 * Delete a message
 */
export async function deleteMessage(id: string): Promise<void> {
    const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', id);

    if (error) {
        throw new Error(`Failed to delete message: ${error.message}`);
    }
}

/**
 * Subscribe to new messages in a conversation (real-time)
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
 * Subscribe to conversation updates (real-time)
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
 * Unsubscribe from a channel
 */
export async function unsubscribe(channel: RealtimeChannel): Promise<void> {
    await supabase.removeChannel(channel);
}

/**
 * Get unread message count for the current user
 */
export async function getUnreadCount(): Promise<number> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
        return 0;
    }

    const userId = user.user.id;

    const { data, error } = await supabase
        .from('conversations')
        .select('participant_1_id, participant_2_id, participant_1_unread_count, participant_2_unread_count')
        .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`);

    if (error || !data) {
        return 0;
    }

    const totalUnread = data.reduce((sum, conv) => {
        const isParticipant1 = conv.participant_1_id === userId;
        return sum + (isParticipant1 ? conv.participant_1_unread_count : conv.participant_2_unread_count);
    }, 0);

    return totalUnread;
}
