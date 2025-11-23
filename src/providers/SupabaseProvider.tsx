import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import supabase from '@/lib/supabaseClient'

type UserRole = 'employer' | 'job_seeker' | null

type UserProfile = {
	id: string
	role: 'employer' | 'job_seeker'
	display_name: string | null
}

type SupabaseContextValue = {
	supabase: typeof supabase
	session: Session | null
	user: User | null
	loading: boolean
	profile: UserProfile | null
	role: UserRole
	isEmployer: boolean
	isJobSeeker: boolean
}

const SupabaseContext = createContext<SupabaseContextValue | undefined>(undefined)

export function SupabaseProvider({ children }: { children: ReactNode }) {
	const [session, setSession] = useState<Session | null>(null)
	const [user, setUser] = useState<User | null>(null)
	const [profile, setProfile] = useState<UserProfile | null>(null)
	const [loading, setLoading] = useState(true)

	// Fetch user profile when user changes
	useEffect(() => {
		async function fetchProfile(userId: string) {
			try {
				const { data, error } = await supabase
					.from('profiles')
					.select('id, role, display_name')
					.eq('id', userId)
					.single()

				if (error) {
					console.error('Failed to fetch user profile:', error)
					setProfile(null)
					return
				}

				setProfile(data)
			} catch (error) {
				console.error('Error fetching profile:', error)
				setProfile(null)
			}
		}

		if (user?.id) {
			fetchProfile(user.id)
		} else {
			setProfile(null)
		}
	}, [user?.id])

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

	const value = useMemo(() => ({
		supabase,
		session,
		user,
		loading,
		profile,
		role: profile?.role ?? null,
		isEmployer: profile?.role === 'employer',
		isJobSeeker: profile?.role === 'job_seeker'
	}), [session, user, loading, profile])

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
