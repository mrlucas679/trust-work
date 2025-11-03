/**
 * @fileoverview Error Boundary specifically for sidebar components
 * Prevents sidebar errors from crashing the entire application
 * Provides graceful fallback UI when sidebar fails to render
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * SidebarErrorBoundary
 * 
 * Error boundary component that catches JavaScript errors anywhere in the sidebar
 * component tree, logs those errors, and displays a fallback UI.
 * 
 * Features:
 * - Catches rendering errors in sidebar components
 * - Displays user-friendly error message
 * - Provides retry mechanism
 * - Logs errors for debugging
 * - Does not crash the entire application
 * 
 * @example
 * ```tsx
 * <SidebarErrorBoundary>
 *   <AppSidebar />
 * </SidebarErrorBoundary>
 * ```
 */
export class SidebarErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details for debugging
    console.error('Sidebar Error Boundary caught an error:', error, errorInfo);

    // Update state with error info
    this.setState({
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: logErrorToService(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback provided by parent
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div
          className={cn(
            'flex flex-col items-center justify-center',
            'w-full h-full p-6 bg-sidebar text-sidebar-foreground',
            'border-r border-sidebar-border'
          )}
          role="alert"
          aria-live="assertive"
        >
          <div className="flex flex-col items-center max-w-sm text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive" aria-hidden="true" />
            
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Navigation Error</h2>
              <p className="text-sm text-muted-foreground">
                The navigation sidebar encountered an error. You can try refreshing or continue using the rest of the application.
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="w-full text-left">
                <summary className="text-xs cursor-pointer hover:underline text-muted-foreground">
                  Error Details (Development Only)
                </summary>
                <pre className="mt-2 p-3 text-xs bg-muted rounded overflow-auto max-h-40">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <Button
              onClick={this.handleReset}
              variant="outline"
              size="sm"
              className="mt-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
