import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Send, ArrowLeft, Shield, Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getConversation, getMessages, sendMessage, subscribeToMessages, unsubscribe, markMessagesAsRead } from '@/lib/api/messaging';
import type { ConversationWithParticipant, Message } from '@/lib/api/messaging';

const Chat = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [conversation, setConversation] = useState<ConversationWithParticipant | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const subscriptionRef = useRef<ReturnType<typeof subscribeToMessages> | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const [conversationData, messagesData] = await Promise.all([
          getConversation(id),
          getMessages(id)
        ]);

        setConversation(conversationData);
        setMessages(messagesData);

        await markMessagesAsRead(id);

        const subscription = subscribeToMessages(id, (newMsg: Message) => {
          setMessages(prev => [...prev, newMsg]);
          markMessagesAsRead(id);
        });
        subscriptionRef.current = subscription;
      } catch (error) {
        console.error('Error loading conversation:', error);
        toast({
          title: 'Error',
          description: 'Failed to load conversation. Please try again.',
          variant: 'destructive'
        });
        navigate('/messages');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      if (subscriptionRef.current) {
        unsubscribe(subscriptionRef.current);
      }
    };
  }, [id, navigate, toast]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !id) return;

    try {
      setIsSending(true);
      await sendMessage({
        conversation_id: id,
        content: newMessage.trim()
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSending(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 24) {
      return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    }
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="bg-muted/20 p-6">
        <Card>
          <CardContent className="p-12 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Loading conversation...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="bg-muted/20 p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Conversation not found</p>
            <Button onClick={() => navigate('/messages')} className="mt-4">
              Back to Messages
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const otherPartyName = conversation.other_participant?.display_name || 'Unknown';

  return (
    <div className="bg-muted/20 p-6">
      <div className="space-y-6">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" onClick={() => navigate('/messages')}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{getInitials(otherPartyName)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="font-semibold">{otherPartyName}</h2>
                  </div>
                  {conversation.assignment_id && (
                    <p className="text-sm text-muted-foreground">Re: Assignment {conversation.assignment_id.substring(0, 8)}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Report
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {messages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isCurrentUser = msg.sender_id === conversation.participant_1_id || msg.sender_id === conversation.participant_2_id;
                  const isSentByMe = msg.sender_id === conversation.participant_1_id;

                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${isSentByMe
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                          }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        <div className="flex items-center justify-between mt-1 space-x-2">
                          <p
                            className={`text-xs ${isSentByMe
                              ? 'text-primary-foreground/70'
                              : 'text-muted-foreground'
                              }`}
                          >
                            {formatTime(msg.created_at)}
                          </p>
                          {msg.read_at && isSentByMe && (
                            <Badge variant="outline" className="text-xs py-0 px-1 h-4">
                              Read
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <Textarea
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="min-h-[80px] resize-none"
                disabled={isSending}
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground flex items-center">
                  <Shield className="h-3 w-3 mr-1" />
                  Encrypted and monitored for safety
                </p>
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isSending}
                  size="sm"
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Chat;