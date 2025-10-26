/**
 * @fileoverview UserProfileSection component displays user information in the sidebar
 * including their avatar, verification status, rating, and professional details.
 */

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Props for the UserProfileSection component
 * @interface UserProfileSectionProps
 * 
 * @property {string} name - The user's full name, used for display and avatar fallback
 * @property {string} [avatar] - Optional URL to the user's avatar image
 * @property {boolean} [verified] - Whether the user is verified, displays a badge if true
 * @property {number} [rating] - User's rating out of 5 stars
 * @property {number} [completedJobs] - Number of jobs completed by the user
 * @property {string} [professionalStatus] - User's professional status or title
 */
interface UserProfileSectionProps {
    name: string;
    avatar?: string;
    verified?: boolean;
    rating?: number;
    completedJobs?: number;
    professionalStatus?: string;
}

/**
 * UserProfileSection component
 * 
 * Displays a user's profile information in a compact format, including:
 * - Avatar with initials fallback
 * - Verification badge (if verified)
 * - Rating and completed jobs
 * - Professional status
 * 
 * @component
 */
export function UserProfileSection({
    name,
    avatar,
    verified,
    rating,
    completedJobs,
    professionalStatus
}: UserProfileSectionProps) {
    // Generate initials from the user's name for avatar fallback
    const initials = name.split(" ").map(n => n[0]).join("");

    return (
        <div className={cn(
            "p-4",                    // Padding
            "flex items-center",      // Layout
            "space-x-3"              // Spacing
        )}>
            <div className="relative group">
                <Avatar className={cn(
                    "h-10 w-10",                      // Size
                    "ring-2 ring-primary/10",         // Border
                    "transition-transform duration-200", // Animation
                    "group-hover:scale-105"           // Hover effect
                )}>
                    <AvatarImage src={avatar} alt={`${name}'s profile picture`} />
                    <AvatarFallback className="bg-primary/5">{initials}</AvatarFallback>
                </Avatar>
                {verified && (
                    <BadgeCheck
                        data-testid="verification-badge"
                        className={cn(
                            "h-4 w-4",                    // Size
                            "text-primary",               // Color
                            "absolute -bottom-1 -right-1", // Position
                            "bg-background rounded-full",  // Background
                            "shadow-sm",                  // Shadow
                            "transition-all duration-200", // Animation
                            "group-hover:scale-110"       // Hover effect
                        )}
                    />
                )}
            </div>
            {/* User Information Section */}
            <div className={cn(
                "flex flex-col",   // Layout
                "min-w-0"         // Prevent overflow
            )}>
                {/* User Name */}
                <div className="flex items-center gap-1">
                    <p className={cn(
                        "text-sm font-medium", // Typography
                        "truncate",           // Handle overflow
                        "tracking-tight"      // Letter spacing
                    )}>
                        {name}
                    </p>
                </div>

                {/* Rating and Job Count */}
                {rating && completedJobs && (
                    <p className={cn(
                        "text-xs",                           // Size
                        "text-muted-foreground/90",         // Color
                        "transition-colors duration-200",    // Animation
                        "hover:text-muted-foreground"       // Hover effect
                    )}>
                        <span aria-hidden>⭐</span>{' '}
                        <span>{rating.toFixed(1)} · {completedJobs} jobs</span>
                    </p>
                )}

                {/* Professional Status */}
                {professionalStatus && (
                    <p className={cn(
                        "text-xs",                           // Size
                        "text-muted-foreground/80",         // Color
                        "truncate",                         // Handle overflow
                        "transition-colors duration-200",    // Animation
                        "hover:text-muted-foreground"       // Hover effect
                    )}>
                        {professionalStatus}
                    </p>
                )}
            </div>
        </div>
    );
}
