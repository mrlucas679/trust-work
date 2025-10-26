import { ReactNode, useState, useEffect } from "react";
import { TopNavigation } from "./TopNavigation";
import { AppSidebar } from "./AppSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardLayoutProps {
    children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const isMobile = useIsMobile();

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const closeSidebar = () => {
        setSidebarOpen(false);
    };

    // Close sidebar on mobile when switching routes
    useEffect(() => {
        if (isMobile) {
            closeSidebar();
        }
    }, [isMobile]);

    // Prevent body scroll when sidebar is open on mobile
    useEffect(() => {
        if (isMobile && sidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMobile, sidebarOpen]);

    return (
        <SidebarProvider>
            {/* Offset for fixed top nav and prevent body scrolling */}
            <div className="min-h-screen bg-background pt-16 overflow-hidden">
                {/* Accessibility: Skip to main content */}
                <a
                    href="#main-content"
                    className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[9999] bg-primary text-primary-foreground rounded px-3 py-2 shadow"
                >
                    Skip to content
                </a>
                {/* Fixed Top Navigation with Integrated Search */}
                <TopNavigation onMenuClick={toggleSidebar} />

                {/* Mobile Overlay */}
                {isMobile && sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-20 top-16 transition-opacity duration-300"
                        onClick={closeSidebar}
                        aria-hidden="true"
                    />
                )}

                {/* Smooth Sliding Sidebar */}
                <AppSidebar
                    isOpen={sidebarOpen}
                    onClose={closeSidebar}
                />

                {/* Main Content Area - Scrollable with click-outside detection */}
                {/* Uses viewport height minus navbar (4rem) for consistent behavior across sizes */}
                <SidebarInset
                    className={cn(
                        "h-[calc(100vh-4rem)] overflow-y-auto",
                        // Prefer dynamic viewport height when supported to avoid mobile browser UI resize jumps
                        "supports-[height:100dvh]:h-[calc(100dvh-4rem)]",
                        "transition-all duration-300"
                    )}
                    id="main-content"
                    onClick={sidebarOpen ? closeSidebar : undefined}
                >
                    <div className="container mx-auto p-6">
                        {children}
                    </div>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
}
