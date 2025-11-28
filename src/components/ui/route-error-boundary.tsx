import { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
    children: ReactNode;
    fallbackRoute?: string;
}

interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
}

/**
 * RouteErrorBoundary - A lighter error boundary for individual routes
 * Unlike the main ErrorBoundary, this allows users to navigate away
 * without reloading the entire app
 */
export class RouteErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Route error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="container mx-auto p-6 max-w-2xl">
                    <Card className="border-destructive/50">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-destructive/10">
                                    <AlertTriangle className="h-6 w-6 text-destructive" />
                                </div>
                                <CardTitle>Page Error</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground">
                                This page encountered an error and couldn't be displayed.
                            </p>

                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <div className="p-4 bg-muted rounded-md">
                                    <p className="text-sm font-mono text-destructive">
                                        {this.state.error.toString()}
                                    </p>
                                    {this.state.errorInfo && (
                                        <pre className="text-xs mt-2 overflow-x-auto">
                                            {this.state.errorInfo.componentStack}
                                        </pre>
                                    )}
                                </div>
                            )}

                            <div className="flex flex-wrap gap-3">
                                <Button
                                    onClick={this.handleReset}
                                    variant="default"
                                >
                                    Try Again
                                </Button>
                                <Button
                                    onClick={() => window.history.back()}
                                    variant="outline"
                                >
                                    Go Back
                                </Button>
                                <Button
                                    onClick={() => window.location.href = this.props.fallbackRoute || '/dashboard/job-seeker'}
                                    variant="outline"
                                >
                                    Go to Dashboard
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}
