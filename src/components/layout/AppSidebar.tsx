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
  User,
  Bell,
  BarChart3
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
  title: "Notifications",
  url: "/notifications",
  icon: Bell
}, {
  title: "Analytics",
  url: "/analytics",
  icon: BarChart3
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
 * 
 * Uses the useSidebar hook for all state management to avoid synchronization issues.
 */
export function AppSidebar({ isOpen = true, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  // Safely access useSidebar if available (tests mock sidebar without the hook)
  let setOpenMobile: (open: boolean) => void = () => { };
  try {
    const api = (useSidebar as unknown as (() => { setOpenMobile: (open: boolean) => void }) | undefined);
    if (typeof api === 'function') {
      const res = api();
      if (res && typeof res.setOpenMobile === 'function') {
        setOpenMobile = res.setOpenMobile;
      }
    }
  } catch {
    // noop fallback for test environment
  }

  // Close sidebar on navigation (mobile only)
  const handleNavigationClick = React.useCallback(() => {
    onClose?.();
    setOpenMobile(false);
  }, [onClose]);

  return (
    <Sidebar
      collapsible="offcanvas"
      className={cn(
        "fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] overflow-y-auto transition-transform duration-300 ease-in-out backdrop-blur bg-background/95 shadow-lg w-[280px] border-r",
        isOpen ? "translate-x-0" : "translate-x-[-100%]"
      )}
    >
      {/* Branded header - visible only on mobile */}
      {/* Logo and name - only visible on mobile */}
      <div className="md:hidden h-16 flex items-center px-4 border-b">
        <div className="flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold">TrustWork</span>
        </div>
      </div>

      <SidebarContent className={cn(
        "flex-1 overflow-y-auto"
        // Chrome's native scrollbar used - removed custom scrollbar styling
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
                  onClick={handleNavigationClick}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className={cn(
            "px-4 mb-2 text-xs uppercase tracking-wider text-muted-foreground/70"
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
                  onClick={handleNavigationClick}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}