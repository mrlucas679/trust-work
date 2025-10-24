import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Briefcase, 
  CheckCircle, 
  AlertTriangle, 
  MessageSquare, 
  DollarSign,
  Star,
  Bell,
  X
} from "lucide-react";
import { useNavigate } from "react-router-dom";

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

interface NotificationItemProps {
  notification: Notification;
  index: number;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const NotificationItem = ({ notification, index, onMarkAsRead, onDelete }: NotificationItemProps) => {
  const navigate = useNavigate();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'job_match': return <Briefcase className="h-4 w-4 text-primary" />;
      case 'application': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'message': return <MessageSquare className="h-4 w-4 text-accent" />;
      case 'payment': return <DollarSign className="h-4 w-4 text-success" />;
      case 'safety': return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'system': return <Star className="h-4 w-4 text-primary" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-destructive';
      case 'medium': return 'border-l-warning';
      case 'low': return 'border-l-muted';
      default: return 'border-l-muted';
    }
  };

  return (
    <div
      className={`p-4 border rounded-lg transition-all duration-200 animate-scale-in hover-scale ${
        !notification.read ? 'bg-muted/30 border-l-4 ' + getPriorityColor(notification.priority) : ''
      }`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          {getNotificationIcon(notification.type)}
          <h4 className="font-semibold text-sm">{notification.title}</h4>
          {!notification.read && (
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground">{notification.time}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(notification.id)}
            className="h-6 w-6 p-0 hover:bg-destructive/20"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-3">
        {notification.message}
      </p>

      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          {notification.actionUrl && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                onMarkAsRead(notification.id);
                navigate(notification.actionUrl!);
              }}
            >
              {notification.actionLabel}
            </Button>
          )}
          {!notification.read && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onMarkAsRead(notification.id)}
              className="text-primary"
            >
              Mark as Read
            </Button>
          )}
        </div>
        
        <Badge
          variant={notification.priority === 'high' ? 'destructive' : 'outline'}
          className="text-xs"
        >
          {notification.priority}
        </Badge>
      </div>
    </div>
  );
};

export default NotificationItem;