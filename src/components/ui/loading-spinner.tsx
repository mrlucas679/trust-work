import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface LoadingSpinnerProps {
    className?: string;
    size?: "sm" | "md" | "lg";
}

export const LoadingSpinner = ({ className, size = "md" }: LoadingSpinnerProps) => {
    const sizeClass = {
        sm: "h-4 w-4",
        md: "h-8 w-8",
        lg: "h-12 w-12",
    }[size];

    return (
        <div className="flex min-h-[200px] items-center justify-center">
            <Loader2
                className={cn(
                    "animate-spin text-primary",
                    sizeClass,
                    className
                )}
            />
        </div>
    );
};

export const PageLoadingSpinner = () => {
    const [messageIndex, setMessageIndex] = useState(0);

    const motivationalMessages = [
        "✨ Loading your opportunities...",
        "🚀 Preparing something amazing...",
        "💫 Almost there...",
        "🎯 Getting everything ready...",
        "⚡ Just a moment..."
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % motivationalMessages.length);
        }, 2000);
        return () => clearInterval(interval);
    }, [motivationalMessages.length]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-sm text-muted-foreground animate-pulse">
                {motivationalMessages[messageIndex]}
            </p>
        </div>
    );
};
