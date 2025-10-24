import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Search, 
  Briefcase, 
  MessageCircle, 
  Bell,
  Shield,
  Star,
  FileText,
  Users,
  AlertTriangle
} from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
}

export const EmptyState = ({ title, description, action, icon }: EmptyStateProps) => (
  <Card>
    <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="mb-4 p-3 bg-muted/50 rounded-full">
        {icon || <Search className="h-8 w-8 text-muted-foreground" />}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
      {action && (
        <Button onClick={action.onClick}>{action.label}</Button>
      )}
    </CardContent>
  </Card>
);

// Specific Empty States
export const NoJobsFound = ({ onClearFilters }: { onClearFilters?: () => void }) => (
  <EmptyState
    icon={<Search className="h-8 w-8 text-muted-foreground" />}
    title="No jobs found"
    description="We couldn't find any jobs matching your search criteria. Try adjusting your filters or search terms."
    action={onClearFilters ? { label: "Clear filters", onClick: onClearFilters } : undefined}
  />
);

export const NoGigsFound = ({ onBrowseGigs }: { onBrowseGigs?: () => void }) => (
  <EmptyState
    icon={<Briefcase className="h-8 w-8 text-muted-foreground" />}
    title="No gigs available"
    description="There are no gigs matching your skills and preferences right now. Check back soon for new opportunities!"
    action={onBrowseGigs ? { label: "Browse all gigs", onClick: onBrowseGigs } : undefined}
  />
);

export const NoMessages = ({ onStartConversation }: { onStartConversation?: () => void }) => (
  <EmptyState
    icon={<MessageCircle className="h-8 w-8 text-muted-foreground" />}
    title="No messages yet"
    description="Your message inbox is empty. Start connecting with employers and clients to see conversations here."
    action={onStartConversation ? { label: "Browse jobs", onClick: onStartConversation } : undefined}
  />
);

export const NoNotifications = () => (
  <EmptyState
    icon={<Bell className="h-8 w-8 text-muted-foreground" />}
    title="All caught up!"
    description="You don't have any new notifications. We'll let you know when something important happens."
  />
);

export const NoApplications = ({ onBrowseJobs }: { onBrowseJobs?: () => void }) => (
  <EmptyState
    icon={<FileText className="h-8 w-8 text-muted-foreground" />}
    title="No applications yet"
    description="You haven't applied to any jobs yet. Start exploring verified opportunities and build your career!"
    action={onBrowseJobs ? { label: "Browse jobs", onClick: onBrowseJobs } : undefined}
  />
);

export const NoReviews = () => (
  <EmptyState
    icon={<Star className="h-8 w-8 text-muted-foreground" />}
    title="No reviews yet"
    description="Complete your first job or gig to start receiving reviews from clients and employers."
  />
);

export const NoPortfolioItems = ({ onAddItem }: { onAddItem?: () => void }) => (
  <EmptyState
    icon={<Users className="h-8 w-8 text-muted-foreground" />}
    title="Build your portfolio"
    description="Showcase your skills, experience, and achievements to attract better opportunities."
    action={onAddItem ? { label: "Add portfolio item", onClick: onAddItem } : undefined}
  />
);

export const NoSafetyReports = () => (
  <EmptyState
    icon={<Shield className="h-8 w-8 text-verified" />}
    title="All clear!"
    description="No safety concerns have been reported. Keep following our safety guidelines for a secure experience."
  />
);

export const ErrorState = ({ onRetry }: { onRetry?: () => void }) => (
  <EmptyState
    icon={<AlertTriangle className="h-8 w-8 text-destructive" />}
    title="Something went wrong"
    description="We're having trouble loading this content. Please try again or contact support if the problem persists."
    action={onRetry ? { label: "Try again", onClick: onRetry } : undefined}
  />
);