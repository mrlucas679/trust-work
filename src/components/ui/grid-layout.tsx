import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GridLayoutProps {
  children: ReactNode;
  columns?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
  gap?: number;
  className?: string;
}

export const GridLayout = ({
  children,
  columns = { default: 1, md: 2, lg: 3 },
  gap = 6,
  className
}: GridLayoutProps) => {
  const getGridClasses = () => {
    const classes = ['grid'];
    
    if (columns.default) classes.push(`grid-cols-${columns.default}`);
    if (columns.sm) classes.push(`sm:grid-cols-${columns.sm}`);
    if (columns.md) classes.push(`md:grid-cols-${columns.md}`);
    if (columns.lg) classes.push(`lg:grid-cols-${columns.lg}`);
    if (columns.xl) classes.push(`xl:grid-cols-${columns.xl}`);
    if (columns['2xl']) classes.push(`2xl:grid-cols-${columns['2xl']}`);
    
    classes.push(`gap-${gap}`);
    
    return classes.join(' ');
  };

  return (
    <div className={cn(getGridClasses(), className)}>
      {children}
    </div>
  );
};

interface FlexLayoutProps {
  children: ReactNode;
  direction?: 'row' | 'col';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  gap?: number;
  wrap?: boolean;
  className?: string;
}

export const FlexLayout = ({
  children,
  direction = 'row',
  align = 'start',
  justify = 'start',
  gap = 4,
  wrap = false,
  className
}: FlexLayoutProps) => {
  const classes = [
    'flex',
    `flex-${direction}`,
    `items-${align}`,
    `justify-${justify}`,
    `gap-${gap}`,
    wrap && 'flex-wrap'
  ].filter(Boolean);

  return (
    <div className={cn(classes.join(' '), className)}>
      {children}
    </div>
  );
};

interface SectionLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  headerAction?: ReactNode;
  className?: string;
  contentClassName?: string;
}

export const SectionLayout = ({
  children,
  title,
  subtitle,
  headerAction,
  className,
  contentClassName
}: SectionLayoutProps) => {
  return (
    <section className={cn("space-y-6", className)}>
      {(title || subtitle || headerAction) && (
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            {title && (
              <h2 className="text-2xl font-semibold tracking-tight">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>
          {headerAction}
        </div>
      )}
      <div className={contentClassName}>
        {children}
      </div>
    </section>
  );
};

export default GridLayout;