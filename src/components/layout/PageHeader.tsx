import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
    title: ReactNode;
    subtitle?: ReactNode;
    actions?: ReactNode;
    className?: string;
}

export function PageHeader({ title, subtitle, actions, className }: PageHeaderProps) {
    return (
        <div className={cn("mb-6 md:mb-8", className)}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
                    {subtitle && (
                        <p className="text-muted-foreground mt-1 text-sm md:text-base">{subtitle}</p>
                    )}
                </div>
                {actions && (
                    <div className="flex items-center gap-2">{actions}</div>
                )}
            </div>
        </div>
    );
}
