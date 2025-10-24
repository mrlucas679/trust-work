import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export const FadeIn = ({ children, delay = 0, duration = 300, className }: FadeInProps) => {
  return (
    <div
      className={cn("animate-fade-in", className)}
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: `${duration}ms`
      }}
    >
      {children}
    </div>
  );
};

interface ScaleInProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export const ScaleIn = ({ children, delay = 0, className }: ScaleInProps) => {
  return (
    <div
      className={cn("animate-scale-in", className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

interface SlideInProps {
  children: ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down';
  delay?: number;
  className?: string;
}

export const SlideIn = ({ children, direction = 'up', delay = 0, className }: SlideInProps) => {
  const getAnimationClass = () => {
    switch (direction) {
      case 'right': return 'animate-slide-in-right';
      case 'left': return 'animate-slide-in-left';
      case 'up': return 'animate-fade-in'; // Using fade-in as slide-up equivalent
      case 'down': return 'animate-fade-in';
      default: return 'animate-fade-in';
    }
  };

  return (
    <div
      className={cn(getAnimationClass(), className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

interface StaggeredChildrenProps {
  children: ReactNode[];
  staggerDelay?: number;
  className?: string;
}

export const StaggeredChildren = ({ children, staggerDelay = 100, className }: StaggeredChildrenProps) => {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <FadeIn key={index} delay={index * staggerDelay}>
          {child}
        </FadeIn>
      ))}
    </div>
  );
};