import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface NotificationFiltersProps {
  filter: 'all' | 'unread' | 'jobs' | 'messages';
  unreadCount: number;
  onFilterChange: (filter: 'all' | 'unread' | 'jobs' | 'messages') => void;
}

const NotificationFilters = ({ filter, unreadCount, onFilterChange }: NotificationFiltersProps) => {
  const filters = [
    { key: 'all', label: 'All' },
    { key: 'unread', label: 'Unread' },
    { key: 'jobs', label: 'Jobs' },
    { key: 'messages', label: 'Messages' }
  ];

  return (
    <div className="flex gap-2">
      {filters.map(({ key, label }) => (
        <Button
          key={key}
          variant={filter === key ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFilterChange(key as any)}
          className="animate-scale-in"
        >
          {label}
          {key === 'unread' && unreadCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {unreadCount}
            </Badge>
          )}
        </Button>
      ))}
    </div>
  );
};

export default NotificationFilters;