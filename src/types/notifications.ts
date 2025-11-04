/**
 * @fileoverview Notification types and utilities
 * @module types/notifications
 */

import type { IUserProfile } from './user';

/**
 * Notification types
 */
export type NotificationType =
    | 'message'
    | 'assignment_new'
    | 'assignment_accepted'
    | 'assignment_submitted'
    | 'assignment_completed'
    | 'assignment_cancelled'
    | 'payment_received'
    | 'payment_released'
    | 'review_received'
    | 'system';

/**
 * Notification interface
 */
export interface Notification {
    id: string;
    user_id: string;
    type: NotificationType;
    title: string;
    message: string;
    action_url: string | null;
    action_text: string | null;
    metadata: Record<string, unknown>;
    read_at: string | null;
    created_at: string;
}

/**
 * Notification with sender info (for message notifications)
 */
export interface NotificationWithSender extends Notification {
    sender?: IUserProfile;
}

/**
 * Notification preferences interface
 */
export interface NotificationPreferences {
    id: string;
    user_id: string;

    // In-app preferences
    in_app_messages: boolean;
    in_app_assignments: boolean;
    in_app_payments: boolean;
    in_app_reviews: boolean;
    in_app_system: boolean;

    // Email preferences
    email_messages: boolean;
    email_assignments: boolean;
    email_payments: boolean;
    email_reviews: boolean;
    email_system: boolean;

    // Push preferences
    push_messages: boolean;
    push_assignments: boolean;
    push_payments: boolean;
    push_reviews: boolean;
    push_system: boolean;

    push_subscription: PushSubscriptionJSON | null;

    created_at: string;
    updated_at: string;
}

/**
 * Push subscription data
 */
export interface PushSubscriptionJSON {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
}

/**
 * Notification filters
 */
export interface NotificationFilters {
    type?: NotificationType;
    unread_only?: boolean;
}

/**
 * Notification input for creation
 */
export interface NotificationInput {
    user_id: string;
    type: NotificationType;
    title: string;
    message: string;
    action_url?: string;
    action_text?: string;
    metadata?: Record<string, unknown>;
}

/**
 * Notification grouping (for display)
 */
export interface NotificationGroup {
    date: string; // e.g., "Today", "Yesterday", "2025-01-15"
    notifications: Notification[];
}

/**
 * Constants
 */
export const NOTIFICATION_ICONS: Record<NotificationType, string> = {
    message: '💬',
    assignment_new: '📋',
    assignment_accepted: '✅',
    assignment_submitted: '📤',
    assignment_completed: '🎉',
    assignment_cancelled: '❌',
    payment_received: '💰',
    payment_released: '💳',
    review_received: '⭐',
    system: '🔔',
};

export const NOTIFICATION_COLORS: Record<NotificationType, string> = {
    message: 'blue',
    assignment_new: 'green',
    assignment_accepted: 'green',
    assignment_submitted: 'blue',
    assignment_completed: 'purple',
    assignment_cancelled: 'red',
    payment_received: 'green',
    payment_released: 'blue',
    review_received: 'yellow',
    system: 'gray',
};

/**
 * Helper functions
 */

/**
 * Check if notification is unread
 */
export function isUnread(notification: Notification): boolean {
    return notification.read_at === null;
}

/**
 * Get notification icon
 */
export function getNotificationIcon(type: NotificationType): string {
    return NOTIFICATION_ICONS[type] || NOTIFICATION_ICONS.system;
}

/**
 * Get notification color
 */
export function getNotificationColor(type: NotificationType): string {
    return NOTIFICATION_COLORS[type] || NOTIFICATION_COLORS.system;
}

/**
 * Format notification time (relative)
 */
export function formatNotificationTime(createdAt: string): string {
    const date = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });
}

/**
 * Group notifications by date
 */
export function groupNotificationsByDate(notifications: Notification[]): NotificationGroup[] {
    const groups: Map<string, Notification[]> = new Map();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    notifications.forEach((notification) => {
        const date = new Date(notification.created_at);
        date.setHours(0, 0, 0, 0);

        let groupKey: string;
        if (date.getTime() === today.getTime()) {
            groupKey = 'Today';
        } else if (date.getTime() === yesterday.getTime()) {
            groupKey = 'Yesterday';
        } else {
            groupKey = date.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
            });
        }

        if (!groups.has(groupKey)) {
            groups.set(groupKey, []);
        }
        groups.get(groupKey)!.push(notification);
    });

    return Array.from(groups.entries()).map(([date, notifications]) => ({
        date,
        notifications,
    }));
}

/**
 * Get notification category from type
 */
export function getNotificationCategory(type: NotificationType): string {
    if (type === 'message') return 'Messages';
    if (type.startsWith('assignment')) return 'Assignments';
    if (type.startsWith('payment')) return 'Payments';
    if (type === 'review_received') return 'Reviews';
    return 'System';
}

/**
 * Check if browser supports push notifications
 */
export function supportsPushNotifications(): boolean {
    return (
        'Notification' in window &&
        'serviceWorker' in navigator &&
        'PushManager' in window
    );
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
        throw new Error('This browser does not support notifications');
    }

    const permission = await Notification.requestPermission();
    return permission;
}

/**
 * Show browser notification
 */
export function showBrowserNotification(
    title: string,
    options?: NotificationOptions
): Notification | null {
    if (!('Notification' in window)) {
        return null;
    }

    if (Notification.permission === 'granted') {
        return new Notification(title, options);
    }

    return null;
}

/**
 * Generate notification title based on type
 */
export function generateNotificationTitle(
    type: NotificationType,
    metadata?: Record<string, unknown>
): string {
    switch (type) {
        case 'message':
            return metadata?.senderName
                ? `New message from ${metadata.senderName}`
                : 'New message';
        case 'assignment_new':
            return 'New assignment available';
        case 'assignment_accepted':
            return 'Your assignment was accepted';
        case 'assignment_submitted':
            return 'Assignment submitted for review';
        case 'assignment_completed':
            return 'Assignment completed!';
        case 'assignment_cancelled':
            return 'Assignment cancelled';
        case 'payment_received':
            return 'Payment received';
        case 'payment_released':
            return 'Payment released';
        case 'review_received':
            return 'You received a new review';
        case 'system':
            return 'System notification';
        default:
            return 'New notification';
    }
}
