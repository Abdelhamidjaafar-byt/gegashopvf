import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import type { Role, UserProfile } from '@/types'

interface AuthContextValue {
  user: UserProfile | null
  loading: boolean
  isAdmin: boolean
  isProductManager: boolean
  hasAdminAccess: boolean
  isPasswordRecovery: boolean
  clearPasswordRecovery: () => void
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string, displayName: string) => Promise<{ error?: string; needsConfirm?: boolean }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error?: string }>
  updatePassword: (newPassword: string) => Promise<{ error?: string }>
  resendConfirmation: (email: string) => Promise<{ error?: string }>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(() => {
    if (typeof window === 'undefined') return false
    const hash = window.location.hash
    const search = window.location.search
    return (
      hash.includes('type=recovery') ||
      (hash.includes('access_token=') && window.location.pathname.includes('reset-password')) ||
      (search.includes('code=') && window.location.pathname.includes('reset-password'))
    )
  })

  const loadProfile = useCallback(async (id: string, fallbackAuthUser?: any): Promise<UserProfile> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .maybeSingle()

      if (data && !error) {
        return data as UserProfile
      }
    } catch (err) {
      console.warn('Error fetching profile from users table:', err)
    }

    // If no row exists or error occurred, resolve from Supabase auth user
    let authUser = fallbackAuthUser
    if (!authUser) {
      try {
        const { data } = await supabase.auth.getUser()
        if (data.user?.id === id) {
          authUser = data.user
        }
      } catch {
        // ignore
      }
    }

    const email = authUser?.email || ''
    const displayName =
      authUser?.user_metadata?.display_name ||
      authUser?.user_metadata?.full_name ||
      (email ? email.split('@')[0] : 'User')
    const phone = authUser?.phone || authUser?.user_metadata?.phone || null
    const role: Role = (authUser?.app_metadata?.role || authUser?.user_metadata?.role || 'customer') as Role
    const createdAt = authUser?.created_at || new Date().toISOString()

    const fallbackProfile: UserProfile = {
      id,
      email,
      display_name: displayName,
      phone,
      role,
      created_at: createdAt,
    }

    // Try to auto-create missing row in public.users (self-healing)
    try {
      const { data: inserted } = await supabase
        .from('users')
        .upsert(
          {
            id,
            email,
            display_name: displayName,
            phone,
          },
          { onConflict: 'id' },
        )
        .select('*')
        .maybeSingle()

      if (inserted) {
        return inserted as UserProfile
      }
    } catch {
      // Ignore insert error if RLS restricts it
    }

    return fallbackProfile
  }, [])

  useEffect(() => {
    let mounted = true

    supabase.auth
      .getSession()
      .then(async ({ data }) => {
        if (!mounted) return
        if (data.session?.user) {
          const profile = await loadProfile(data.session.user.id, data.session.user)
          if (mounted) setUser(profile)
        } else {
          if (mounted) setUser(null)
        }
        if (mounted) setLoading(false)
      })
      .catch(() => {
        if (mounted) setLoading(false)
      })

    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return
      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true)
      } else if (event === 'SIGNED_OUT') {
        if (mounted) {
          setUser(null)
          setIsPasswordRecovery(false)
        }
      } else if (session?.user) {
        const profile = await loadProfile(session.user.id, session.user)
        if (mounted) setUser(profile)
      } else if (!session) {
        if (mounted) setUser(null)
      }
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [loadProfile])

  const clearPasswordRecovery = useCallback(() => {
    setIsPasswordRecovery(false)
  }, [])

  const signIn = useCallback(
    async (email: string, password: string) => {
      try {
        const cleanEmail = email.trim()
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        })
        if (error) {
          return { error: error.message }
        }
        if (data.user) {
          const profile = await loadProfile(data.user.id, data.user)
          setUser(profile)
        }
        return {}
      } catch (err: any) {
        return { error: err?.message || 'An unexpected error occurred during sign in.' }
      }
    },
    [loadProfile],
  )

  const signUp = useCallback(
    async (email: string, password: string, displayName: string) => {
      try {
        const cleanEmail = email.trim()
        const cleanName = displayName.trim()
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: { data: { display_name: cleanName } },
        })
        if (error) return { error: error.message }
        if (data.session?.user) {
          const profile = await loadProfile(data.session.user.id, data.session.user)
          setUser(profile)
        }
        return { needsConfirm: !data.session }
      } catch (err: any) {
        return { error: err?.message || 'An unexpected error occurred during sign up.' }
      }
    },
    [loadProfile],
  )

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setIsPasswordRecovery(false)
  }, [])

  const refreshProfile = useCallback(async () => {
    if (user) {
      const profile = await loadProfile(user.id)
      if (profile) setUser(profile)
    }
  }, [user, loadProfile])

  const resetPassword = useCallback(async (email: string) => {
    const cleanEmail = email.trim()
    const redirectUrl = `${window.location.origin}/reset-password`
    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: redirectUrl,
    })
    return { error: error?.message }
  }, [])

  const updatePassword = useCallback(async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (!error) {
      setIsPasswordRecovery(false)
    }
    return { error: error?.message }
  }, [])

  const resendConfirmation = useCallback(async (email: string) => {
    try {
      const cleanEmail = email.trim()
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: cleanEmail,
      })
      return { error: error?.message }
    } catch (err: any) {
      return { error: err?.message || 'Failed to resend confirmation email.' }
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAdmin: user?.role === 'admin',
      isProductManager: user?.role === 'product_manager',
      hasAdminAccess: user?.role === 'admin' || user?.role === 'product_manager',
      isPasswordRecovery,
      clearPasswordRecovery,
      signIn,
      signUp,
      signOut,
      refreshProfile,
      resetPassword,
      updatePassword,
      resendConfirmation,
    }),
    [user, loading, isPasswordRecovery, clearPasswordRecovery, signIn, signUp, signOut, refreshProfile, resetPassword, updatePassword, resendConfirmation],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
