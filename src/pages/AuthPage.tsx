import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Zap, ArrowLeft, KeyRound } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function AuthPage() {
  const { t } = useTranslation()
  const { signIn, signUp, resetPassword, user, isPasswordRecovery } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [isForgot, setIsForgot] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  if (isPasswordRecovery) {
    return <Navigate to="/reset-password" replace />
  }

  if (user) {
    return <Navigate to="/profile" replace />
  }

  const doSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    const { error } = await signIn(email, password)
    setBusy(false)
    if (error) toast.error(error)
    else navigate('/')
  }

  const doSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    const { error, needsConfirm } = await signUp(email, password, name)
    setBusy(false)
    if (error) toast.error(error)
    else if (needsConfirm) toast.success(t('auth.checkInbox'))
    else navigate('/')
  }

  const doResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setBusy(true)
    const { error } = await resetPassword(email)
    setBusy(false)
    if (error) {
      toast.error(error)
    } else {
      setResetSent(true)
      toast.success(t('auth.resetEmailSent'))
    }
  }

  if (isForgot) {
    return (
      <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
        <div className="mb-8 flex items-center justify-center gap-1.5 font-display text-2xl font-bold">
          <Zap className="h-6 w-6 text-volt" strokeWidth={2.5} />
          ELECTRO<span className="text-volt">GEGA</span>
        </div>

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
                />
              </div>
              <Button type="submit" disabled={busy} className="w-full bg-volt font-bold text-volt-fg hover:bg-volt-dim">
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
      <div className="mb-8 flex items-center justify-center gap-1.5 font-display text-2xl font-bold">
        <Zap className="h-6 w-6 text-volt" strokeWidth={2.5} />
        ELECTRO<span className="text-volt">GEGA</span>
      </div>

      <Tabs defaultValue="signin" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signin">{t('auth.signIn')}</TabsTrigger>
          <TabsTrigger value="signup">{t('auth.signUp')}</TabsTrigger>
        </TabsList>
        <TabsContent value="signin">
          <form onSubmit={doSignIn} className="mt-6 space-y-4 rounded-md border border-border bg-card p-6">
            <h2 className="font-display text-xl font-bold">{t('auth.signInTitle')}</h2>
            <div>
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 bg-secondary" />
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
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5 bg-secondary" />
            </div>
            <Button type="submit" disabled={busy} className="w-full bg-volt font-bold text-volt-fg hover:bg-volt-dim">
              {t('auth.signIn')}
            </Button>
          </form>
        </TabsContent>
        <TabsContent value="signup">
          <form onSubmit={doSignUp} className="mt-6 space-y-4 rounded-md border border-border bg-card p-6">
            <h2 className="font-display text-xl font-bold">{t('auth.signUpTitle')}</h2>
            <div>
              <Label htmlFor="name">{t('auth.displayName')}</Label>
              <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5 bg-secondary" />
            </div>
            <div>
              <Label htmlFor="email2">{t('auth.email')}</Label>
              <Input id="email2" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 bg-secondary" />
            </div>
            <div>
              <Label htmlFor="password2">{t('auth.password')}</Label>
              <Input id="password2" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5 bg-secondary" />
            </div>
            <Button type="submit" disabled={busy} className="w-full bg-volt font-bold text-volt-fg hover:bg-volt-dim">
              {t('auth.signUp')}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  )
}
