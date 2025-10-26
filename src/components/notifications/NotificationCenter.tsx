import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Bell } from "lucide-react";
import NotificationItem from "./NotificationItem";
import NotificationFilters from "./NotificationFilters";
import NotificationHeader from "./NotificationHeader";
import { useSupabase } from "@/providers/SupabaseProvider";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  type: 'job_match' | 'application' | 'message' | 'payment' | 'safety' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  actionLabel?: string;
}

const NotificationCenter = () => {
  const { supabase, user } = useSupabase();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<'all' | 'unread' | 'jobs' | 'messages'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');

  useEffect(() => {
    if (!user) return;

    const subscription: { unsubscribe: () => void } | null = null;

    // Fetch notifications from Supabase
    const fetchNotifications = async (isRetry = false) => {
      try {
        if (isRetry) {
          setIsRetrying(true);
        } else {
          setLoading(true);
        }
        setError(null);
        setConnectionStatus('connecting');

        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const formatted = (data || []).map(n => ({
          id: n.id,
          type: n.type as Notification['type'],
          title: n.title,
          message: n.message,
          time: formatDistanceToNow(new Date(n.created_at), { addSuffix: true }),
          read: n.read,
          priority: n.priority as Notification['priority'],
          actionUrl: n.action_url,
          actionLabel: n.action_label
        }));

        setNotifications(formatted);
        setUnreadCount(formatted.filter(n => !n.read).length);
        setConnectionStatus('connected');
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError(err instanceof Error ? err.message : 'Failed to load notifications');
        setConnectionStatus('disconnected');

        // Fall back to mock notifications if there's an error
        const mockNotifications: Notification[] = [
          {
            id: '1',
            type: 'job_match',
            title: 'New Job Match Found!',
            message: 'A Senior React Developer position at TechCorp matches 95% of your profile.',
            time: '5 minutes ago',
            read: false,
            priority: 'high',
            actionUrl: '/job/1',
            actionLabel: 'View Job'
          },
          {
            id: '2',
            type: 'application',
            title: 'Application Status Update',
            message: 'Your application for Frontend Developer at StartupXYZ has been reviewed.',
            time: '1 hour ago',
            read: false,
            priority: 'medium',
            actionUrl: '/applications',
            actionLabel: 'View Status'
          },
          {
            id: '3',
            type: 'message',
            title: 'New Message from Employer',
            message: 'WebDev Agency sent you a message about your gig proposal.',
            time: '2 hours ago',
            read: true,
            priority: 'medium',
            actionUrl: '/messages',
            actionLabel: 'Read Message'
          }
        ];
        setNotifications(mockNotifications);
        setUnreadCount(mockNotifications.filter(n => !n.read).length);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    // Subscribe to real-time notifications
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newNotif = payload.new as Record<string, unknown>;
            const formatted: Notification = {
              id: newNotif.id as string,
              type: newNotif.type as Notification['type'],
              title: newNotif.title as string,
              message: newNotif.message as string,
              time: formatDistanceToNow(new Date(newNotif.created_at as string), { addSuffix: true }),
              read: newNotif.read as boolean,
              priority: newNotif.priority as Notification['priority'],
              actionUrl: newNotif.action_url as string | undefined,
              actionLabel: newNotif.action_label as string | undefined
            };
            setNotifications(prev => [formatted, ...prev]);
            if (!newNotif.read) {
              setUnreadCount(prev => prev + 1);
            }
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [supabase, user]);


  const markAsRead = async (id: string) => {
    if (!user) return;

    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)
        .eq('user_id', user.id);

      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const deleteNotification = async (id: string) => {
    if (!user) return;

    try {
      await supabase
        .from('notifications')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      setNotifications(prev => {
        const notification = prev.find(n => n.id === id);
        const updated = prev.filter(n => n.id !== id);
        if (notification && !notification.read) {
          setUnreadCount(count => Math.max(0, count - 1));
        }
        return updated;
      });
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread': return !notification.read;
      case 'jobs': return ['job_match', 'application'].includes(notification.type);
      case 'messages': return notification.type === 'message';
      default: return true;
    }
  });

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <NotificationHeader
          unreadCount={unreadCount}
          onMarkAllAsRead={markAllAsRead}
        />
      </CardHeader>

      <CardContent className="space-y-4">
        <NotificationFilters
          filter={filter}
          unreadCount={unreadCount}
          onFilterChange={setFilter}
        />

        <ScrollArea className="h-96">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="text-muted-foreground mt-4">Loading notifications...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification, index) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  index={index}
                  onMarkAsRead={markAsRead}
                  onDelete={deleteNotification}
                />
              ))}

              {filteredNotifications.length === 0 && (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {filter === 'all' ? 'No notifications yet' : `No ${filter} notifications`}
                  </p>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        <Separator />
        <div className="flex justify-between items-center pt-2">
          <p className="text-sm text-muted-foreground">
            {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
          </p>
          <Button variant="ghost" size="sm" className="text-primary">
            Notification Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationCenter;