import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import supabase from '@/lib/supabaseClient'

type SupabaseContextValue = {
	supabase: typeof supabase
	session: Session | null
	user: User | null
	loading: boolean
}

const SupabaseContext = createContext<SupabaseContextValue | undefined>(undefined)

export function SupabaseProvider({ children }: { children: ReactNode }) {
	const [session, setSession] = useState<Session | null>(null)
	const [user, setUser] = useState<User | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		let mounted = true

		async function init() {
			try {
				const { data } = await supabase.auth.getSession()
				if (!mounted) return
				setSession(data.session)
				setUser(data.session?.user ?? null)
			} finally {
				if (mounted) setLoading(false)
			}
		}
		init()

		const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
			setSession(newSession)
			setUser(newSession?.user ?? null)
		})

		return () => {
			mounted = false
			sub.subscription.unsubscribe()
		}
	}, [])

	const value = useMemo(() => ({ supabase, session, user, loading }), [session, user, loading])

	return (
		<SupabaseContext.Provider value={value}>{children}</SupabaseContext.Provider>
	)
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSupabase() {
	const ctx = useContext(SupabaseContext)
	if (!ctx) throw new Error('useSupabase must be used within SupabaseProvider')
	return ctx
}
