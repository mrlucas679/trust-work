/**
 * Messages Page
 * 
 * Split layout with conversation list and message thread.
 * Responsive design with mobile support.
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSupabase } from '@/providers/SupabaseProvider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ConversationList } from '@/components/messaging/ConversationList';
import { MessageThread } from '@/components/messaging/MessageThread';
import { MessageInput } from '@/components/messaging/MessageInput';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getConversations, sendMessage, deleteMessage } from '@/lib/api/messaging';
import { useIsMobile } from '@/hooks/use-mobile';
import type { ConversationWithMetadata } from '@/types/messaging';

const Messages = () => {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const navigate = useNavigate();
  const { user } = useSupabase();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();

  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(
    conversationId || null
  );

  // Fetch conversations
  const { data: conversationsData } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: () => (user ? getConversations(user.id) : Promise.resolve([])),
    enabled: !!user,
  });

  const conversations = conversationsData || [];
  const selectedConversation = conversations.find(
    (c: ConversationWithMetadata) => c.id === selectedConversationId
  );

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({
      content,
      file,
    }: {
      content: string;
      file?: File;
    }) => {
      if (!selectedConversationId) {
        throw new Error('No conversation selected');
      }

      return sendMessage({
        conversation_id: selectedConversationId,
        content,
        file,
      });
    },
    onSuccess: () => {
      // Invalidate queries to refresh messages
      queryClient.invalidateQueries({ queryKey: ['messages', selectedConversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
    },
  });

  // Delete message mutation
  const deleteMessageMutation = useMutation({
    mutationFn: deleteMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', selectedConversationId] });
    },
  });

  // Handle conversation selection
  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    if (isMobile) {
      navigate(`/messages/${conversationId}`);
    }
  };

  // Handle back button (mobile)
  const handleBack = () => {
    setSelectedConversationId(null);
    navigate('/messages');
  };

  // Handle send message
  const handleSendMessage = async (content: string, file?: File) => {
    await sendMessageMutation.mutateAsync({ content, file });
  };

  // Mobile view: show only conversation list or thread
  if (isMobile) {
    if (selectedConversationId && selectedConversation) {
      return (
        <div className="flex flex-col h-screen">
          {/* Header */}
          <div className="border-b bg-background p-4 flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h2 className="font-semibold">
                {selectedConversation.other_user?.full_name || 'Unknown User'}
              </h2>
              {selectedConversation.assignment && (
                <p className="text-xs text-muted-foreground">
                  {selectedConversation.assignment.title}
                </p>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-hidden">
            <MessageThread
              conversationId={selectedConversationId}
              currentUserId={user?.id || ''}
              otherUserName={selectedConversation.other_user?.full_name}
              className="h-full"
              onDeleteMessage={(messageId) => deleteMessageMutation.mutate(messageId)}
            />
          </div>

          {/* Input */}
          <MessageInput
            conversationId={selectedConversationId}
            onSend={handleSendMessage}
          />
        </div>
      );
    }

    // Show conversation list
    return (
      <div className="bg-muted/20 p-4">
        <div className="mb-4">
          <h1 className="text-2xl font-bold">Messages</h1>
          <p className="text-sm text-muted-foreground">
            Communicate safely with verified users
          </p>
        </div>
        <ConversationList
          selectedConversationId={selectedConversationId}
          onSelectConversation={handleSelectConversation}
        />
      </div>
    );
  }

  // Desktop view: split layout
  return (
    <div className="bg-muted/20 p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Messages</h1>
        <p className="text-muted-foreground">
          Communicate safely with verified users
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
        {/* Conversation list */}
        <div className="col-span-1 overflow-hidden">
          <ConversationList
            selectedConversationId={selectedConversationId}
            onSelectConversation={handleSelectConversation}
            className="h-full"
          />
        </div>

        {/* Message thread */}
        <Card className="col-span-2 flex flex-col overflow-hidden">
          {selectedConversationId && selectedConversation ? (
            <>
              {/* Header */}
              <div className="border-b p-4 flex-shrink-0">
                <h2 className="font-semibold">
                  {selectedConversation.other_user?.full_name || 'Unknown User'}
                </h2>
                {selectedConversation.assignment && (
                  <p className="text-sm text-muted-foreground">
                    {selectedConversation.assignment.title}
                  </p>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-hidden">
                <MessageThread
                  conversationId={selectedConversationId}
                  currentUserId={user?.id || ''}
                  otherUserName={selectedConversation.other_user?.full_name}
                  className="h-full"
                  onDeleteMessage={(messageId) => deleteMessageMutation.mutate(messageId)}
                />
              </div>

              {/* Input */}
              <div className="flex-shrink-0">
                <MessageInput
                  conversationId={selectedConversationId}
                  onSend={handleSendMessage}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Select a conversation
                </h3>
                <p className="text-muted-foreground">
                  Choose a conversation from the list to start messaging
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Messages;