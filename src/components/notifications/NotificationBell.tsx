import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useSupabase } from "@/providers/SupabaseProvider";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NotificationBellProps {
    className?: string;
}

/**
 * NotificationBell Component
 * 
 * Displays a bell icon with unread notification count badge.
 * Shows a popover with recent notifications when clicked.
 * Integrates with Supabase for real-time notification updates.
 */
export const NotificationBell = ({ className }: NotificationBellProps) => {
    const navigate = useNavigate();
    const [unreadCount, setUnreadCount] = useState(0);
    const [open, setOpen] = useState(false);

    // Gracefully handle absence of SupabaseProvider (e.g., in tests)
    let supabase: ReturnType<typeof useSupabase>["supabase"] | null = null;
    let user: ReturnType<typeof useSupabase>["user"] | null = null;
    let providerAvailable = true;
    try {
        const ctx = useSupabase();
        supabase = ctx.supabase;
        user = ctx.user;
    } catch {
        providerAvailable = false;
    }
    useEffect(() => {
        if (!user || !supabase) return;

        // Fetch unread notification count
        const fetchUnreadCount = async () => {
            try {
                const { count, error } = await supabase
                    .from('notifications')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id)
                    .eq('read', false);

                if (error) throw error;
                setUnreadCount(count || 0);
            } catch (err) {
                console.error('Error fetching unread count:', err);
            }
        };

        fetchUnreadCount();

        // Subscribe to real-time updates
        const channel = supabase
            .channel('notification-bell')
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
                        const newNotif = payload.new as { read: boolean };
                        if (!newNotif.read) {
                            setUnreadCount(prev => prev + 1);
                        }
                    } else if (payload.eventType === 'UPDATE') {
                        const oldNotif = payload.old as { read: boolean };
                        const newNotif = payload.new as { read: boolean };
                        if (oldNotif.read !== newNotif.read) {
                            setUnreadCount(prev => Math.max(0, prev + (newNotif.read ? -1 : 1)));
                        }
                    } else if (payload.eventType === 'DELETE') {
                        const oldNotif = payload.old as { read: boolean };
                        if (!oldNotif.read) {
                            setUnreadCount(prev => Math.max(0, prev - 1));
                        }
                    }
                }
            )
            .subscribe();

        return () => {
            channel.unsubscribe();
        };
    }, [supabase, user]);

    if (!providerAvailable) {
        return null;
    }

    const handleClick = () => {
        setOpen(false);
        navigate('/notifications');
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "relative h-11 w-11 flex-shrink-0 touch-manipulation",
                        className
                    )}
                    aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
                >
                    <Bell className="h-5 w-5" aria-hidden="true" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 min-w-[1.25rem] rounded-full px-1 text-xs flex items-center justify-center animate-in zoom-in-50"
                        >
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="end">
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm">Notifications</h3>
                        {unreadCount > 0 && (
                            <Badge variant="secondary" className="text-xs">
                                {unreadCount} unread
                            </Badge>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {unreadCount > 0
                            ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}.`
                            : 'You\'re all caught up!'}
                    </p>
                    <Button
                        variant="default"
                        size="sm"
                        className="w-full"
                        onClick={handleClick}
                    >
                        View All Notifications
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
};
