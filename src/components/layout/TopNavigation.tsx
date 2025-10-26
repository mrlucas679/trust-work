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
      "fixed top-0 left-0 right-0 z-50",
      "w-full h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 print:hidden",
      className
    )}
    role="banner"
    aria-label="Main navigation"
  >
    <div className="container mx-auto flex h-16 items-center justify-between gap-3 lg:gap-4 px-4">
      {/* Left Section - Menu Button and Logo */}
      <div className="flex items-center gap-3 lg:gap-4 flex-shrink-0">
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
          className="flex items-center gap-2 p-2 flex-shrink-0"
          onClick={handleHomeClick}
          aria-label="Go to home page"
        >
          <Shield className="h-8 w-8 text-primary" aria-hidden="true" />
          <span className="text-xl font-bold hidden sm:block">TrustWork</span>
        </Button>
      </div>

      {/* Center Section - Search Bar (takes available space) */}
      <div className="flex-1 max-w-xl lg:max-w-2xl mx-2 lg:mx-4" role="search">
        <InlineSearch />
      </div>

      {/* Right Section - Back Navigation */}
      <nav className="flex items-center gap-2 flex-shrink-0" aria-label="Secondary navigation">
        <BackNavigationButton />
      </nav>
    </div>
  </header>;
};