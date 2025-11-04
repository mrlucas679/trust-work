/**
 * Real-time Messaging Hooks
 * 
 * Custom React hooks for real-time message subscriptions and state management.
 */

import { useEffect, useState, useCallback } from 'react';
import { useSupabase } from '@/providers/SupabaseProvider';
import type { Message, Conversation } from '@/types/messaging';
import { getMessages, markConversationAsRead } from '@/lib/api/messaging';

/**
 * Hook for real-time messages in a conversation
 * @param conversationId - Conversation ID to subscribe to
 * @returns Messages state and helper functions
 */
export function useMessages(conversationId: string | null) {
    const { supabase, user } = useSupabase();
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch initial messages
    useEffect(() => {
        if (!conversationId) {
            setMessages([]);
            setLoading(false);
            return;
        }

        async function fetchInitialMessages() {
            try {
                setLoading(true);
                setError(null);
                const result = await getMessages(conversationId);
                setMessages(result.messages);
            } catch (err) {
                console.error('Error fetching messages:', err);
                setError(err instanceof Error ? err.message : 'Failed to load messages');
            } finally {
                setLoading(false);
            }
        }

        fetchInitialMessages();
    }, [conversationId]);

    // Subscribe to new messages
    useEffect(() => {
        if (!conversationId || !supabase) return;

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
                async (payload) => {
                    // Fetch full message with sender info
                    const { data } = await supabase
                        .from('messages')
                        .select('*, sender:profiles(*)')
                        .eq('id', payload.new.id)
                        .single();

                    if (data) {
                        setMessages((prev) => [...prev, data as Message]);
                    }
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`,
                },
                async (payload) => {
                    // Update message in state (for read receipts)
                    const { data } = await supabase
                        .from('messages')
                        .select('*, sender:profiles(*)')
                        .eq('id', payload.new.id)
                        .single();

                    if (data) {
                        setMessages((prev) =>
                            prev.map((msg) => (msg.id === data.id ? (data as Message) : msg))
                        );
                    }
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'DELETE',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`,
                },
                (payload) => {
                    setMessages((prev) => prev.filter((msg) => msg.id !== payload.old.id));
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [conversationId, supabase]);

    // Mark conversation as read when user views it
    useEffect(() => {
        if (!conversationId || !user) return;

        // Mark as read after a short delay to ensure messages are visible
        const timer = setTimeout(() => {
            markConversationAsRead(conversationId, user.id).catch((err) =>
                console.error('Error marking conversation as read:', err)
            );
        }, 1000);

        return () => clearTimeout(timer);
    }, [conversationId, user]);

    // Add a new message optimistically
    const addOptimisticMessage = useCallback((message: Message) => {
        setMessages((prev) => [...prev, message]);
    }, []);

    // Remove an optimistic message (if send failed)
    const removeOptimisticMessage = useCallback((messageId: string) => {
        setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    }, []);

    return {
        messages,
        loading,
        error,
        addOptimisticMessage,
        removeOptimisticMessage,
    };
}

/**
 * Hook for real-time conversation list updates
 * @returns Conversations state and helper functions
 */
export function useConversations() {
    const { supabase, user } = useSupabase();
    const [lastUpdate, setLastUpdate] = useState<number>(Date.now());

    // Subscribe to conversation updates
    useEffect(() => {
        if (!user || !supabase) return;

        const channel = supabase
            .channel('conversations')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'conversations',
                    filter: `participant_1_id=eq.${user.id}`,
                },
                () => {
                    setLastUpdate(Date.now());
                }
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'conversations',
                    filter: `participant_2_id=eq.${user.id}`,
                },
                () => {
                    setLastUpdate(Date.now());
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, supabase]);

    // Trigger re-fetch when conversations update
    return { lastUpdate };
}

/**
 * Hook for typing indicators
 * @param conversationId - Conversation ID
 * @returns Typing state and send function
 */
export function useTypingIndicator(conversationId: string | null) {
    const { supabase, user } = useSupabase();
    const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

    // Subscribe to typing events
    useEffect(() => {
        if (!conversationId || !supabase) return;

        const channel = supabase.channel(`typing:${conversationId}`);

        channel
            .on('broadcast', { event: 'typing' }, (payload) => {
                const { user_id, is_typing } = payload.payload;

                setTypingUsers((prev) => {
                    const next = new Set(prev);
                    if (is_typing) {
                        next.add(user_id);
                    } else {
                        next.delete(user_id);
                    }
                    return next;
                });

                // Auto-remove typing indicator after 3 seconds
                if (is_typing) {
                    setTimeout(() => {
                        setTypingUsers((prev) => {
                            const next = new Set(prev);
                            next.delete(user_id);
                            return next;
                        });
                    }, 3000);
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [conversationId, supabase]);

    // Send typing indicator
    const sendTypingIndicator = useCallback(
        (isTyping: boolean) => {
            if (!conversationId || !supabase || !user) return;

            const channel = supabase.channel(`typing:${conversationId}`);
            channel.send({
                type: 'broadcast',
                event: 'typing',
                payload: {
                    user_id: user.id,
                    is_typing: isTyping,
                },
            });
        },
        [conversationId, supabase, user]
    );

    return {
        typingUsers: Array.from(typingUsers),
        sendTypingIndicator,
    };
}

/**
 * Hook for online presence
 * @returns Online users set
 */
export function useOnlinePresence() {
    const { supabase, user } = useSupabase();
    const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (!supabase || !user) return;

        const channel = supabase.channel('online-users');

        channel
            .on('presence', { event: 'sync' }, () => {
                const state = channel.presenceState();
                const users = new Set<string>();

                Object.values(state).forEach((presences: unknown) => {
                    (presences as { user_id: string }[]).forEach((presence) => {
                        users.add(presence.user_id);
                    });
                });

                setOnlineUsers(users);
            })
            .on('presence', { event: 'join' }, ({ newPresences }) => {
                setOnlineUsers((prev) => {
                    const next = new Set(prev);
                    newPresences.forEach((presence) => {
                        next.add(presence.user_id);
                    });
                    return next;
                });
            })
            .on('presence', { event: 'leave' }, ({ leftPresences }) => {
                setOnlineUsers((prev) => {
                    const next = new Set(prev);
                    leftPresences.forEach((presence) => {
                        next.delete(presence.user_id);
                    });
                    return next;
                });
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track({
                        user_id: user.id,
                        online_at: new Date().toISOString(),
                    });
                }
            });

        return () => {
            channel.untrack();
            supabase.removeChannel(channel);
        };
    }, [supabase, user]);

    return { onlineUsers: Array.from(onlineUsers) };
}

/**
 * Hook for unread message count
 * @returns Total unread count and refetch function
 */
export function useUnreadCount() {
    const { supabase, user } = useSupabase();
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchUnreadCount = useCallback(async () => {
        if (!user) return;

        try {
            const { count, error } = await supabase
                .from('messages')
                .select('id', { count: 'exact', head: true })
                .neq('sender_id', user.id)
                .is('read_at', null);

            if (error) throw error;
            setUnreadCount(count || 0);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        } finally {
            setLoading(false);
        }
    }, [user, supabase]);

    // Initial fetch
    useEffect(() => {
        fetchUnreadCount();
    }, [fetchUnreadCount]);

    // Subscribe to message updates to update count
    useEffect(() => {
        if (!supabase) return;

        const channel = supabase
            .channel('unread-messages')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'messages',
                },
                () => {
                    fetchUnreadCount();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase, fetchUnreadCount]);

    return { unreadCount, loading, refetch: fetchUnreadCount };
}
