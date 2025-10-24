import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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

export const PageLoadingSpinner = () => (
    <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
    </div>
);
