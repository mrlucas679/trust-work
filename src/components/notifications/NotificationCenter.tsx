import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Bell } from "lucide-react";
import NotificationItem from "./NotificationItem";
import NotificationFilters from "./NotificationFilters";
import NotificationHeader from "./NotificationHeader";

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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<'all' | 'unread' | 'jobs' | 'messages'>('all');

  useEffect(() => {
    // Mock notifications - in real app would come from API
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
      },
      {
        id: '4',
        type: 'safety',
        title: 'Safety Alert',
        message: 'A job posting you viewed has been flagged. We recommend caution.',
        time: '1 day ago',
        read: false,
        priority: 'high',
        actionUrl: '/safety',
        actionLabel: 'Learn More'
      },
      {
        id: '5',
        type: 'payment',
        title: 'Payment Received',
        message: 'You received R2,500 for the website design gig.',
        time: '2 days ago',
        read: true,
        priority: 'low',
        actionUrl: '/payments',
        actionLabel: 'View Payment'
      },
      {
        id: '6',
        type: 'system',
        title: 'Profile Completion Bonus',
        message: 'Complete your skills assessment to increase match accuracy by 30%!',
        time: '3 days ago',
        read: false,
        priority: 'low',
        actionUrl: '/assessments',
        actionLabel: 'Take Assessment'
      }
    ];

    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  }, []);


  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === id);
      const updated = prev.filter(n => n.id !== id);
      if (notification && !notification.read) {
        setUnreadCount(count => Math.max(0, count - 1));
      }
      return updated;
    });
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