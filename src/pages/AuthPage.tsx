import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { ShieldCheck, User, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { isDemoMode } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function AuthPage() {
  const { t } = useTranslation()
  const { signIn, signUp, demoSignIn, user } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)

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

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
      <div className="mb-8 flex items-center justify-center gap-1.5 font-display text-2xl font-bold">
        <Zap className="h-6 w-6 text-volt" strokeWidth={2.5} />
        ELECTRO<span className="text-volt">GEGA</span>
      </div>

      {isDemoMode ? (
        <div className="rounded-md border border-volt/40 bg-volt/5 p-6 text-center">
          <h2 className="font-display text-lg font-bold text-volt">{t('auth.demoTitle')}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t('auth.demoBody')}</p>
          <div className="mt-5 grid gap-3">
            <Button onClick={() => { demoSignIn('admin'); navigate('/admin') }} className="bg-volt font-semibold text-volt-fg hover:bg-volt-dim">
              <ShieldCheck className="mr-2 h-4 w-4" /> {t('auth.demoAdmin')}
            </Button>
            <Button variant="outline" onClick={() => { demoSignIn('customer'); navigate('/') }}>
              <User className="mr-2 h-4 w-4" /> {t('auth.demoCustomer')}
            </Button>
          </div>
          <p className="mt-5 text-xs leading-relaxed text-muted-foreground">{t('auth.notConfigured')}</p>
        </div>
      ) : (
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
                <Label htmlFor="password">{t('auth.password')}</Label>
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
      )}
    </div>
  )
}
