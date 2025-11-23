
import { Navigate, Outlet } from 'react-router-dom'
import { RouteErrorBoundary } from '@/components/ui/route-error-boundary'
import { useSupabase } from "@/providers/SupabaseProvider";
import { Card, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";

/**
 * Protected Route Component
 * Wraps private routes with authentication check
 * Redirects to /auth if not authenticated
 */
export function ProtectedRoute() {
	const { session, loading } = useSupabase();

	// Show loading state while checking authentication
	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/20">
				<Card className="w-full max-w-md">
					<CardContent className="flex flex-col items-center justify-center py-12">
						<Shield className="h-12 w-12 text-primary mb-4 animate-pulse" />
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
						<p className="text-sm text-muted-foreground mt-4">Verifying authentication...</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	// Redirect to auth if not authenticated
	if (!session) {
		return <Navigate to="/auth" replace />;
	}

	// Render protected content
	return (
		<RouteErrorBoundary>
			<Outlet />
		</RouteErrorBoundary>
	)
}

export default ProtectedRoute
