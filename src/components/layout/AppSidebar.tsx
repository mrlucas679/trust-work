import { Briefcase, Home, Users, FileText, MessageSquare, Settings, HelpCircle, Shield, LogOut } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter } from "@/components/ui/sidebar";
import { UserProfileSection } from "./sidebar/UserProfileSection";
import { NavigationItem } from "./sidebar/NavigationItem";
import { ThemeToggle } from "./sidebar/ThemeToggle";
import { mockJobSeeker } from "@/data/mockData";
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
}];
const bottomItems = [{
  title: "Safety Center",
  url: "/safety",
  icon: Shield
}, {
  title: "Settings",
  url: "/settings",
  icon: Settings
}, {
  title: "Help",
  url: "/help",
  icon: HelpCircle
}];
export function AppSidebar() {
  const navigate = useNavigate();
  return (
    <Sidebar className="border-r h-[calc(100vh-4rem)] z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex flex-col transition-transform duration-300 ease-in-out">
      <UserProfileSection
        name={mockJobSeeker.name}
        rating={mockJobSeeker.rating}
        completedJobs={mockJobSeeker.completedJobs}
        avatar={mockJobSeeker.avatar}
        verified={mockJobSeeker.verified}
        professionalStatus="Available for Work"
      />

      <SidebarContent className="flex-1 overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-2">
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

        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-xs uppercase tracking-wider text-muted-foreground/70">
            Support
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-2">
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

      <SidebarFooter>
        <div className="p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between">
            <ThemeToggle />
            <SidebarMenuButton
              onClick={() => navigate('/auth')}
              icon={LogOut}
              variant="ghost"
              className="text-destructive hover:text-destructive/90 transition-colors"
            >
              Log Out
            </SidebarMenuButton>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}