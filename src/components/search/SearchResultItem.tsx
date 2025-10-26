import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SearchResultItemProps {
    icon: ReactNode;
    title: string;
    description: string;
    onClick: () => void;
}

export const SearchResultItem = ({ icon, title, description, onClick }: SearchResultItemProps) => {
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full flex items-center gap-3 px-3 py-3 rounded-md",
                "hover:bg-accent transition-colors",
                "text-left group"
            )}
        >
            <div className="flex-shrink-0">
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <div className="font-medium text-sm group-hover:text-primary transition-colors">
                    {title}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                    {description}
                </div>
            </div>
        </button>
    );
};
