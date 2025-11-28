import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Shield, Menu, Briefcase, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { BackNavigationButton } from "./BackNavigationButton";
import { InlineSearch } from "@/components/search/InlineSearch";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useSupabase } from "@/providers/SupabaseProvider";

interface TopNavigationProps {
  className?: string;
  onMenuClick?: () => void;
}

export const TopNavigation = ({ className, onMenuClick }: TopNavigationProps) => {
  const navigate = useNavigate();
  const { profile, isEmployer, isJobSeeker } = useSupabase();
  const menuBtnRef = React.useRef<HTMLButtonElement | null>(null);

  React.useEffect(() => {
    // Ensure inline style attribute exists for test expectations and touch devices
    if (menuBtnRef.current) {
      const existing = menuBtnRef.current.getAttribute('style');
      if (!existing) {
        menuBtnRef.current.setAttribute('style', 'touch-action: manipulation; -webkit-tap-highlight-color: transparent;');
      }
    }
  }, []);

  const handleHomeClick = () => {
    navigate('/dashboard/job-seeker');
    window.location.reload();
  };

  const handleMenuClick = () => {
    onMenuClick?.();
  };



  return <header
    className={cn(
      "fixed top-0 left-0 right-0 z-50",
      "w-full h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 print:hidden",
      className
    )}
    role="banner"
    aria-label="Main navigation"
  >
    <div className="flex h-16 items-center justify-between gap-2 sm:gap-3 lg:gap-4 px-4 max-w-full">
      {/* Left Section - Menu Button and Logo */}
      <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 flex-shrink-0 min-w-0">
        {/* Menu Toggle Button - Enhanced for touch devices */}
        <button
          ref={menuBtnRef}
          onClick={handleMenuClick}
          className="h-11 w-11 inline-flex items-center justify-center flex-shrink-0 relative z-10 touch-manipulation hover:bg-accent hover:text-accent-foreground rounded-md"
          aria-label="Toggle navigation menu"
          aria-expanded="false"
          style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent', color: 'inherit' }}
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>

        {/* Logo - Clickable */}
        <Button
          variant="ghost"
          className="flex items-center gap-2 p-2 flex-shrink-0 min-w-0"
          onClick={handleHomeClick}
          aria-label="Go to home page"
        >
          <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" aria-hidden="true" />
          <span className="text-lg sm:text-xl font-bold hidden sm:block truncate">TrustWork</span>
        </Button>

        {/* Role Badge */}
        {profile && (
          <Badge
            variant={isEmployer ? "default" : "secondary"}
            className="hidden md:flex items-center gap-1 flex-shrink-0"
          >
            {isEmployer ? (
              <>
                <Briefcase className="h-3 w-3" />
                Employer
              </>
            ) : (
              <>
                <User className="h-3 w-3" />
                Job Seeker
              </>
            )}
          </Badge>
        )}
      </div>

      {/* Center Section - Search Bar (takes available space but can shrink) */}
      <div className="flex-1 min-w-0 max-w-xl lg:max-w-2xl mx-2 sm:mx-3 lg:mx-4" role="search">
        <InlineSearch />
      </div>

      {/* Right Section - Notifications and Back Navigation */}
      <nav className="flex items-center gap-2 flex-shrink-0" aria-label="Secondary navigation">
        <NotificationBell />
        <BackNavigationButton />
      </nav>
    </div>
  </header>;
};