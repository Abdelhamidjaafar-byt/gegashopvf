import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useLocation, Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Zap, ArrowLeft, KeyRound, Eye, EyeOff, AlertCircle, Loader2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function AuthPage() {
  const { t } = useTranslation()
  const { signIn, signUp, resetPassword, resendConfirmation, user, isPasswordRecovery, clearPasswordRecovery } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string })?.from || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showSignUpPassword, setShowSignUpPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [isForgot, setIsForgot] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [signInError, setSignInError] = useState<string | null>(null)
  const [signUpError, setSignUpError] = useState<string | null>(null)
  const [resending, setResending] = useState(false)
  const [resendSent, setResendSent] = useState(false)

  // If visiting /auth directly without recovery tokens in URL, clear stale recovery flag
  useEffect(() => {
    const hasRecoveryTokens =
      window.location.hash.includes('type=recovery') ||
      window.location.search.includes('type=recovery')
    if (!hasRecoveryTokens && isPasswordRecovery) {
      clearPasswordRecovery()
    }
  }, [isPasswordRecovery, clearPasswordRecovery])

  // Only redirect to reset-password if active recovery tokens are present
  const hasActiveRecoveryParam =
    window.location.hash.includes('type=recovery') ||
    window.location.search.includes('type=recovery')

  if (isPasswordRecovery && hasActiveRecoveryParam) {
    return <Navigate to="/reset-password" replace />
  }

  if (user) {
    return <Navigate to={from} replace />
  }

  const doSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setSignInError(null)
    setBusy(true)
    const cleanEmail = email.trim()
    const { error } = await signIn(cleanEmail, password)
    setBusy(false)
    if (error) {
      setSignInError(error)
      toast.error(error)
    } else {
      toast.success(t('auth.signInSuccess', 'Connexion réussie !'))
      navigate(from, { replace: true })
    }
  }

  const doSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setSignUpError(null)
    setBusy(true)
    const cleanEmail = email.trim()
    const cleanName = name.trim()
    const { error, needsConfirm } = await signUp(cleanEmail, password, cleanName)
    setBusy(false)
    if (error) {
      setSignUpError(error)
      toast.error(error)
    } else if (needsConfirm) {
      toast.success(t('auth.checkInbox'))
    } else {
      toast.success(t('auth.signUpSuccess', 'Compte créé avec succès !'))
      navigate(from, { replace: true })
    }
  }

  const doResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setBusy(true)
    const cleanEmail = email.trim()
    const { error } = await resetPassword(cleanEmail)
    setBusy(false)
    if (error) {
      toast.error(error)
    } else {
      setResetSent(true)
      toast.success(t('auth.resetEmailSent'))
    }
  }

  const handleResendConfirmation = async () => {
    const cleanEmail = email.trim()
    if (!cleanEmail) {
      toast.error(t('auth.enterEmailFirst', 'Veuillez saisir votre adresse email.'))
      return
    }
    setResending(true)
    const { error } = await resendConfirmation(cleanEmail)
    setResending(false)
    if (error) {
      toast.error(error)
    } else {
      setResendSent(true)
      toast.success(t('auth.confirmationSent', 'Email de confirmation renvoyé !'))
    }
  }

  if (isForgot) {
    return (
      <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
        <Link to="/" className="mb-8 flex items-center justify-center gap-1.5 font-display text-2xl font-bold">
          <Zap className="h-6 w-6 text-volt" strokeWidth={2.5} />
          ELECTRO<span className="text-volt">GEGA</span>
        </Link>

        <div className="rounded-md border border-border bg-card p-6 shadow-sm">
          {resetSent ? (
            <div className="space-y-4 text-center py-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-volt/10 text-volt">
                <KeyRound className="h-6 w-6" />
              </div>
              <h2 className="font-display text-xl font-bold">{t('auth.resetEmailSent')}</h2>
              <p className="text-sm text-muted-foreground">{t('auth.forgotPasswordSub')}</p>
              <Button
                onClick={() => {
                  setIsForgot(false)
                  setResetSent(false)
                }}
                variant="outline"
                className="w-full mt-2"
              >
                {t('auth.backToSignIn')}
              </Button>
            </div>
          ) : (
            <form onSubmit={doResetPassword} className="space-y-4">
              <h2 className="font-display text-xl font-bold">{t('auth.forgotPasswordTitle')}</h2>
              <p className="text-sm text-muted-foreground">{t('auth.forgotPasswordSub')}</p>
              <div>
                <Label htmlFor="reset-email">{t('auth.email')}</Label>
                <Input
                  id="reset-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5 bg-secondary"
                  placeholder="votre@email.com"
                />
              </div>
              <Button type="submit" disabled={busy} className="w-full bg-volt font-bold text-volt-fg hover:bg-volt-dim">
                {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {busy ? t('common.loading') : t('auth.sendResetLink')}
              </Button>
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setIsForgot(false)}
                  className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="mr-1 h-3 w-3" />
                  {t('auth.backToSignIn')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
      <Link to="/" className="mb-8 flex items-center justify-center gap-1.5 font-display text-2xl font-bold">
        <Zap className="h-6 w-6 text-volt" strokeWidth={2.5} />
        ELECTRO<span className="text-volt">GEGA</span>
      </Link>

      <Tabs defaultValue="signin" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signin">{t('auth.signIn')}</TabsTrigger>
          <TabsTrigger value="signup">{t('auth.signUp')}</TabsTrigger>
        </TabsList>
        <TabsContent value="signin">
          <form onSubmit={doSignIn} className="mt-6 space-y-4 rounded-md border border-border bg-card p-6">
            <h2 className="font-display text-xl font-bold">{t('auth.signInTitle')}</h2>

            {signInError && (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive flex flex-col gap-1.5 animate-in fade-in-50">
                <div className="flex items-center gap-2 font-semibold">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{signInError}</span>
                </div>
                {signInError.toLowerCase().includes('not confirmed') && (
                  <div className="mt-1 pt-1.5 border-t border-destructive/20 flex items-center justify-between">
                    <span className="text-muted-foreground">{t('auth.resendPrompt', 'Pas reçu le lien ?')}</span>
                    <button
                      type="button"
                      disabled={resending || resendSent}
                      onClick={handleResendConfirmation}
                      className="font-bold underline hover:text-foreground inline-flex items-center gap-1"
                    >
                      {resending ? <RefreshCw className="h-3 w-3 animate-spin" /> : null}
                      {resendSent ? t('auth.sent', 'Envoyé !') : t('auth.resendLink', 'Renvoyer confirmation')}
                    </button>
                  </div>
                )}
              </div>
            )}

            <div>
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (signInError) setSignInError(null)
                }}
                className="mt-1.5 bg-secondary"
                placeholder="votre@email.com"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t('auth.password')}</Label>
                <button
                  type="button"
                  onClick={() => setIsForgot(true)}
                  className="text-xs text-muted-foreground hover:text-foreground font-normal hover:underline"
                >
                  {t('auth.forgotPassword')}
                </button>
              </div>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (signInError) setSignInError(null)
                  }}
                  className="bg-secondary pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" disabled={busy} className="w-full bg-volt font-bold text-volt-fg hover:bg-volt-dim">
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {busy ? t('common.loading') : t('auth.signIn')}
            </Button>
          </form>
        </TabsContent>
        <TabsContent value="signup">
          <form onSubmit={doSignUp} className="mt-6 space-y-4 rounded-md border border-border bg-card p-6">
            <h2 className="font-display text-xl font-bold">{t('auth.signUpTitle')}</h2>

            {signUpError && (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2 font-semibold animate-in fade-in-50">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{signUpError}</span>
              </div>
            )}

            <div>
              <Label htmlFor="name">{t('auth.displayName')}</Label>
              <Input
                id="name"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (signUpError) setSignUpError(null)
                }}
                className="mt-1.5 bg-secondary"
                placeholder="Ex. Omar Alami"
              />
            </div>
            <div>
              <Label htmlFor="email2">{t('auth.email')}</Label>
              <Input
                id="email2"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (signUpError) setSignUpError(null)
                }}
                className="mt-1.5 bg-secondary"
                placeholder="votre@email.com"
              />
            </div>
            <div>
              <Label htmlFor="password2">{t('auth.password')}</Label>
              <div className="relative mt-1.5">
                <Input
                  id="password2"
                  type={showSignUpPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  minLength={6}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (signUpError) setSignUpError(null)
                  }}
                  className="bg-secondary pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                  aria-label={showSignUpPassword ? 'Hide password' : 'Show password'}
                >
                  {showSignUpPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">{t('auth.passwordHint', 'Minimum 6 caractères')}</p>
            </div>
            <Button type="submit" disabled={busy} className="w-full bg-volt font-bold text-volt-fg hover:bg-volt-dim">
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {busy ? t('common.loading') : t('auth.signUp')}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  )
}
