import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSupabase } from '@/providers/SupabaseProvider'

export default function ProtectedRoute() {
	const { session, loading } = useSupabase()
	const location = useLocation()

	if (loading) {
		// Keep it minimal; you can replace with a fancy spinner
		return <div className="p-6 text-sm text-muted-foreground">Checking session…</div>
	}

	if (!session) {
		return <Navigate to="/auth" replace state={{ from: location }} />
	}

	return <Outlet />
}
