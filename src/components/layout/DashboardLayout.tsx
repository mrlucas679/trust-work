import { ReactNode, useState, useEffect } from "react";
import { TopNavigation } from "./TopNavigation";
import { AppSidebar } from "./AppSidebar";
import { SidebarInset, SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
    children: ReactNode;
}

function DashboardLayoutContent({ children }: DashboardLayoutProps) {
    const { openMobile, setOpenMobile, isMobile } = useSidebar();

    const toggleSidebar = () => {
        setOpenMobile(!openMobile);
    };

    const closeSidebar = () => {
        setOpenMobile(false);
    };

    // Prevent body scroll when sidebar is open on mobile
    useEffect(() => {
        if (isMobile && openMobile) {
            // Calculate scrollbar width to prevent layout shift
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
            document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
            document.body.classList.add('sidebar-open');
        } else {
            document.body.classList.remove('sidebar-open');
            document.documentElement.style.removeProperty('--scrollbar-width');
        }
        return () => {
            document.body.classList.remove('sidebar-open');
            document.documentElement.style.removeProperty('--scrollbar-width');
        };
    }, [isMobile, openMobile]);

    return (
        <>
            {/* Fixed Top Navigation - always at very top */}
            <TopNavigation onMenuClick={toggleSidebar} />

            {/* Accessibility: Skip to main content */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:top-20 focus:left-4 bg-primary text-primary-foreground rounded px-3 py-2 shadow"
                style={{ zIndex: 'var(--z-skip-link)' }}
            >
                Skip to content
            </a>

            {/* Mobile Overlay - positioned below navbar */}
            {isMobile && openMobile && (
                <div
                    className="fixed inset-0 bg-black/50 top-16 transition-opacity duration-300"
                    style={{ zIndex: 'var(--z-overlay)' }}
                    onClick={closeSidebar}
                    aria-hidden="true"
                />
            )}

            {/* Smooth Sliding Sidebar - positioned below navbar */}
            <AppSidebar />

            {/* Main Content Area - ONLY scroll container */}
            {/* Positioned below navbar, takes remaining height, scrolls independently */}
            <SidebarInset
                className={cn(
                    // Fixed position below navbar
                    "fixed top-16 left-0 right-0 bottom-0",
                    // Enable vertical scroll, hide horizontal overflow
                    "overflow-y-auto overflow-x-hidden",
                    // Smooth transitions when sidebar opens/closes
                    "transition-all duration-300",
                    // Background
                    "bg-background"
                )}
                id="main-content"
                onClick={openMobile && isMobile ? closeSidebar : undefined}
            >
                <div className="container mx-auto p-6">
                    {children}
                </div>
            </SidebarInset>
        </>
    );
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <SidebarProvider defaultOpen={true}>
            <DashboardLayoutContent>{children}</DashboardLayoutContent>
        </SidebarProvider>
    );
}
