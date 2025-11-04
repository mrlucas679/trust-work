-- Migration: Notifications System
-- Description: Create notifications table with real-time support, triggers, and RLS policies
-- Date: 2025-11-04

-- =====================================================
-- NOTIFICATIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    action_url TEXT,
    action_text VARCHAR(100),
    metadata JSONB DEFAULT '{}'::jsonb,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT valid_notification_type CHECK (
        type IN (
            'message',
            'assignment_new',
            'assignment_accepted',
            'assignment_submitted',
            'assignment_completed',
            'assignment_cancelled',
            'payment_received',
            'payment_released',
            'review_received',
            'system'
        )
    )
);

-- =====================================================
-- NOTIFICATION PREFERENCES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    
    -- In-app notification preferences
    in_app_messages BOOLEAN NOT NULL DEFAULT true,
    in_app_assignments BOOLEAN NOT NULL DEFAULT true,
    in_app_payments BOOLEAN NOT NULL DEFAULT true,
    in_app_reviews BOOLEAN NOT NULL DEFAULT true,
    in_app_system BOOLEAN NOT NULL DEFAULT true,
    
    -- Email notification preferences
    email_messages BOOLEAN NOT NULL DEFAULT true,
    email_assignments BOOLEAN NOT NULL DEFAULT true,
    email_payments BOOLEAN NOT NULL DEFAULT true,
    email_reviews BOOLEAN NOT NULL DEFAULT true,
    email_system BOOLEAN NOT NULL DEFAULT false,
    
    -- Push notification preferences
    push_messages BOOLEAN NOT NULL DEFAULT true,
    push_assignments BOOLEAN NOT NULL DEFAULT true,
    push_payments BOOLEAN NOT NULL DEFAULT true,
    push_reviews BOOLEAN NOT NULL DEFAULT true,
    push_system BOOLEAN NOT NULL DEFAULT false,
    
    -- Push subscription data
    push_subscription JSONB,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Index for fetching user notifications (most common query)
CREATE INDEX idx_notifications_user_created 
ON notifications(user_id, created_at DESC);

-- Index for unread notifications count
CREATE INDEX idx_notifications_user_unread 
ON notifications(user_id) 
WHERE read_at IS NULL;

-- Index for notification type filtering
CREATE INDEX idx_notifications_user_type 
ON notifications(user_id, type, created_at DESC);

-- Index for notification preferences lookup
CREATE INDEX idx_notification_preferences_user 
ON notification_preferences(user_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Notifications policies
CREATE POLICY "Users can view own notifications"
ON notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
ON notifications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
ON notifications FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
ON notifications FOR INSERT
WITH CHECK (true);

-- Notification preferences policies
CREATE POLICY "Users can view own preferences"
ON notification_preferences FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
ON notification_preferences FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
ON notification_preferences FOR UPDATE
USING (auth.uid() = user_id);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_as_read(notification_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE notifications
    SET read_at = NOW()
    WHERE id = notification_id
    AND user_id = auth.uid()
    AND read_at IS NULL;
END;
$$;

-- Function to mark all notifications as read
CREATE OR REPLACE FUNCTION mark_all_notifications_as_read()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    affected_count INTEGER;
BEGIN
    UPDATE notifications
    SET read_at = NOW()
    WHERE user_id = auth.uid()
    AND read_at IS NULL;
    
    GET DIAGNOSTICS affected_count = ROW_COUNT;
    RETURN affected_count;
END;
$$;

-- Function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    unread_count INTEGER;
BEGIN
    SELECT COUNT(*)::INTEGER
    INTO unread_count
    FROM notifications
    WHERE user_id = auth.uid()
    AND read_at IS NULL;
    
    RETURN unread_count;
END;
$$;

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_type VARCHAR(50),
    p_title TEXT,
    p_message TEXT,
    p_action_url TEXT DEFAULT NULL,
    p_action_text VARCHAR(100) DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        action_url,
        action_text,
        metadata
    )
    VALUES (
        p_user_id,
        p_type,
        p_title,
        p_message,
        p_action_url,
        p_action_text,
        p_metadata
    )
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$;

-- Function to initialize notification preferences for new users
CREATE OR REPLACE FUNCTION initialize_notification_preferences()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO notification_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
END;
$$;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger to initialize preferences when user is created
CREATE TRIGGER trigger_initialize_notification_preferences
AFTER INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION initialize_notification_preferences();

-- Trigger to update updated_at on preferences
CREATE TRIGGER trigger_update_notification_preferences_updated_at
BEFORE UPDATE ON notification_preferences
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- REALTIME
-- =====================================================

-- Enable realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE notification_preferences;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE notifications IS 'Stores all user notifications with real-time support';
COMMENT ON TABLE notification_preferences IS 'User preferences for notification delivery channels';
COMMENT ON COLUMN notifications.type IS 'Type of notification (message, assignment, payment, etc.)';
COMMENT ON COLUMN notifications.metadata IS 'Additional notification data stored as JSON';
COMMENT ON COLUMN notifications.read_at IS 'Timestamp when notification was marked as read';
COMMENT ON FUNCTION mark_notification_as_read IS 'Mark a single notification as read';
COMMENT ON FUNCTION mark_all_notifications_as_read IS 'Mark all user notifications as read';
COMMENT ON FUNCTION get_unread_notification_count IS 'Get count of unread notifications for current user';
COMMENT ON FUNCTION create_notification IS 'Create a new notification for a user';
