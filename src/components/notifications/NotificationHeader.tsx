import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CardTitle } from "@/components/ui/card";
import { BellRing, Settings } from "lucide-react";

interface NotificationHeaderProps {
  unreadCount: number;
  onMarkAllAsRead: () => void;
}

const NotificationHeader = ({ unreadCount, onMarkAllAsRead }: NotificationHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <CardTitle className="flex items-center">
        <BellRing className="h-5 w-5 mr-2 text-primary" />
        Notifications
        {unreadCount > 0 && (
          <Badge variant="destructive" className="ml-2">
            {unreadCount}
          </Badge>
        )}
      </CardTitle>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onMarkAllAsRead}
          disabled={unreadCount === 0}
        >
          Mark All Read
        </Button>
        <Button variant="ghost" size="sm">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default NotificationHeader;