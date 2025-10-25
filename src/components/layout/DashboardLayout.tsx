import { ReactNode, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
    Menu,
    X,
    Shield,
    Home,
    Briefcase,
    Settings,
    HelpCircle,
    MessageSquare,
    FileText,
    ClipboardList,
    LogOut,
    Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate, useLocation } from "react-router-dom";
import { ThemeToggle } from "./sidebar/ThemeToggle";

interface DashboardLayoutProps {
    children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Close sidebar when route changes
    useEffect(() => {
        setSidebarOpen(false);
    }, [navigate]);

    return (
        <div className="min-h-screen bg-background">
            {/* Top Navigation */}
            <header className="fixed top-0 left-0 right-0 h-16 bg-background/95 backdrop-blur border-b z-50">
                <div className="h-full px-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                        >
                            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </Button>
                        <div className="flex items-center gap-2">
                            <Shield className="h-8 w-8 text-primary" />
                            <span className="text-xl font-semibold">TrustWork</span>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="hidden md:block max-w-md flex-1 mx-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search..."
                                className="pl-9 w-full"
                            />
                        </div>
                    </div>

                    {/* User Profile */}
                    <div className="flex items-center gap-4">
                        <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium">
                            JD
                        </div>
                    </div>
                </div>
            </header>

            {/* Sidebar Backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    // Base styles
                    "fixed top-16 h-[calc(100vh-4rem)] w-64 bg-background border-r",
                    "flex flex-col overflow-y-auto",
                    // Mobile positioning
                    "left-0 z-40",
                    // Transform
                    "transform transition-transform duration-300 ease-in-out",
                    // Mobile visibility
                    !sidebarOpen && "-translate-x-full",
                    // Desktop visibility
                    "md:translate-x-0"
                )}
            >
                <nav className="flex-1 px-4 py-4 min-h-0">
                    {/* Main Navigation */}
                    <div className="space-y-1">
                        {[
                            { icon: Home, label: "My Space", path: "/dashboard/job-seeker", badge: null },
                            { icon: Briefcase, label: "Jobs", path: "/jobs", badge: "12" },
                            { icon: FileText, label: "Gigs", path: "/gigs", badge: "5" },
                            { icon: Briefcase, label: "Applications", path: "/applications", badge: "3" },
                            { icon: MessageSquare, label: "Messages", path: "/messages", badge: "2" },
                            { icon: ClipboardList, label: "Assignments", path: "/assignments", badge: "0" },
                        ].map(({ icon: Icon, label, path, badge }) => {
                            const isActive = location.pathname === path;

                            return (
                                <Button
                                    key={path}
                                    variant="ghost"
                                    className={cn(
                                        "w-full flex items-center justify-between text-left h-10",
                                        "hover:bg-accent hover:text-accent-foreground",
                                        isActive && "bg-accent text-accent-foreground"
                                    )}
                                    onClick={() => navigate(path)}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon className="h-5 w-5 shrink-0" />
                                        <span className="text-sm">{label}</span>
                                    </div>
                                    {badge && (
                                        <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary shrink-0">
                                            {badge}
                                        </span>
                                    )}
                                </Button>
                            );
                        })}
                    </div>

                    {/* Support Section */}
                    <div className="mt-4 pt-4 border-t space-y-1">
                        <div className="px-3 mb-2 text-xs uppercase tracking-wider text-muted-foreground/70 font-medium">
                            Support
                        </div>
                        {[
                            { icon: Shield, label: "Safety Center", path: "/safety" },
                            { icon: Settings, label: "Settings", path: "/settings" },
                            { icon: HelpCircle, label: "Help", path: "/help" },
                            { icon: LogOut, label: "Log Out", path: "/auth" },
                        ].map(({ icon: Icon, label, path }) => {
                            const isActive = location.pathname === path;

                            return (
                                <Button
                                    key={path}
                                    variant="ghost"
                                    className={cn(
                                        "w-full flex items-center justify-between text-left h-10",
                                        "hover:bg-accent hover:text-accent-foreground",
                                        isActive && "bg-accent text-accent-foreground"
                                    )}
                                    onClick={() => navigate(path)}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon className="h-5 w-5 shrink-0" />
                                        <span className="text-sm">{label}</span>
                                    </div>
                                </Button>
                            );
                        })}

                        {/* Theme Toggle */}
                        <div className="px-3 py-2">
                            <ThemeToggle />
                        </div>
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <main className={cn(
                "min-h-[calc(100vh-4rem)]",
                "pt-16",  // Space for fixed header
                "transition-[margin] duration-300 ease-in-out",
                "md:ml-64" // Space for sidebar on desktop
            )}>
                <div className="px-4 py-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
