/**
 * @fileoverview NavigationItem component for sidebar navigation
 * Provides a consistent navigation item style with optional badge and icon support
 */

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { NavLink } from "react-router-dom";

const navigationItemVariants = cva(
    "group relative flex items-center w-full rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    {
        variants: {
            variant: {
                default: "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                active: "bg-accent text-accent-foreground",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

/**
 * Props for the NavigationItem component
 * 
 * @interface NavigationItemProps
 * @extends {Omit<React.HTMLAttributes<HTMLAnchorElement>, 'children'>}
 * @extends {VariantProps<typeof navigationItemVariants>}
 * 
 * @property {React.ElementType} icon - The icon component to display
 * @property {string} title - The text to display next to the icon
 * @property {string} to - The route path to navigate to
 * @property {string | number} [badge] - Optional badge content to display
 * @property {boolean} [customComponent] - Whether to render as a custom component (used for theme toggle)
 */
interface NavigationItemProps
    extends Omit<React.HTMLAttributes<HTMLAnchorElement>, 'children'>,
    VariantProps<typeof navigationItemVariants> {
    icon: React.ElementType;
    title: string;
    to: string;
    badge?: string | number;
    customComponent?: boolean;
}

export function NavigationItem({
    className,
    icon: Icon,
    title,
    to,
    badge,
    customComponent,
    ...props
}: NavigationItemProps) {
    const content = (
        <>
            {customComponent ? (
                <Icon />
            ) : (
                <Icon className="h-5 w-5 mr-3 transition-transform group-hover:scale-105" />
            )}
            {!customComponent && <span className="flex-1 truncate">{title}</span>}
            {!customComponent && badge && (
                <Badge
                    variant="secondary"
                    className="ml-auto h-5 px-2 text-xs"
                >
                    {badge}
                </Badge>
            )}
        </>
    );

    return customComponent ? (
        <div className={cn(
            navigationItemVariants({
                variant: "default",
                className
            }),
            "cursor-pointer"
        )}>
            {content}
        </div>
    ) : (
        <NavLink
            to={to}
            className={({ isActive }) => cn(
                navigationItemVariants({
                    variant: isActive ? "active" : "default",
                    className
                })
            )}
            {...props}
        >
            {({ isActive }) => (
                <>
                    <Icon className={cn(
                        "h-5 w-5 transition-transform group-hover:scale-105",
                        "mr-0 2xl:group-hover:mr-3 md:mr-3 2xl:mr-0", // Responsive margins
                        isActive && "text-primary"
                    )} />
                    <span className={cn(
                        "flex-1 truncate transition-opacity duration-200 ml-3",
                        "opacity-100 2xl:opacity-0 2xl:group-hover:opacity-100" // Always show text except on 2xl screens when not hovered
                    )}>{title}</span>
                    {badge && (
                        <Badge
                            variant="secondary"
                            className={cn(
                                "ml-auto h-5 px-2 text-xs transition-opacity duration-200",
                                "opacity-100 2xl:opacity-0 2xl:group-hover:opacity-100", // Always show badge except on 2xl screens when not hovered
                                isActive && "bg-primary/20 text-primary"
                            )}
                        >
                            {badge}
                        </Badge>
                    )}
                </>
            )}
        </NavLink>
    );
}
