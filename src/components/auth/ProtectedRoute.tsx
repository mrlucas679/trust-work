
import { Outlet } from 'react-router-dom'
import { RouteErrorBoundary } from '@/components/ui/route-error-boundary'

export function ProtectedRoute() {
	// Bypass authentication: always render protected routes
	// Wrap with error boundary to catch errors in protected routes
	return (
		<RouteErrorBoundary>
			<Outlet />
		</RouteErrorBoundary>
	)
}

export default ProtectedRoute
