import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { supabase, isDemoMode } from '@/lib/supabase'
import { demoAdmin, demoCustomer } from '@/lib/demo-data'
import type { UserProfile } from '@/types'

interface AuthContextValue {
  user: UserProfile | null
  loading: boolean
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string, displayName: string) => Promise<{ error?: string; needsConfirm?: boolean }>
  signOut: () => Promise<void>
  demoSignIn: (as: 'admin' | 'customer') => void
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const DEMO_SESSION_KEY = 'eg_demo_session'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async (id: string) => {
    if (!supabase) return null
    const { data, error } = await supabase.from('users').select('*').eq('id', id).single()
    if (error) return null
    return data as UserProfile
  }, [])

  useEffect(() => {
    if (isDemoMode || !supabase) {
      const raw = localStorage.getItem(DEMO_SESSION_KEY)
      if (raw === 'admin') setUser(demoAdmin)
      else if (raw === 'customer') setUser(demoCustomer)
      setLoading(false)
      return
    }
    let mounted = true
    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return
      if (data.session?.user) {
        const profile = await loadProfile(data.session.user.id)
        if (mounted) setUser(profile)
      }
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return
      if (session?.user) {
        const profile = await loadProfile(session.user.id)
        setUser(profile)
      } else {
        setUser(null)
      }
    })
    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [loadProfile])

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) return { error: 'not-configured' }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message }
  }, [])

  const signUp = useCallback(async (email: string, password: string, displayName: string) => {
    if (!supabase) return { error: 'not-configured' }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    })
    if (error) return { error: error.message }
    return { needsConfirm: !data.session }
  }, [])

  const signOut = useCallback(async () => {
    if (isDemoMode || !supabase) {
      localStorage.removeItem(DEMO_SESSION_KEY)
      setUser(null)
      return
    }
    await supabase.auth.signOut()
    setUser(null)
  }, [])

  const demoSignIn = useCallback((as: 'admin' | 'customer') => {
    localStorage.setItem(DEMO_SESSION_KEY, as)
    setUser(as === 'admin' ? demoAdmin : demoCustomer)
    toast.success(`Signed in as demo ${as}`)
  }, [])

  const refreshProfile = useCallback(async () => {
    if (user && !isDemoMode) {
      const profile = await loadProfile(user.id)
      if (profile) setUser(profile)
    }
  }, [user, loadProfile])

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, isAdmin: user?.role === 'admin', signIn, signUp, signOut, demoSignIn, refreshProfile }),
    [user, loading, signIn, signUp, signOut, demoSignIn, refreshProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
