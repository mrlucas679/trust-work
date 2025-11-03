import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Shield, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { BackNavigationButton } from "./BackNavigationButton";
import { InlineSearch } from "@/components/search/InlineSearch";

interface TopNavigationProps {
  className?: string;
  onMenuClick?: () => void;
}

export const TopNavigation = ({ className, onMenuClick }: TopNavigationProps) => {
  const navigate = useNavigate();

  const handleHomeClick = () => {
    navigate('/dashboard/job-seeker');
    window.location.reload();
  };

  const handleMenuClick = () => {
    onMenuClick?.();
  };



  return <header
    className={cn(
      "fixed top-0 left-0 right-0",
      "w-full h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 print:hidden",
      className
    )}
    style={{ zIndex: 'var(--z-navbar)' }}
    role="banner"
    aria-label="Main navigation"
  >
    <div className="flex h-16 items-center justify-between gap-2 sm:gap-3 lg:gap-4 px-4 max-w-full">
      {/* Left Section - Menu Button and Logo */}
      <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 flex-shrink-0 min-w-0">
        {/* Menu Toggle Button - Enhanced for touch devices */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleMenuClick}
          className="h-11 w-11 flex-shrink-0 relative z-10 touch-manipulation"
          aria-label="Toggle navigation menu"
          aria-expanded="false"
          style={{ touchAction: 'manipulation' }}
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </Button>

        {/* Logo - Clickable */}
        <Button
          variant="ghost"
          className="flex items-center gap-2 p-2 flex-shrink-0 min-w-0"
          onClick={handleHomeClick}
          aria-label="Go to home page"
        >
          <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" aria-hidden="true" />
          <span className="text-lg sm:text-xl font-bold hidden sm:inline-block truncate">TrustWork</span>
        </Button>
      </div>

      {/* Center Section - Search Bar (takes available space but can shrink) */}
      <div className="flex-1 min-w-0 max-w-xl lg:max-w-2xl mx-2 sm:mx-3 lg:mx-4" role="search">
        <InlineSearch />
      </div>

      {/* Right Section - Back Navigation */}
      <nav className="flex items-center gap-2 flex-shrink-0" aria-label="Secondary navigation">
        <BackNavigationButton />
      </nav>
    </div>
  </header>;
};