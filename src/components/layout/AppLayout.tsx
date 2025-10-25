import { ReactNode } from "react";
import { DashboardLayout } from "./DashboardLayout";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: ReactNode;
  showNavigation?: boolean;
}

export const AppLayout = ({ children, showNavigation = true }: AppLayoutProps) => {
  if (!showNavigation) {
    return (
      <div className="min-h-screen bg-background">
        <main>{children}</main>
      </div>
    );
  }

  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
};