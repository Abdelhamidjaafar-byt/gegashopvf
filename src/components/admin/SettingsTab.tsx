import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MessageCircle, Save, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { FALLBACK_WHATSAPP, formatWhatsAppNumber, whatsappLink } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SettingsTab() {
  const { t } = useTranslation()
  const { user, refreshProfile } = useAuth()
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function loadAdminPhone() {
      // First try rpc function
      const { data: rpcPhone } = await supabase.rpc('admin_whatsapp')
      if (rpcPhone) {
        setWhatsappNumber(rpcPhone as string)
        setLoading(false)
        return
      }

      // Fallback: check current logged-in user or first admin in table
      if (user?.phone) {
        setWhatsappNumber(formatWhatsAppNumber(user.phone))
        setLoading(false)
        return
      }

      const { data: admins } = await supabase
        .from('users')
        .select('phone')
        .eq('role', 'admin')
        .order('created_at')
        .limit(1)

      const phone = admins?.[0]?.phone
      setWhatsappNumber(phone ? formatWhatsAppNumber(phone) : FALLBACK_WHATSAPP)
      setLoading(false)
    }

    loadAdminPhone()
  }, [user])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const cleanPhone = formatWhatsAppNumber(whatsappNumber)

    setSaving(true)
    const { error } = await supabase
      .from('users')
      .update({ phone: cleanPhone })
      .eq('id', user.id)

    setSaving(false)

    if (error) {
      toast.error(error.message)
    } else {
      setWhatsappNumber(cleanPhone)
      await refreshProfile()
      toast.success(t('common.saved'))
    }
  }

  const testLink = whatsappLink(whatsappNumber || FALLBACK_WHATSAPP, t('admin.testMessage'))

  if (loading) {
    return <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="rounded-md border border-border bg-card p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366]/10 text-[#25D366]">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold">{t('admin.whatsappSettingsTitle')}</h2>
            <p className="text-sm text-muted-foreground">{t('admin.whatsappSettingsSub')}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="admin-whatsapp-input">{t('admin.whatsappNumberLabel')}</Label>
            <Input
              id="admin-whatsapp-input"
              type="text"
              required
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="212708065528"
              className="mt-1.5 font-mono bg-secondary"
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              {t('admin.whatsappNumberHint')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              type="submit"
              disabled={saving}
              className="bg-volt font-semibold text-volt-fg hover:bg-volt-dim"
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? t('common.loading') : t('admin.save')}
            </Button>

            <Button
              type="button"
              variant="outline"
              asChild
              className="border-muted-foreground/30 hover:border-volt hover:text-volt"
            >
              <a href={testLink} target="_blank" rel="noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                {t('admin.testWhatsapp')}
              </a>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
