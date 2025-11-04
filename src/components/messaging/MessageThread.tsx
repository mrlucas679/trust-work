/**
 * MessageThread Component
 * 
 * Displays a list of messages in a conversation with real-time updates,
 * auto-scroll, date separators, and typing indicators.
 */

import { useEffect, useRef, useState } from 'react';
import { useMessages, useTypingIndicator } from '@/hooks/useMessages';
import { MessageBubble, DateSeparator, TypingIndicator } from './MessageBubble';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { isSameDay } from 'date-fns';
import type { Message } from '@/types/messaging';

interface MessageThreadProps {
    conversationId: string;
    currentUserId: string;
    otherUserName?: string;
    className?: string;
    onDeleteMessage?: (messageId: string) => void;
}

export function MessageThread({
    conversationId,
    currentUserId,
    otherUserName,
    className,
    onDeleteMessage,
}: MessageThreadProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
    const [hasScrolled, setHasScrolled] = useState(false);

    // Fetch messages and subscribe to real-time updates
    const {
        messages,
        loading,
        error,
    } = useMessages(conversationId);

    // Get typing indicator
    const { typingUsers } = useTypingIndicator(conversationId);
    const isOtherUserTyping = typingUsers.some((id) => id !== currentUserId);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (shouldAutoScroll && messages.length > 0) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, shouldAutoScroll]);

    // Initial scroll to bottom
    useEffect(() => {
        if (!hasScrolled && messages.length > 0) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
            setHasScrolled(true);
        }
    }, [messages, hasScrolled]);

    // Handle scroll to detect if user scrolled up
    const handleScroll = () => {
        if (!containerRef.current) return;

        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

        setShouldAutoScroll(isNearBottom);
    };

    // Group messages by date
    const groupedMessages = messages.reduce((acc, message) => {
        const dateKey = new Date(message.created_at).toDateString();
        if (!acc[dateKey]) {
            acc[dateKey] = [];
        }
        acc[dateKey].push(message);
        return acc;
    }, {} as Record<string, Message[]>);

    // Sort date groups
    const sortedDates = Object.keys(groupedMessages).sort(
        (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );

    if (error) {
        return (
            <div className={cn('flex items-center justify-center h-full p-4', className)}>
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Failed to load messages. Please try again.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    if (loading) {
        return (
            <div className={cn('flex items-center justify-center h-full', className)}>
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (messages.length === 0) {
        return (
            <div className={cn('flex items-center justify-center h-full p-4', className)}>
                <div className="text-center">
                    <p className="text-muted-foreground">
                        No messages yet. Start the conversation!
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            onScroll={handleScroll}
            className={cn(
                'flex flex-col overflow-y-auto p-4 space-y-4',
                className
            )}
        >
            {/* Messages grouped by date */}
            {sortedDates.map((dateKey) => {
                const dateMessages = groupedMessages[dateKey];
                const date = new Date(dateKey);

                return (
                    <div key={dateKey} className="space-y-4">
                        <DateSeparator date={date.toISOString()} />
                        {dateMessages.map((message, index) => {
                            const isOwn = message.sender_id === currentUserId;
                            const prevMessage = index > 0 ? dateMessages[index - 1] : null;
                            const showAvatar =
                                !prevMessage || prevMessage.sender_id !== message.sender_id;

                            return (
                                <MessageBubble
                                    key={message.id}
                                    message={message}
                                    isOwn={isOwn}
                                    showAvatar={showAvatar}
                                    onDelete={onDeleteMessage}
                                />
                            );
                        })}
                    </div>
                );
            })}

            {/* Typing indicator */}
            {isOtherUserTyping && otherUserName && (
                <TypingIndicator userName={otherUserName} />
            )}

            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
        </div>
    );
}
