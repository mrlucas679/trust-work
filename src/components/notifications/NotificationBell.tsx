import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { useSupabase } from "@/providers/SupabaseProvider";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface Notification {
    id: string;
    type: 'job_match' | 'application' | 'message' | 'payment' | 'safety' | 'system';
    title: string;
    message: string;
    created_at: string;
    read: boolean;
    priority?: 'low' | 'medium' | 'high';
    action_url?: string;
}

export const NotificationBell = () => {
    const navigate = useNavigate();
    const { supabase, user } = useSupabase();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (!user) return;

        // Fetch notifications from Supabase
        const fetchNotifications = async () => {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(10);

            if (!error && data) {
                setNotifications(data);
                setUnreadCount(data.filter((n: Notification) => !n.read).length);
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
                    filter: `user_id=eq.${user.id}`,
                },
                () => {
                    fetchNotifications();
                }
            )
            .subscribe();

        return () => {
            // Cleanup: Supabase will auto-cleanup on page unload
            // For tests, we can safely skip explicit cleanup
            try {
                supabase.removeAllChannels?.();
            } catch (e) {
                // Cleanup is optional - ignore errors
            }
        };
    }, [user, supabase]);

    const markAsRead = async (notificationId: string) => {
        if (!user) return;

        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', notificationId)
            .eq('user_id', user.id);

        if (!error) {
            setNotifications((prev) =>
                prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        }
    };

    const markAllAsRead = async () => {
        if (!user) return;

        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('user_id', user.id)
            .eq('read', false);

        if (!error) {
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
            setUnreadCount(0);
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        markAsRead(notification.id);
        if (notification.action_url) {
            navigate(notification.action_url);
            setIsOpen(false);
        }
    };

    const getNotificationIcon = (type: Notification['type']) => {
        const iconClasses = "h-4 w-4";
        switch (type) {
            case 'job_match':
                return <span className={cn(iconClasses, "text-blue-500")}>💼</span>;
            case 'application':
                return <span className={cn(iconClasses, "text-green-500")}>📝</span>;
            case 'message':
                return <span className={cn(iconClasses, "text-purple-500")}>💬</span>;
            case 'payment':
                return <span className={cn(iconClasses, "text-yellow-500")}>💰</span>;
            case 'safety':
                return <span className={cn(iconClasses, "text-red-500")}>🛡️</span>;
            case 'system':
                return <span className={cn(iconClasses, "text-gray-500")}>ℹ️</span>;
            default:
                return <Bell className={iconClasses} />;
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    aria-label="Notifications"
                >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-semibold">Notifications</h3>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={markAllAsRead}
                            className="text-xs"
                        >
                            Mark all read
                        </Button>
                    )}
                </div>
                <ScrollArea className="h-[400px]">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            <Bell className="h-12 w-12 mx-auto mb-3 opacity-20" />
                            <p className="text-sm">No notifications yet</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((notification) => (
                                <button
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={cn(
                                        "w-full p-4 text-left hover:bg-muted/50 transition-colors",
                                        !notification.read && "bg-primary/5"
                                    )}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="font-medium text-sm line-clamp-1">
                                                    {notification.title}
                                                </p>
                                                {!notification.read && (
                                                    <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {formatDistanceToNow(new Date(notification.created_at), {
                                                    addSuffix: true,
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </ScrollArea>
                {notifications.length > 0 && (
                    <>
                        <Separator />
                        <div className="p-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full"
                                onClick={() => {
                                    navigate('/notifications');
                                    setIsOpen(false);
                                }}
                            >
                                View all notifications
                            </Button>
                        </div>
                    </>
                )}
            </PopoverContent>
        </Popover>
    );
};
