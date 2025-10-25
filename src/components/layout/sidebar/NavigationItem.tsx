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

interface NavigationItemProps
    extends Omit<React.HTMLAttributes<HTMLAnchorElement>, 'children'>,
    VariantProps<typeof navigationItemVariants> {
    icon: React.ElementType;
    title: string;
    to: string;
    badge?: string | number;
}

export function NavigationItem({
    className,
    icon: Icon,
    title,
    to,
    badge,
    ...props
}: NavigationItemProps) {
    return (
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
                        "h-5 w-5 mr-3 transition-transform group-hover:scale-105",
                        isActive && "text-primary"
                    )} />
                    <span className="flex-1 truncate">{title}</span>
                    {badge && (
                        <Badge
                            variant="secondary"
                            className={cn(
                                "ml-auto h-5 px-2 text-xs",
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
