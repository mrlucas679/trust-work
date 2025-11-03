/**
 * Icons used throughout the sidebar
 */
import * as React from "react";
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
  User
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  useSidebar
} from "@/components/ui/sidebar";
import { NavigationItem } from "./sidebar/NavigationItem";
import { ThemeToggle } from "./sidebar/ThemeToggle";
import { cn } from "@/lib/utils";

/**
 * Type definition for navigation items
 * Ensures type safety and prevents runtime errors
 */
interface NavigationItemType {
  title: string;
  url: string;
  icon: React.ElementType;
  badge?: string;
  customComponent?: boolean;
}

/**
 * Primary navigation items for the main menu
 * Each item must have title, url, and icon properties
 */
const mainItems: NavigationItemType[] = [{
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
const bottomItems: NavigationItemType[] = [
  {
    title: "Profile",
    url: "/profile",
    icon: User
  },
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
 * - Error resilient with defensive checks
 * - Accessibility compliant
 * 
 * Uses the useSidebar hook for all state management to avoid synchronization issues.
 * 
 * @throws {Error} When useSidebar context is not available - should be wrapped in SidebarProvider
 */
export function AppSidebar() {
  // Must call hooks unconditionally at the top level
  const { setOpenMobile } = useSidebar();

  // Close sidebar on navigation (mobile only)
  // Memoized to prevent unnecessary re-renders
  const handleNavigationClick = React.useCallback(() => {
    try {
      setOpenMobile(false);
    } catch (error) {
      console.error('AppSidebar: Error closing sidebar', error);
    }
  }, [setOpenMobile]);

  return (
    <Sidebar
      collapsible="offcanvas"
      className="sidebar-with-navbar"
      aria-label="Main navigation sidebar"
    >
      {/* Branded header - visible only on mobile */}
      {/* Logo and name - only visible on mobile */}
      <div className="md:hidden h-16 flex items-center px-4 border-b" role="banner">
        <div className="flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" aria-hidden="true" />
          <span className="text-xl font-bold">TrustWork</span>
        </div>
      </div>

      <SidebarContent className={cn(
        "flex-1 overflow-y-auto"
        // Chrome's native scrollbar used - removed custom scrollbar styling
      )}>
        <SidebarGroup className="pt-2">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1.5 px-3" role="navigation" aria-label="Primary navigation">
              {/* Defensive: Filter out invalid items to handle potential runtime issues
                  While items are static, this protects against future refactoring or
                  dynamic item loading scenarios */}
              {mainItems
                .filter(item => item && item.title && item.url && item.icon)
                .map(item => {
                  // Defensive: Try-catch per item ensures one bad item doesn't break all navigation
                  // Provides isolation beyond error boundary for better user experience
                  try {
                    return (
                      <NavigationItem
                        key={item.title}
                        icon={item.icon}
                        title={item.title}
                        to={item.url}
                        badge={item.badge}
                        onClick={handleNavigationClick}
                      />
                    );
                  } catch (error) {
                    console.error(`AppSidebar: Error rendering navigation item "${item.title}"`, error);
                    return null;
                  }
                })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className={cn(
            "px-4 mb-2 text-xs uppercase tracking-wider text-muted-foreground/70"
          )} role="heading" aria-level={2}>
            Support
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1.5 px-3" role="navigation" aria-label="Support navigation">
              {/* Defensive: Filter out invalid items to handle potential runtime issues
                  While items are static, this protects against future refactoring or
                  dynamic item loading scenarios */}
              {bottomItems
                .filter(item => item && item.title && item.url && item.icon)
                .map(item => {
                  // Defensive: Try-catch per item ensures one bad item doesn't break all navigation
                  // Provides isolation beyond error boundary for better user experience
                  try {
                    return (
                      <NavigationItem
                        key={item.title}
                        icon={item.icon}
                        title={item.title}
                        to={item.url}
                        onClick={handleNavigationClick}
                      />
                    );
                  } catch (error) {
                    console.error(`AppSidebar: Error rendering navigation item "${item.title}"`, error);
                    return null;
                  }
                })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}