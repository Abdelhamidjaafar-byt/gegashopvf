import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MessageCircle, Save, ExternalLink, Share2, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { FALLBACK_WHATSAPP, formatWhatsAppNumber, whatsappLink } from '@/lib/store'
import { useSocialSettings, type SocialLinkSetting, DEFAULT_TAGLINE } from '@/hooks/useSocialSettings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function SettingsTab() {
  const { t } = useTranslation()
  const { user, refreshProfile } = useAuth()
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [loading, setLoading] = useState(true)
  const [savingPhone, setSavingPhone] = useState(false)
  const [savingSocials, setSavingSocials] = useState(false)

  const { footerSocialData, saveSocialSettings } = useSocialSettings()
  const [tagline, setTagline] = useState(footerSocialData.tagline || DEFAULT_TAGLINE)
  const [localSocials, setLocalSocials] = useState<SocialLinkSetting[]>(footerSocialData.links)

  useEffect(() => {
    setTagline(footerSocialData.tagline || DEFAULT_TAGLINE)
    setLocalSocials(footerSocialData.links)
  }, [footerSocialData])

  useEffect(() => {
    async function loadAdminPhone() {
      const { data: rpcPhone } = await supabase.rpc('admin_whatsapp')
      if (rpcPhone) {
        setWhatsappNumber(rpcPhone as string)
        setLoading(false)
        return
      }

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

  const handleSavePhone = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const cleanPhone = formatWhatsAppNumber(whatsappNumber)

    setSavingPhone(true)
    const { error } = await supabase
      .from('users')
      .update({ phone: cleanPhone })
      .eq('id', user.id)

    setSavingPhone(false)

    if (error) {
      toast.error(error.message)
    } else {
      setWhatsappNumber(cleanPhone)
      await refreshProfile()
      toast.success(t('common.saved', 'WhatsApp number saved successfully!'))
    }
  }

  const handleToggleSocial = (id: string) => {
    setLocalSocials((prev) =>
      prev.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item)),
    )
  }

  const handleUrlChange = (id: string, newUrl: string) => {
    setLocalSocials((prev) =>
      prev.map((item) => (item.id === id ? { ...item, url: newUrl } : item)),
    )
  }

  const handleSaveSocials = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingSocials(true)
    await saveSocialSettings({
      tagline,
      links: localSocials,
    })
    setSavingSocials(false)
    toast.success('Footer text & social media settings updated successfully!')
  }

  const testLink = whatsappLink(whatsappNumber || FALLBACK_WHATSAPP, t('admin.testMessage'))

  if (loading) {
    return <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
  }

  return (
    <div className="max-w-4xl space-y-8">
      {/* 1. WHATSAPP ORDER HANDOFF */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366]/10 text-[#25D366]">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold">{t('admin.whatsappSettingsTitle')}</h2>
            <p className="text-sm text-muted-foreground">{t('admin.whatsappSettingsSub')}</p>
          </div>
        </div>

        <form onSubmit={handleSavePhone} className="mt-6 space-y-4">
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
              disabled={savingPhone}
              className="bg-volt font-bold text-volt-fg hover:bg-volt-dim"
            >
              <Save className="mr-2 h-4 w-4" />
              {savingPhone ? t('common.loading') : t('admin.save')}
            </Button>

            <Button
              type="button"
              variant="outline"
              asChild
              className="border-muted-foreground/30 hover:border-volt hover:text-volt font-bold text-xs"
            >
              <a href={testLink} target="_blank" rel="noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                {t('admin.testWhatsapp')}
              </a>
            </Button>
          </div>
        </form>
      </div>

      {/* 2. FOOTER TEXT & SOCIAL MEDIA LINKS / VISIBILITY */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-border/80 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-volt/10 text-volt border border-volt/30">
              <Share2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold">Footer Description & Social Media Settings</h2>
              <p className="text-sm text-muted-foreground">
                Edit the text after the logo and manage which social media icons to show or hide in the footer.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveSocials} className="space-y-6">
          {/* Tagline input */}
          <div className="space-y-2">
            <Label htmlFor="footer-tagline-input" className="font-bold text-xs uppercase tracking-wider text-foreground">
              Footer Description Text (After Logo)
            </Label>
            <Textarea
              id="footer-tagline-input"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Gaming setups, authentic PC components & electronics delivered anywhere in Morocco."
              className="bg-secondary text-xs leading-relaxed min-h-[70px]"
            />
          </div>

          {/* Social Icons list with Show/Hide toggles */}
          <div className="space-y-3">
            <Label className="font-bold text-xs uppercase tracking-wider text-foreground">
              Social Media Icons & Links (Show / Hide)
            </Label>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {localSocials.map((item) => (
                <div
                  key={item.id}
                  className={`flex flex-col justify-between rounded-lg border p-4 transition-all ${
                    item.enabled ? 'border-volt/40 bg-secondary/40' : 'border-border/60 bg-muted/20 opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm flex items-center gap-2">
                      {item.name}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleToggleSocial(item.id)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold uppercase transition-all ${
                        item.enabled
                          ? 'bg-volt text-volt-fg shadow-sm'
                          : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                      }`}
                    >
                      {item.enabled ? (
                        <>
                          <Eye className="h-3.5 w-3.5" /> Visible
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3.5 w-3.5" /> Hidden
                        </>
                      )}
                    </button>
                  </div>

                  <div className="mt-2">
                    <Label className="text-[11px] font-semibold text-muted-foreground uppercase">
                      {item.name} URL / Handle
                    </Label>
                    <Input
                      type="text"
                      value={item.url}
                      onChange={(e) => handleUrlChange(item.id, e.target.value)}
                      placeholder={`https://${item.platform}.com/...`}
                      className="mt-1 bg-background text-xs font-mono"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button
              type="submit"
              disabled={savingSocials}
              className="bg-volt font-black uppercase tracking-wider text-volt-fg hover:bg-volt-dim px-6"
            >
              <Save className="mr-2 h-4 w-4" />
              {savingSocials ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
