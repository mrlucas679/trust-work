-- =====================================================
-- Phase 2: Messaging & Communication System Migration
-- =====================================================
-- Description: Creates tables, indexes, RLS policies, and triggers for 
--              real-time messaging between freelancers and employers
-- Created: November 3, 2025
-- Version: 1.0
-- =====================================================

-- ==================
-- 1. CONVERSATIONS TABLE
-- ==================

CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID REFERENCES public.assignments(id) ON DELETE SET NULL,
    participant_1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    participant_2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    last_message_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT different_participants CHECK (participant_1_id != participant_2_id)
);

COMMENT ON TABLE public.conversations IS 'Stores conversation threads between two users, optionally related to an assignment';
COMMENT ON COLUMN public.conversations.assignment_id IS 'Optional reference to assignment that initiated the conversation';
COMMENT ON COLUMN public.conversations.participant_1_id IS 'First participant user ID';
COMMENT ON COLUMN public.conversations.participant_2_id IS 'Second participant user ID';
COMMENT ON COLUMN public.conversations.last_message_at IS 'Timestamp of most recent message in conversation';

-- ==================
-- 2. MESSAGES TABLE
-- ==================

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    read_at TIMESTAMPTZ,
    attachment_url TEXT,
    attachment_type TEXT CHECK (attachment_type IN ('image', 'document', 'video', 'other')),
    attachment_name TEXT,
    attachment_size INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT non_empty_content CHECK (LENGTH(TRIM(content)) > 0 OR attachment_url IS NOT NULL)
);

COMMENT ON TABLE public.messages IS 'Stores individual messages within conversation threads';
COMMENT ON COLUMN public.messages.conversation_id IS 'Reference to parent conversation';
COMMENT ON COLUMN public.messages.sender_id IS 'User who sent the message';
COMMENT ON COLUMN public.messages.content IS 'Message text content (required if no attachment)';
COMMENT ON COLUMN public.messages.read_at IS 'Timestamp when message was marked as read';
COMMENT ON COLUMN public.messages.attachment_url IS 'Supabase storage URL for file attachment';
COMMENT ON COLUMN public.messages.attachment_type IS 'Type of attached file';
COMMENT ON COLUMN public.messages.attachment_name IS 'Original filename of attachment';
COMMENT ON COLUMN public.messages.attachment_size IS 'File size in bytes';

-- ==================
-- 3. INDEXES FOR PERFORMANCE
-- ==================

-- Conversations indexes
CREATE INDEX IF NOT EXISTS conversations_participant_1_idx ON public.conversations(participant_1_id);
CREATE INDEX IF NOT EXISTS conversations_participant_2_idx ON public.conversations(participant_2_id);
CREATE INDEX IF NOT EXISTS conversations_assignment_idx ON public.conversations(assignment_id);
CREATE INDEX IF NOT EXISTS conversations_last_message_idx ON public.conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS conversations_participants_idx ON public.conversations(participant_1_id, participant_2_id);

-- Messages indexes
CREATE INDEX IF NOT EXISTS messages_conversation_idx ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS messages_sender_idx ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS messages_conversation_created_idx ON public.messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS messages_read_at_idx ON public.messages(read_at) WHERE read_at IS NULL;

-- Full-text search index for message content
CREATE INDEX IF NOT EXISTS messages_content_search_idx ON public.messages 
    USING GIN (to_tsvector('english', content));

-- ==================
-- 4. ROW LEVEL SECURITY POLICIES
-- ==================

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Conversations policies
CREATE POLICY "Users can view own conversations" ON public.conversations
    FOR SELECT USING (
        auth.uid() = participant_1_id OR auth.uid() = participant_2_id
    );

CREATE POLICY "Users can create conversations" ON public.conversations
    FOR INSERT WITH CHECK (
        auth.uid() = participant_1_id OR auth.uid() = participant_2_id
    );

CREATE POLICY "Participants can update conversation" ON public.conversations
    FOR UPDATE USING (
        auth.uid() = participant_1_id OR auth.uid() = participant_2_id
    );

CREATE POLICY "Participants can delete conversation" ON public.conversations
    FOR DELETE USING (
        auth.uid() = participant_1_id OR auth.uid() = participant_2_id
    );

-- Messages policies
CREATE POLICY "Users can view conversation messages" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversations
            WHERE conversations.id = messages.conversation_id
            AND (conversations.participant_1_id = auth.uid() OR conversations.participant_2_id = auth.uid())
        )
    );

CREATE POLICY "Users can send messages to conversations" ON public.messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.conversations
            WHERE conversations.id = conversation_id
            AND (conversations.participant_1_id = auth.uid() OR conversations.participant_2_id = auth.uid())
        )
        AND auth.uid() = sender_id
    );

CREATE POLICY "Users can update own messages" ON public.messages
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.conversations
            WHERE conversations.id = messages.conversation_id
            AND (conversations.participant_1_id = auth.uid() OR conversations.participant_2_id = auth.uid())
        )
    );

CREATE POLICY "Sender can delete own messages" ON public.messages
    FOR DELETE USING (auth.uid() = sender_id);

-- ==================
-- 5. HELPER FUNCTIONS
-- ==================

-- Function to update conversation's last_message_at timestamp
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.conversations
    SET last_message_at = NEW.created_at,
        updated_at = NOW()
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION update_conversation_last_message() IS 'Automatically updates conversation last_message_at when new message is inserted';

-- Function to get unread message count for a user
CREATE OR REPLACE FUNCTION get_unread_count(conversation_id_param UUID, user_id_param UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM public.messages
        WHERE conversation_id = conversation_id_param
        AND sender_id != user_id_param
        AND read_at IS NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_unread_count(UUID, UUID) IS 'Returns count of unread messages in a conversation for a specific user';

-- Function to mark all messages in conversation as read
CREATE OR REPLACE FUNCTION mark_conversation_read(conversation_id_param UUID, user_id_param UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.messages
    SET read_at = NOW(),
        updated_at = NOW()
    WHERE conversation_id = conversation_id_param
    AND sender_id != user_id_param
    AND read_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION mark_conversation_read(UUID, UUID) IS 'Marks all unread messages in a conversation as read for the specified user';

-- Function to get or create conversation between two users
CREATE OR REPLACE FUNCTION get_or_create_conversation(
    user_1_id UUID,
    user_2_id UUID,
    assignment_id_param UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    conversation_id UUID;
BEGIN
    -- Try to find existing conversation
    SELECT id INTO conversation_id
    FROM public.conversations
    WHERE (participant_1_id = user_1_id AND participant_2_id = user_2_id)
       OR (participant_1_id = user_2_id AND participant_2_id = user_1_id)
    LIMIT 1;

    -- If not found, create new conversation
    IF conversation_id IS NULL THEN
        INSERT INTO public.conversations (participant_1_id, participant_2_id, assignment_id)
        VALUES (user_1_id, user_2_id, assignment_id_param)
        RETURNING id INTO conversation_id;
    END IF;

    RETURN conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_or_create_conversation(UUID, UUID, UUID) IS 'Gets existing conversation between two users or creates a new one';

-- ==================
-- 6. TRIGGERS
-- ==================

-- Trigger to update last_message_at when new message is inserted
CREATE TRIGGER update_conversation_timestamp
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_last_message();

-- Trigger to update updated_at on messages
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_messages_updated_at
BEFORE UPDATE ON public.messages
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
BEFORE UPDATE ON public.conversations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ==================
-- 7. REALTIME PUBLICATION (for Supabase Realtime)
-- ==================

-- Enable realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;

-- ==================
-- 8. GRANT PERMISSIONS
-- ==================

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.conversations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_count(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_conversation_read(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_or_create_conversation(UUID, UUID, UUID) TO authenticated;

-- ==================
-- MIGRATION COMPLETE
-- ==================

-- Verification query (run this to verify migration succeeded)
-- SELECT 
--   (SELECT COUNT(*) FROM public.conversations) as conversations_count,
--   (SELECT COUNT(*) FROM public.messages) as messages_count,
--   (SELECT COUNT(*) FROM pg_indexes WHERE tablename IN ('conversations', 'messages')) as indexes_count,
--   (SELECT COUNT(*) FROM pg_trigger WHERE tgname LIKE '%conversation%' OR tgname LIKE '%message%') as triggers_count;
