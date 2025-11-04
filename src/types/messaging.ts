/**
 * Messaging & Communication Types
 * 
 * Type definitions for the real-time messaging system including
 * conversations, messages, and file attachments.
 */

import type { IUserProfile as BaseUserProfile } from './user';
import type { Assignment } from './search';

// Re-export a compatible user profile type for messaging that supports multiple naming conventions used in tests/UI
export type IUserProfile = Omit<BaseUserProfile, 'name'> & {
    name?: string;
    // Optional alternate field names used in some components/tests
    display_name?: string;
    full_name?: string;
    avatar_url?: string;
    avatarUrl?: string;
    role?: import('./user').UserRole;
    created_at?: string;
    updated_at?: string;
};

// Type alias for convenience
export type UserProfile = IUserProfile;

/**
 * Conversation between two users
 * Represents a message thread, optionally linked to an assignment
 */
export interface Conversation {
    id: string;
    assignment_id?: string | null;
    participant_1_id: string;
    participant_2_id: string;
    last_message_at?: string | null;
    created_at: string;
    updated_at: string;

    // Populated fields (from joins)
    participant_1?: UserProfile;
    participant_2?: UserProfile;
    assignment?: Assignment;
    unread_count?: number;
    last_message?: Message;
}

/**
 * Individual message in a conversation
 */
export interface Message {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    read_at?: string | null;
    attachment_url?: string | null;
    attachment_type?: AttachmentType | string | null;
    attachment_name?: string | null;
    attachment_size?: number | null;
    created_at: string;
    updated_at: string;

    // Populated fields (from joins)
    sender?: UserProfile;
}

/**
 * Input for creating a new message
 */
export interface MessageInput {
    conversation_id: string;
    content: string;
    attachment?: File;
    // Compatibility alias used in some callers/tests
    file?: File;
}

/**
 * Input for creating a new conversation
 */
export interface ConversationInput {
    participant_id: string;  // The other user's ID
    assignment_id?: string;
    initial_message?: string;
}

/**
 * Attachment types supported in messages
 */
export type AttachmentType = 'image' | 'document' | 'video' | 'other';

/**
 * Message attachment details
 */
export interface MessageAttachment {
    url: string;
    type: AttachmentType;
    name: string;
    size: number;
}

/**
 * Conversation with additional metadata
 * Used in conversation list views
 */
export interface ConversationWithMetadata extends Conversation {
    other_user: UserProfile;  // The user you're chatting with
    unread_count: number;
    last_message?: Message;
}

/**
 * Message send status
 */
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

/**
 * Optimistic message (shown while sending)
 */
export interface OptimisticMessage extends Omit<Message, 'id' | 'created_at' | 'updated_at'> {
    id: string;  // Temporary ID
    status: MessageStatus;
    created_at: string;
    updated_at: string;
}

/**
 * File upload progress
 */
export interface UploadProgress {
    file: File;
    progress: number;  // 0-100
    status: 'uploading' | 'completed' | 'failed';
    url?: string;
    error?: string;
}

/**
 * Typing indicator state
 */
export interface TypingIndicator {
    conversation_id: string;
    user_id: string;
    user_name: string;
    timestamp: string;
}

/**
 * Message search filters
 */
export interface MessageSearchFilters {
    query?: string;
    conversation_id?: string;
    user_id?: string; // compatibility: some tests use user_id filter
    from_date?: string;
    to_date?: string;
    has_attachments?: boolean;
    attachment_type?: AttachmentType;
}

/**
 * Conversation filters for conversation list
 */
export interface ConversationFilters {
    has_unread?: boolean;
    assignment_id?: string;
    search_query?: string;
}

/**
 * Message pagination options
 */
export interface MessagePaginationOptions {
    page?: number;
    page_size?: number;
    before_id?: string;  // For loading older messages
    after_id?: string;   // For loading newer messages
}

/**
 * Constants
 */

export const MAX_MESSAGE_LENGTH = 5000;
export const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const ALLOWED_DOCUMENT_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
];
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];

export const ATTACHMENT_ICONS: Record<AttachmentType, string> = {
    image: '🖼️',
    document: '📄',
    video: '🎥',
    other: '📎',
};

/**
 * Helper functions
 */

/**
 * Get attachment type from MIME type
 */
export function getAttachmentType(mimeType: string): AttachmentType {
    if (ALLOWED_IMAGE_TYPES.includes(mimeType)) return 'image';
    if (ALLOWED_DOCUMENT_TYPES.includes(mimeType)) return 'document';
    if (ALLOWED_VIDEO_TYPES.includes(mimeType)) return 'video';
    return 'other';
}

/**
 * Validate file for upload
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
    if (file.size > MAX_ATTACHMENT_SIZE) {
        return {
            valid: false,
            error: `File size must be less than ${MAX_ATTACHMENT_SIZE / 1024 / 1024} MB`,
        };
    }

    const allowedTypes = [
        ...ALLOWED_IMAGE_TYPES,
        ...ALLOWED_DOCUMENT_TYPES,
        ...ALLOWED_VIDEO_TYPES,
    ];

    if (!allowedTypes.includes(file.type)) {
        return {
            valid: false,
            error: 'File type not allowed',
        };
    }

    return { valid: true };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Get other user in conversation
 */
export function getOtherUser(
    conversation: Conversation,
    currentUserId: string
): UserProfile | undefined {
    if (conversation.participant_1_id === currentUserId) {
        return conversation.participant_2;
    }
    return conversation.participant_1;
}

/**
 * Check if message is from current user
 */
export function isOwnMessage(message: Message, currentUserId: string): boolean {
    return message.sender_id === currentUserId;
}

/**
 * Check if message has attachment
 */
export function hasAttachment(message: Message): boolean {
    return !!message.attachment_url;
}

/**
 * Generate optimistic message ID
 */
export function generateOptimisticId(): string {
    return `optimistic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
