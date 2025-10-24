import { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-[400px] flex flex-col items-center justify-center p-4">
                    <Shield className="h-12 w-12 text-primary mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
                    <p className="text-muted-foreground mb-4 text-center max-w-md">
                        We apologize for the inconvenience. Please try refreshing the page or contact support if the problem persists.
                    </p>
                    <div className="flex gap-4">
                        <Button
                            variant="outline"
                            onClick={() => window.location.reload()}
                        >
                            Refresh Page
                        </Button>
                        <Button
                            onClick={() => window.location.href = '/help'}
                        >
                            Contact Support
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
