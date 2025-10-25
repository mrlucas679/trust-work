/**
 * Icons used throughout the sidebar
 */
import {
  Briefcase,
  Home,
  FileText,
  MessageSquare,
  Settings,
  HelpCircle,
  Shield,
  LogOut,
  ClipboardList,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu
} from "@/components/ui/sidebar";
import { NavigationItem } from "./sidebar/NavigationItem";
import { ThemeToggle } from "./sidebar/ThemeToggle";
import { cn } from "@/lib/utils";

/**
 * Primary navigation items for the main menu
 */
const mainItems = [{
  title: "My Space",
  url: "/dashboard/job-seeker",
  icon: Home
}, {
  title: "Jobs",
  url: "/jobs",
  icon: Briefcase,
  badge: "12"
}, {
  title: "Gigs",
  url: "/gigs",
  icon: FileText,
  badge: "5"
}, {
  title: "Applications",
  url: "/applications",
  icon: Briefcase,
  badge: "3"
}, {
  title: "Messages",
  url: "/messages",
  icon: MessageSquare,
  badge: "2"
}, {
  title: "Assignments",
  url: "/assignments",
  icon: ClipboardList,
  badge: "0"
}];
/**
 * Secondary navigation items for the bottom menu
 * Includes support, settings, and system-related actions
 */
const bottomItems = [
  {
    title: "Safety Center",
    url: "/safety",
    icon: Shield
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings
  },
  {
    title: "Help",
    url: "/help",
    icon: HelpCircle
  },
  {
    title: "Log Out",
    url: "/auth",
    icon: LogOut
  },
  {
    title: "Theme",
    url: "#",
    icon: () => <ThemeToggle />,
    customComponent: true
  }
];
/**
 * AppSidebar Component
 * 
 * Renders the main navigation sidebar of the application.
 * Features:
 * - Responsive design (mobile and desktop layouts)
 * - Main navigation menu with notification badges
 * - Support section with theme toggle and user actions
 * - Smooth animations and transitions
 */
export function AppSidebar() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  // Subscribe to sidebar state changes
  // Define custom event type
  interface SidebarToggleEvent extends CustomEvent {
    detail: {
      open: boolean;
    };
  }

  useEffect(() => {
    const handleSidebarToggle = (event: SidebarToggleEvent) => {
      setIsVisible(event.detail.open);
    };

    // Listen for sidebar toggle events
    window.addEventListener('sidebartoggle', handleSidebarToggle as EventListener);
    return () => window.removeEventListener('sidebartoggle', handleSidebarToggle as EventListener);
  }, []);

  return (
    <div className="relative">
      {/* Backdrop overlay */}
      {isVisible && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20"
          onClick={() => setIsVisible(false)}
        />
      )}

      <Sidebar
        className={cn(
          // Base styles
          "border-r h-[calc(100vh-4rem)]",
          "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
          "flex flex-col w-[280px]",

          // Positioning and z-index
          "fixed top-16 z-30",

          // Mobile styles - slide from right
          "right-0 md:right-auto md:left-0",
          "translate-x-full md:translate-x-[-100%]",

          // Visibility states
          "data-[state=open]:translate-x-0",
          isVisible && "md:translate-x-0",

          // Transitions and effects
          "transition-all duration-300 ease-in-out",
          "opacity-0 data-[state=open]:opacity-100",
          isVisible && "md:opacity-100",

          // Shadow and depth
          "shadow-lg",

          // Group styling for hover effects
          "group"
        )}>
      )}>
        {/* Branded header - visible only on mobile */}
        {/* Logo and name - only visible on mobile */}
        <div className="md:hidden h-16 flex items-center px-4 border-b">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">TrustWork</span>
          </div>
        </div>
        {/* Toggle button for large screens */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "p-2 rounded-lg hover:bg-accent",
            "transition-colors duration-200",
            "hidden 2xl:flex items-center justify-center",
            "absolute -right-4 top-4", // Moved up since we removed the header space
            "bg-background shadow-md border",
            "z-50"
          )}
        >
          {isExpanded ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
        <SidebarContent className={cn(
          "flex-1 overflow-y-auto",
          "scrollbar-thin scrollbar-thumb-accent scrollbar-track-transparent" // Subtle scrollbar
        )}>
          <SidebarGroup className="pt-2">
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1.5 px-3">
                {mainItems.map(item => (
                  <NavigationItem
                    key={item.title}
                    icon={item.icon}
                    title={item.title}
                    to={item.url}
                    badge={item.badge}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup className="mt-6">
            <SidebarGroupLabel className={cn(
              "px-4 mb-2 text-xs uppercase tracking-wider text-muted-foreground/70",
              "2xl:opacity-0 2xl:group-hover:opacity-100 transition-opacity duration-300" // Hide on large screens unless expanded
            )}>
              Support
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1.5 px-3">
                {bottomItems.map(item => (
                  <NavigationItem
                    key={item.title}
                    icon={item.icon}
                    title={item.title}
                    to={item.url}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      );
}