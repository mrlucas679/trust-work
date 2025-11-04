/**
 * MessageBubble Component
 * 
 * Individual message bubble with avatar, content, timestamp, and read receipt.
 */

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Check, CheckCheck, MoreVertical, Trash2, Download } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import type { Message } from '@/types/messaging';
import { getAttachmentType } from '@/types/messaging';
import { cn } from '@/lib/utils';
import { FileAttachment } from './FileAttachment';

interface MessageBubbleProps {
    message: Message;
    isOwn: boolean;
    showAvatar?: boolean;
    onDelete?: (messageId: string) => void;
    className?: string;
}

export function MessageBubble({
    message,
    isOwn,
    showAvatar = true,
    onDelete,
    className,
}: MessageBubbleProps) {
    // Format timestamp
    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);

        if (isToday(date)) {
            return format(date, 'h:mm a');
        } else if (isYesterday(date)) {
            return `Yesterday, ${format(date, 'h:mm a')}`;
        } else {
            return format(date, 'MMM d, h:mm a');
        }
    };

    const timestamp = formatTimestamp(message.created_at);
    const isRead = !!message.read_at;

    return (
        <div
            className={cn(
                'flex gap-3 group',
                isOwn ? 'flex-row-reverse' : 'flex-row',
                className
            )}
        >
            {/* Avatar */}
            {showAvatar ? (
                <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage
                        src={message.sender?.avatar_url || undefined}
                        alt={message.sender?.display_name || 'User'}
                    />
                    <AvatarFallback>
                        {(message.sender?.display_name || message.sender?.full_name || 'U')[0].toUpperCase()}
                    </AvatarFallback>
                </Avatar>
            ) : (
                <div className="w-8 shrink-0" />
            )}

            {/* Message Content */}
            <div
                className={cn(
                    'flex flex-col max-w-[70%] gap-1',
                    isOwn ? 'items-end' : 'items-start'
                )}
            >
                {/* Sender Name (if not own message and avatar is shown) */}
                {!isOwn && showAvatar && (
                    <span className="text-xs font-medium text-muted-foreground px-3">
                        {message.sender?.display_name || message.sender?.full_name || 'Unknown'}
                    </span>
                )}

                {/* Message Bubble */}
                <div
                    className={cn(
                        'rounded-2xl px-4 py-2 break-words',
                        isOwn
                            ? 'bg-primary text-primary-foreground rounded-br-sm'
                            : 'bg-muted rounded-bl-sm'
                    )}
                >
                    {/* Attachment */}
                    {message.attachment_url && (
                        // Normalize attachment_type to UI-friendly type
                        // Accepts either our AttachmentType union or a MIME string
                        // Falls back to 'other' when unknown
                        (() => {
                            const rawType = message.attachment_type || 'other';
                            const normalized =
                                rawType === 'image' || rawType === 'document' || rawType === 'video' || rawType === 'other'
                                    ? rawType
                                    : getAttachmentType(String(rawType));
                            return (
                                <FileAttachment
                                    url={message.attachment_url}
                                    name={message.attachment_name || 'Attachment'}
                                    type={normalized}
                                    size={message.attachment_size || 0}
                                    className="mb-2"
                                />
                            );
                        })()
                    )}

                    {/* Text Content */}
                    {message.content && (
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    )}
                </div>

                {/* Metadata */}
                <div className="flex items-center gap-2 px-3">
                    <span className="text-xs text-muted-foreground">{timestamp}</span>

                    {/* Read Receipt (only for own messages) */}
                    {isOwn && (
                        <span className="text-muted-foreground">
                            {isRead ? (
                                <CheckCheck className="h-3 w-3 text-blue-500" />
                            ) : (
                                <Check className="h-3 w-3" />
                            )}
                        </span>
                    )}

                    {/* Actions Dropdown */}
                    {onDelete && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <MoreVertical className="h-3 w-3" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align={isOwn ? 'end' : 'start'}>
                                {message.attachment_url && (
                                    <DropdownMenuItem asChild>
                                        <a
                                            href={message.attachment_url}
                                            download={message.attachment_name}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2"
                                        >
                                            <Download className="h-4 w-4" />
                                            Download
                                        </a>
                                    </DropdownMenuItem>
                                )}
                                {isOwn && (
                                    <DropdownMenuItem
                                        onClick={() => onDelete(message.id)}
                                        className="text-destructive"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>
        </div>
    );
}

/**
 * Date Separator Component
 * Shows date divider between messages from different days
 */
export function DateSeparator({ date }: { date: string }) {
    const formatDate = (dateString: string) => {
        const d = new Date(dateString);

        if (isToday(d)) {
            return 'Today';
        } else if (isYesterday(d)) {
            return 'Yesterday';
        } else {
            return format(d, 'MMMM d, yyyy');
        }
    };

    return (
        <div className="flex items-center gap-4 my-4">
            <div className="flex-1 border-t border-border" />
            <Badge variant="secondary" className="shrink-0">
                {formatDate(date)}
            </Badge>
            <div className="flex-1 border-t border-border" />
        </div>
    );
}

/**
 * Typing Indicator Component
 * Shows animated typing indicator
 */
export function TypingIndicator({ userName }: { userName?: string }) {
    return (
        <div className="flex gap-3">
            <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback>
                    {userName ? userName[0].toUpperCase() : '?'}
                </AvatarFallback>
            </Avatar>
            <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
                <div className="flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
            </div>
        </div>
    );
}
