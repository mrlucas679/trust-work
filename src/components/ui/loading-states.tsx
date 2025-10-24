import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// Job Card Skeleton
export const JobCardSkeleton = () => (
  <Card className="animate-pulse">
    <CardContent className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-6 w-20" />
          </div>
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-10 w-24" />
      </div>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-3/4 mb-4" />
      <div className="flex gap-4 mb-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-18" />
      </div>
    </CardContent>
  </Card>
);

// Dashboard Stats Skeleton
export const StatCardSkeleton = () => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center space-x-2">
        <Skeleton className="h-8 w-8 rounded" />
        <div>
          <Skeleton className="h-6 w-12 mb-1" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// Gig Card Skeleton
export const GigCardSkeleton = () => (
  <Card className="animate-pulse">
    <CardContent className="p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <Skeleton className="h-5 w-40 mb-1" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-6 w-20" />
      </div>
      <Skeleton className="h-4 w-16 mb-2" />
      <Skeleton className="h-4 w-20 mb-2" />
      <div className="flex gap-1 mt-2">
        <Skeleton className="h-5 w-12" />
        <Skeleton className="h-5 w-16" />
      </div>
    </CardContent>
  </Card>
);

// Loading Spinner Component
export const LoadingSpinner = ({ size = "default" }: { size?: "sm" | "default" | "lg" }) => {
  const sizeClass = {
    sm: "h-4 w-4",
    default: "h-6 w-6", 
    lg: "h-8 w-8"
  }[size];

  return <Loader2 className={`animate-spin ${sizeClass}`} />;
};

// Page Loading Component
export const PageLoading = ({ message = "Loading..." }: { message?: string }) => (
  <div className="flex items-center justify-center min-h-[400px] flex-col gap-4">
    <LoadingSpinner size="lg" />
    <p className="text-muted-foreground">{message}</p>
  </div>
);

// Button Loading State
export const ButtonLoading = ({ children, isLoading, ...props }: { 
  children: React.ReactNode; 
  isLoading: boolean;
  [key: string]: any;
}) => (
  <button disabled={isLoading} {...props}>
    {isLoading ? (
      <div className="flex items-center gap-2">
        <LoadingSpinner size="sm" />
        {children}
      </div>
    ) : (
      children
    )}
  </button>
);