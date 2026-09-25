import { useEffect, useState, useCallback } from 'react'
import { supabase, channelName } from '@/lib/supabase'
import { STORE_INSTAGRAM_URL, FALLBACK_WHATSAPP } from '@/lib/store'

export interface SocialLinkSetting {
  id: string
  platform: 'instagram' | 'whatsapp' | 'facebook' | 'youtube' | 'tiktok' | 'twitter' | 'discord' | 'linkedin'
  name: string
  url: string
  enabled: boolean
}

export interface FooterSocialData {
  tagline: string
  links: SocialLinkSetting[]
}

export const DEFAULT_TAGLINE = 'Gaming setups, authentic PC components & electronics delivered anywhere in Morocco.'

export const DEFAULT_SOCIAL_LINKS: SocialLinkSetting[] = [
  { id: 'soc-1', platform: 'instagram', name: 'Instagram', url: STORE_INSTAGRAM_URL, enabled: true },
  { id: 'soc-2', platform: 'whatsapp', name: 'WhatsApp', url: `https://wa.me/${FALLBACK_WHATSAPP}`, enabled: true },
  { id: 'soc-3', platform: 'facebook', name: 'Facebook', url: 'https://facebook.com', enabled: true },
  { id: 'soc-4', platform: 'youtube', name: 'YouTube', url: 'https://youtube.com', enabled: true },
  { id: 'soc-5', platform: 'tiktok', name: 'TikTok', url: 'https://tiktok.com', enabled: false },
  { id: 'soc-6', platform: 'twitter', name: 'X (Twitter)', url: 'https://twitter.com', enabled: false },
  { id: 'soc-7', platform: 'discord', name: 'Discord Server', url: 'https://discord.gg', enabled: false },
  { id: 'soc-8', platform: 'linkedin', name: 'LinkedIn', url: 'https://linkedin.com', enabled: false },
]

export const DEFAULT_FOOTER_SOCIAL_DATA: FooterSocialData = {
  tagline: DEFAULT_TAGLINE,
  links: DEFAULT_SOCIAL_LINKS,
}

const STORAGE_KEY = 'electrogega_social_data_v2'

function getInitialLocalData(): FooterSocialData {
  try {
    const cached = localStorage.getItem(STORAGE_KEY)
    if (cached) {
      const parsed = JSON.parse(cached)
      if (parsed && Array.isArray(parsed.links)) {
        return {
          tagline: parsed.tagline || DEFAULT_TAGLINE,
          links: parsed.links,
        }
      } else if (Array.isArray(parsed)) {
        return {
          tagline: DEFAULT_TAGLINE,
          links: parsed,
        }
      }
    }
  } catch {
    // Fallback to default
  }
  return DEFAULT_FOOTER_SOCIAL_DATA
}

function saveLocalData(data: FooterSocialData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Ignore error
  }
}

export function useSocialSettings() {
  const [footerSocialData, setFooterSocialData] = useState<FooterSocialData>(getInitialLocalData)
  const [loading, setLoading] = useState(true)

  const fetchSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'social_settings')
        .maybeSingle()

      if (!error && data?.value) {
        let normalized: FooterSocialData
        if (Array.isArray(data.value)) {
          normalized = { tagline: DEFAULT_TAGLINE, links: data.value }
        } else if (data.value && Array.isArray(data.value.links)) {
          normalized = { tagline: data.value.tagline || DEFAULT_TAGLINE, links: data.value.links }
        } else {
          normalized = DEFAULT_FOOTER_SOCIAL_DATA
        }
        setFooterSocialData(normalized)
        saveLocalData(normalized)
      } else {
        const local = getInitialLocalData()
        setFooterSocialData(local)
      }
    } catch {
      const local = getInitialLocalData()
      setFooterSocialData(local)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSettings()

    const channel = supabase
      .channel(channelName('social_settings'))
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'site_settings', filter: 'key=eq.social_settings' },
        () => {
          fetchSettings()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchSettings])

  const saveSocialSettings = async (newData: FooterSocialData) => {
    setFooterSocialData(newData)
    saveLocalData(newData)

    try {
      await supabase.from('site_settings').upsert({
        key: 'social_settings',
        value: newData,
        updated_at: new Date().toISOString(),
      })
    } catch (err) {
      console.warn('Failed to save social settings to Supabase:', err)
    }
  }

  return {
    footerSocialData,
    socialSettings: footerSocialData.links,
    tagline: footerSocialData.tagline,
    loading,
    saveSocialSettings,
    refetch: fetchSettings,
  }
}
