import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Zap, KeyRound, CheckCircle2, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ResetPasswordPage() {
  const { t } = useTranslation()
  const { updatePassword, user, loading: authLoading, isPasswordRecovery, clearPasswordRecovery } = useAuth()
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [success, setSuccess] = useState(false)
  const [hasValidSession, setHasValidSession] = useState<boolean | null>(null)

  useEffect(() => {
    let active = true

    async function checkSession() {
      // If AuthContext already has a user or isPasswordRecovery flag
      if (user || isPasswordRecovery) {
        if (active) setHasValidSession(true)
        return
      }

      // Check current session or URL parameters directly
      const { data } = await supabase.auth.getSession()
      const hasUrlParams =
        window.location.hash.includes('access_token=') ||
        window.location.hash.includes('type=recovery') ||
        window.location.search.includes('code=')

      if (active) {
        setHasValidSession(!!data.session || hasUrlParams)
      }
    }

    if (!authLoading) {
      checkSession()
    }

    return () => {
      active = false
    }
  }, [user, authLoading, isPasswordRecovery])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) {
      toast.error(t('auth.passwordMinLength'))
      return
    }
    if (password !== confirmPassword) {
      toast.error(t('auth.passwordsDoNotMatch'))
      return
    }

    setBusy(true)
    const { error } = await updatePassword(password)
    setBusy(false)

    if (error) {
      toast.error(error)
    } else {
      clearPasswordRecovery()
      toast.success(t('auth.passwordUpdated'))
      setSuccess(true)
    }
  }

  const isChecking = authLoading || hasValidSession === null

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
      <div className="mb-8 flex items-center justify-center gap-1.5 font-display text-2xl font-bold">
        <Zap className="h-6 w-6 text-volt" strokeWidth={2.5} />
        ELECTRO<span className="text-volt">GEGA</span>
      </div>

      <div className="rounded-md border border-border bg-card p-6 shadow-sm">
        {isChecking ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-volt" />
            <p className="text-sm">{t('common.loading')}</p>
          </div>
        ) : !hasValidSession ? (
          <div className="text-center py-4 space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h2 className="font-display text-xl font-bold">{t('auth.invalidResetLinkTitle')}</h2>
            <p className="text-sm text-muted-foreground">
              {t('auth.invalidResetLinkSub')}
            </p>
            <Button
              onClick={() => navigate('/auth')}
              className="mt-4 w-full bg-volt font-bold text-volt-fg hover:bg-volt-dim"
            >
              {t('auth.requestNewLink')}
            </Button>
            <div className="pt-2">
              <Link
                to="/auth"
                className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="mr-1 h-3 w-3" />
                {t('auth.backToSignIn')}
              </Link>
            </div>
          </div>
        ) : success ? (
          <div className="text-center py-4 space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-volt/10 text-volt">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h2 className="font-display text-xl font-bold">{t('auth.passwordUpdated')}</h2>
            <p className="text-sm text-muted-foreground">
              {t('auth.resetPasswordSub')}
            </p>
            <Button
              onClick={() => navigate(user ? '/profile' : '/auth')}
              className="mt-4 w-full bg-volt font-bold text-volt-fg hover:bg-volt-dim"
            >
              {user ? t('nav.account') : t('auth.signIn')}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-volt" />
              <h2 className="font-display text-xl font-bold">{t('auth.resetPasswordTitle')}</h2>
            </div>
            <p className="text-sm text-muted-foreground">{t('auth.resetPasswordSub')}</p>

            <div>
              <Label htmlFor="new-password">{t('auth.newPassword')}</Label>
              <Input
                id="new-password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 bg-secondary"
              />
            </div>

            <div>
              <Label htmlFor="confirm-password">{t('auth.confirmPassword')}</Label>
              <Input
                id="confirm-password"
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1.5 bg-secondary"
              />
            </div>

            <Button
              type="submit"
              disabled={busy}
              className="w-full bg-volt font-bold text-volt-fg hover:bg-volt-dim"
            >
              {busy ? t('common.loading') : t('auth.updatePassword')}
            </Button>

            <div className="pt-2 text-center">
              <Link
                to="/auth"
                className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="mr-1 h-3 w-3" />
                {t('auth.backToSignIn')}
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
