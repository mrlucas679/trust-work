import { Briefcase, Home, Users, FileText, MessageSquare, Settings, HelpCircle, Shield, Moon, Sun, Laptop } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
const mainItems = [{
  title: "Dashboard",
  url: "/dashboard/job-seeker",
  icon: Home
}, {
  title: "Jobs",
  url: "/jobs",
  icon: Briefcase
}, {
  title: "Gigs",
  url: "/gigs",
  icon: FileText
}, {
  title: "Applications",
  url: "/applications",
  icon: Briefcase
}, {
  title: "Messages",
  url: "/messages",
  icon: MessageSquare
}, {
  title: "Profile",
  url: "/profile",
  icon: Users
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
  const {
    setTheme,
    theme
  } = useTheme();
  const getNavClass = ({
    isActive
  }: {
    isActive: boolean;
  }) => isActive ? "bg-muted text-primary font-medium" : "hover:bg-muted/50";
  return <Sidebar className="border-r">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map(item => <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClass}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Support</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {bottomItems.map(item => <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClass}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="p-4 border-t px-[6px]">
          <div className="flex items-center justify-between mb-3">
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {theme === "light" ? <Sun className="h-4 w-4" /> : theme === "dark" ? <Moon className="h-4 w-4" /> : <Laptop className="h-4 w-4" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  <Sun className="h-4 w-4 mr-2" />
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  <Moon className="h-4 w-4 mr-2" />
                  Dark
                </DropdownMenuItem>
                
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
        </div>
      </SidebarFooter>
    </Sidebar>;
}