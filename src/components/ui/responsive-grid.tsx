import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface ResponsiveGridProps {
  children: ReactNode;
  columns?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number;
  className?: string;
}

export const ResponsiveGrid = ({
  children,
  columns = { default: 1, md: 2, lg: 3 },
  gap = 6,
  className
}: ResponsiveGridProps) => {
  const getGridClasses = () => {
    const classes = ['grid'];
    
    if (columns.default) classes.push(`grid-cols-${columns.default}`);
    if (columns.sm) classes.push(`sm:grid-cols-${columns.sm}`);
    if (columns.md) classes.push(`md:grid-cols-${columns.md}`);
    if (columns.lg) classes.push(`lg:grid-cols-${columns.lg}`);
    if (columns.xl) classes.push(`xl:grid-cols-${columns.xl}`);
    
    classes.push(`gap-${gap}`);
    
    return classes.join(' ');
  };

  return (
    <div className={cn(getGridClasses(), className)}>
      {children}
    </div>
  );
};

interface ResponsiveContainerProps {
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
  padding?: number;
  className?: string;
}

export const ResponsiveContainer = ({
  children,
  maxWidth = '6xl',
  padding = 6,
  className
}: ResponsiveContainerProps) => {
  return (
    <div className={cn(`max-w-${maxWidth}`, `mx-auto p-${padding}`, className)}>
      {children}
    </div>
  );
};

interface MobileFirstLayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
  header?: ReactNode;
  className?: string;
}

export const MobileFirstLayout = ({
  children,
  sidebar,
  header,
  className
}: MobileFirstLayoutProps) => {
  return (
    <div className={cn("min-h-screen flex flex-col", className)}>
      {header && (
        <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur">
          {header}
        </header>
      )}
      
      <div className="flex-1 flex">
        {sidebar && (
          <aside className="hidden lg:block w-64 border-r bg-muted/30">
            {sidebar}
          </aside>
        )}
        
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
};