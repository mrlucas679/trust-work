import { cn } from "@/lib/utils";
import { ComponentPropsWithoutRef } from "react";

interface PageContainerProps extends ComponentPropsWithoutRef<"div"> {
    /**
     * Max width of the container
     * @default "2xl" (1400px)
     */
    maxWidth?: "md" | "lg" | "xl" | "2xl" | "full";
    /**
     * Whether to add vertical padding
     * @default false (AppLayout provides padding)
     */
    withPadding?: boolean;
}

/**
 * Standard page container component that works within AppLayout
 * AppLayout already provides `container mx-auto p-6`, so this is for additional constraints
 */
export function PageContainer({
    children,
    className,
    maxWidth = "2xl",
    withPadding = false,
    ...props
}: PageContainerProps) {
    return (
        <div
            className={cn(
                "w-full mx-auto",
                {
                    "max-w-screen-md": maxWidth === "md",
                    "max-w-screen-lg": maxWidth === "lg",
                    "max-w-screen-xl": maxWidth === "xl",
                    "max-w-[1400px]": maxWidth === "2xl",
                    "max-w-full": maxWidth === "full",
                },
                withPadding && "py-6 sm:py-8",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
