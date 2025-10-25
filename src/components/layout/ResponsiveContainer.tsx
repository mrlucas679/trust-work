import { cn } from "@/lib/utils";
import { ComponentPropsWithoutRef } from "react";

interface ResponsiveContainerProps extends ComponentPropsWithoutRef<"div"> {
    fluid?: boolean;
    as?: "div" | "section" | "article";
}

export function ResponsiveContainer({
    children,
    className,
    fluid = false,
    as: Component = "div",
    ...props
}: ResponsiveContainerProps) {
    return (
        <Component
            className={cn(
                "w-full px-4 mx-auto",
                "sm:px-6 lg:px-8",
                !fluid && "max-w-[1400px]",
                "relative",
                className
            )}
            {...props}
        >
            {children}
        </Component>
    );
}

export function ResponsiveGrid({
    children,
    className,
    ...props
}: ComponentPropsWithoutRef<"div">) {
    return (
        <div
            className={cn(
                "grid grid-cols-1",
                "gap-4 w-full",
                "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export function ResponsiveStack({
    children,
    className,
    ...props
}: ComponentPropsWithoutRef<"div">) {
    return (
        <div
            className={cn(
                "flex flex-col",
                "gap-4 w-full",
                "sm:flex-row sm:items-center",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
