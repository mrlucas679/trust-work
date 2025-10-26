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
  User
} from "lucide-react";
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
 */
interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AppSidebar({ isOpen, onClose }: AppSidebarProps) {
  return (
    <div className="relative">
      <Sidebar
        className={cn(
          // Base styles
          "border-r h-[calc(100vh-4rem)]",
          "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
          "flex flex-col w-[280px]",

          // Positioning and z-index
          "fixed left-0 top-16 z-30",

          // Smooth slide animation
          "transition-transform duration-300 ease-in-out",

          // Transform based on isOpen state
          isOpen ? "translate-x-0" : "translate-x-[-100%]",

          // Shadow and depth
          "shadow-lg",

          // Group styling for hover effects
          "group"
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
                    onClick={onClose}
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
                    onClick={onClose}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </div>
  );
}