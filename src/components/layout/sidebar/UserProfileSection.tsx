import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BadgeCheck } from "lucide-react";

interface UserProfileSectionProps {
    name: string;
    avatar?: string;
    verified?: boolean;
    rating?: number;
    completedJobs?: number;
    professionalStatus?: string;
}

export function UserProfileSection({
    name,
    avatar,
    verified,
    rating,
    completedJobs,
    professionalStatus
}: UserProfileSectionProps) {
    return (
        <div className="p-4 flex items-center space-x-3 border-b border-border/10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="relative group">
                <Avatar className="h-10 w-10 ring-2 ring-primary/10 transition-transform duration-200 group-hover:scale-105">
                    <AvatarImage src={avatar} alt={name} />
                    <AvatarFallback className="bg-primary/5">{name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                </Avatar>
                {verified && (
                    <BadgeCheck className="h-4 w-4 text-primary absolute -bottom-1 -right-1 bg-background rounded-full shadow-sm transition-all duration-200 group-hover:scale-110" />
                )}
            </div>
            <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1">
                    <p className="text-sm font-medium truncate tracking-tight">{name}</p>
                </div>
                {rating && completedJobs && (
                    <p className="text-xs text-muted-foreground/90 transition-colors duration-200 hover:text-muted-foreground">
                        ⭐ {rating.toFixed(1)} · {completedJobs} jobs
                    </p>
                )}
                {professionalStatus && (
                    <p className="text-xs text-muted-foreground/80 truncate transition-colors duration-200 hover:text-muted-foreground">
                        {professionalStatus}
                    </p>
                )}
            </div>
        </div>
    );
}
