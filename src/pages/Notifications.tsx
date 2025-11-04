import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import NotificationCenter from "@/components/notifications/NotificationCenter";

/**
 * Notifications Page
 * 
 * Displays the full notification center with all user notifications.
 * Features:
 * - Real-time notification updates via Supabase
 * - Filter by notification type (all, unread, jobs, messages)
 * - Mark notifications as read
 * - Delete notifications
 * - Action buttons for navigation
 */
const Notifications = () => {
    return (
        <PageContainer>
            <PageHeader
                title="Notifications"
                subtitle="Stay updated with your latest notifications"
            />
            <div className="max-w-4xl mx-auto">
                <NotificationCenter />
            </div>
        </PageContainer>
    );
};

export default Notifications;
