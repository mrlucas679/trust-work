/**
 * MessageInput Component
 * 
 * Text input for sending messages with file upload support,
 * character counter, and typing indicator integration.
 */

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Paperclip, Send, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FileUploadPreview } from './FileAttachment';
import { MAX_MESSAGE_LENGTH, validateFile } from '@/types/messaging';
import { useTypingIndicator } from '@/hooks/useMessages';

interface MessageInputProps {
    conversationId: string;
    onSend: (content: string, file?: File) => Promise<void>;
    disabled?: boolean;
    placeholder?: string;
    className?: string;
}

export function MessageInput({
    conversationId,
    onSend,
    disabled = false,
    placeholder = 'Type a message...',
    className,
}: MessageInputProps) {
    const [content, setContent] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Typing indicator
    const { sendTypingIndicator } = useTypingIndicator(conversationId);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    }, [content]);

    // Focus input on mount
    useEffect(() => {
        textareaRef.current?.focus();
    }, []);

    // Handle file selection
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        const validation = validateFile(selectedFile);
        if (!validation.valid) {
            setError(validation.error || 'Invalid file');
            return;
        }

        setFile(selectedFile);
        setError(null);
    };

    // Remove selected file
    const handleRemoveFile = () => {
        setFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Handle send message
    const handleSend = async () => {
        if ((!content.trim() && !file) || isSending || disabled) return;

        if (content.length > MAX_MESSAGE_LENGTH) {
            setError(`Message too long (max ${MAX_MESSAGE_LENGTH} characters)`);
            return;
        }

        try {
            setIsSending(true);
            setError(null);
            await onSend(content.trim(), file || undefined);
            setContent('');
            setFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            textareaRef.current?.focus();
        } catch (err) {
            console.error('Error sending message:', err);
            setError(err instanceof Error ? err.message : 'Failed to send message');
        } finally {
            setIsSending(false);
        }
    };

    // Handle Enter key (Shift+Enter for newline)
    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Handle input change (typing indicator)
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
        sendTypingIndicator(true);
    };

    const characterCount = content.length;
    const isOverLimit = characterCount > MAX_MESSAGE_LENGTH;
    const canSend = (content.trim() || file) && !isSending && !disabled && !isOverLimit;

    return (
        <div className={cn('border-t bg-background p-4', className)}>
            {/* Error message */}
            {error && (
                <div className="mb-2 text-sm text-destructive">{error}</div>
            )}

            {/* File preview */}
            {file && (
                <div className="mb-2">
                    <FileUploadPreview file={file} onRemove={handleRemoveFile} />
                </div>
            )}

            {/* Input area */}
            <div className="flex gap-2 items-end">
                {/* File upload button */}
                <div className="flex-shrink-0">
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        onChange={handleFileSelect}
                        accept="image/*,video/*,application/pdf,.doc,.docx,.txt"
                        disabled={disabled || isSending}
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={disabled || isSending}
                        className="h-10 w-10"
                    >
                        <Paperclip className="h-5 w-5" />
                        <span className="sr-only">Attach file</span>
                    </Button>
                </div>

                {/* Text input */}
                <div className="flex-1 relative">
                    <Textarea
                        ref={textareaRef}
                        value={content}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        disabled={disabled || isSending}
                        className={cn(
                            'min-h-[40px] max-h-[120px] resize-none pr-16',
                            isOverLimit && 'border-destructive focus-visible:ring-destructive'
                        )}
                        rows={1}
                    />
                    {/* Character counter */}
                    <div
                        className={cn(
                            'absolute bottom-2 right-2 text-xs text-muted-foreground',
                            isOverLimit && 'text-destructive font-medium'
                        )}
                    >
                        {characterCount}/{MAX_MESSAGE_LENGTH}
                    </div>
                </div>

                {/* Send button */}
                <div className="flex-shrink-0">
                    <Button
                        type="button"
                        onClick={handleSend}
                        disabled={!canSend}
                        size="icon"
                        className="h-10 w-10"
                    >
                        <Send className="h-5 w-5" />
                        <span className="sr-only">Send message</span>
                    </Button>
                </div>
            </div>

            {/* Keyboard shortcut hint */}
            <div className="mt-2 text-xs text-muted-foreground">
                Press Enter to send, Shift+Enter for new line
            </div>
        </div>
    );
}
