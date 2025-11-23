import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { getConversations, getUnreadCount, type ConversationWithParticipant } from "@/lib/api/messaging";

const Messages = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<ConversationWithParticipant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchConversations = async () => {
      setIsLoading(true);
      try {
        const conversationsData = await getConversations();
        const unreadTotal = await getUnreadCount();
        setConversations(conversationsData);
        setUnreadCount(unreadTotal);
      } catch (error) {
        console.error('Error loading conversations:', error);
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to load conversations',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchConversations();
  }, [toast]);

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffMs = now.getTime() - messageDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMs / 3600000);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffDays < 7) return `${diffDays}d ago`;
    return messageDate.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="bg-muted/20 p-6">
        <Card><CardContent className="p-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading conversations...</p>
        </CardContent></Card>
      </div>
    );
  }

  return (
    <div className="bg-muted/20 p-6">
      <div className="space-y-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Messages {unreadCount > 0 && <Badge variant="destructive" className="ml-3">{unreadCount} new</Badge>}
            </h1>
            <p className="text-muted-foreground">Communicate safely with verified employers and freelancers.</p>
          </div>
        </div>
        <div className="space-y-4">
          {conversations.map((conversation) => {
            const otherParticipant = conversation.other_participant;
            const otherName = otherParticipant?.display_name || 'Unknown User';
            const hasUnread = (conversation.participant_1_unread_count || 0) + (conversation.participant_2_unread_count || 0) > 0;
            return (
              <Card key={conversation.id} className={`cursor-pointer transition-colors hover:bg-muted/50 ${hasUnread ? 'border-primary/20 bg-primary/5' : ''}`} onClick={() => navigate(`/chat/${conversation.id}`)}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-12 w-12"><AvatarFallback>{getInitials(otherName)}</AvatarFallback></Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-foreground truncate">{otherName}</h3>
                        <div className="flex items-center space-x-2">
                          {hasUnread && <Badge variant="default" className="text-xs">New</Badge>}
                          <span className="text-xs text-muted-foreground">{conversation.last_message_at ? getTimeAgo(conversation.last_message_at) : 'No messages'}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{conversation.last_message_preview || 'No messages yet'}</p>
                    </div>
                    <div className="flex flex-col items-center space-y-2">
                      <MessageCircle className="h-5 w-5 text-muted-foreground" />
                      {hasUnread && <div className="w-2 h-2 bg-primary rounded-full"></div>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        {conversations.length === 0 && (
          <Card className="text-center p-12">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Messages Yet</h3>
            <p className="text-muted-foreground mb-4">When you apply for jobs or accept applications, you'll be able to communicate here.</p>
            <Button onClick={() => navigate('/jobs')}>Browse Jobs</Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Messages;
