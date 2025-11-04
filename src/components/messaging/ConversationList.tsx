/**
 * ConversationList Component
 * 
 * Displays list of conversations with search, filter, and real-time updates.
 */

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, MessageSquare, Filter } from 'lucide-react';
import { useSupabase } from '@/providers/SupabaseProvider';
import { getConversations } from '@/lib/api/messaging';
import { useConversations } from '@/hooks/useMessages';
import type { ConversationFilters } from '@/types/messaging';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface ConversationListProps {
    selectedConversationId?: string;
    onSelectConversation?: (conversationId: string) => void;
    className?: string;
}

export function ConversationList({
    selectedConversationId,
    onSelectConversation,
    className,
}: ConversationListProps) {
    const navigate = useNavigate();
    const { user } = useSupabase();
    const { lastUpdate } = useConversations();

    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<ConversationFilters>({
        has_unread: false,
    });

    // Fetch conversations with real-time updates
    const { data: conversations = [], isLoading } = useQuery({
        queryKey: ['conversations', user?.id, filters, lastUpdate],
        queryFn: () => getConversations(user?.id || '', filters),
        enabled: !!user,
    });

    // Filter conversations by search query
    const filteredConversations = useMemo(() => {
        if (!searchQuery.trim()) return conversations;

        const query = searchQuery.toLowerCase();
        return conversations.filter((conv) => {
            const userName = (
                conv.other_user.display_name ||
                conv.other_user.full_name ||
                ''
            ).toLowerCase();
            const lastMessage = conv.last_message?.content.toLowerCase() || '';
            return userName.includes(query) || lastMessage.includes(query);
        });
    }, [conversations, searchQuery]);

    // Calculate total unread count
    const totalUnread = useMemo(
        () => conversations.reduce((sum, conv) => sum + conv.unread_count, 0),
        [conversations]
    );

    const handleConversationClick = (conversationId: string) => {
        if (onSelectConversation) {
            onSelectConversation(conversationId);
        } else {
            navigate(`/messages/${conversationId}`);
        }
    };

    if (isLoading) {
        return (
            <div className={cn('space-y-4', className)}>
                {[...Array(5)].map((_, i) => (
                    <Card key={i} className="p-4">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-full" />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className={cn('flex flex-col h-full', className)}>
            {/* Header */}
            <div className="p-4 border-b space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Messages</h2>
                    {totalUnread > 0 && (
                        <Badge variant="default">{totalUnread} unread</Badge>
                    )}
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2">
                    <Button
                        variant={filters.has_unread ? 'default' : 'outline'}
                        size="sm"
                        onClick={() =>
                            setFilters({ ...filters, has_unread: !filters.has_unread })
                        }
                    >
                        <Filter className="h-4 w-4 mr-2" />
                        {filters.has_unread ? 'Show All' : 'Unread Only'}
                    </Button>
                </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto">
                {filteredConversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                        <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No conversations</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            {searchQuery
                                ? 'No conversations match your search'
                                : 'Start a conversation by messaging a freelancer or employer'}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y">
                        {filteredConversations.map((conversation) => {
                            const isSelected = conversation.id === selectedConversationId;
                            const lastMessageTime = conversation.last_message_at
                                ? formatDistanceToNow(new Date(conversation.last_message_at), {
                                    addSuffix: true,
                                })
                                : null;

                            return (
                                <button
                                    key={conversation.id}
                                    onClick={() => handleConversationClick(conversation.id)}
                                    className={cn(
                                        'w-full p-4 text-left hover:bg-accent/50 transition-colors',
                                        isSelected && 'bg-accent'
                                    )}
                                >
                                    <div className="flex items-start gap-3">
                                        {/* Avatar */}
                                        <div className="relative">
                                            <Avatar className="h-12 w-12">
                                                <AvatarImage
                                                    src={conversation.other_user.avatar_url || undefined}
                                                    alt={conversation.other_user.display_name || 'User'}
                                                />
                                                <AvatarFallback>
                                                    {(conversation.other_user.display_name || conversation.other_user.full_name || 'U')[0].toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            {conversation.unread_count > 0 && (
                                                <Badge
                                                    variant="destructive"
                                                    className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                                                >
                                                    {conversation.unread_count}
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <h3 className="font-semibold truncate">
                                                    {conversation.other_user.display_name ||
                                                        conversation.other_user.full_name ||
                                                        'Unknown User'}
                                                </h3>
                                                {lastMessageTime && (
                                                    <span className="text-xs text-muted-foreground shrink-0">
                                                        {lastMessageTime}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Last Message */}
                                            {conversation.last_message && (
                                                <p
                                                    className={cn(
                                                        'text-sm truncate',
                                                        conversation.unread_count > 0
                                                            ? 'font-medium text-foreground'
                                                            : 'text-muted-foreground'
                                                    )}
                                                >
                                                    {conversation.last_message.sender_id === user?.id && 'You: '}
                                                    {conversation.last_message.attachment_url
                                                        ? '📎 Attachment'
                                                        : conversation.last_message.content}
                                                </p>
                                            )}

                                            {/* Assignment Badge */}
                                            {conversation.assignment && (
                                                <Badge variant="secondary" className="mt-1 text-xs">
                                                    {conversation.assignment.title}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
