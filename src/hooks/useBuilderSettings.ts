import { useEffect, useState, useCallback } from 'react'
import { supabase, channelName } from '@/lib/supabase'

export interface BuilderSettings {
  enabled: boolean
}

const STORAGE_KEY = 'electrogega_builder_settings'

const DEFAULT_SETTINGS: BuilderSettings = {
  enabled: false,
}

function getInitialLocalSettings(): BuilderSettings {
  try {
    const cached = localStorage.getItem(STORAGE_KEY)
    if (cached) {
      const parsed = JSON.parse(cached)
      if (typeof parsed?.enabled === 'boolean') {
        return parsed
      }
    }
  } catch (err) {
    console.warn('Failed to parse local builder settings:', err)
  }
  return DEFAULT_SETTINGS
}

function saveLocalSettings(data: BuilderSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Ignore error
  }
}

export function useBuilderSettings() {
  const [settings, setSettings] = useState<BuilderSettings>(getInitialLocalSettings)
  const [loading, setLoading] = useState(true)

  const fetchSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'builder_settings')
        .maybeSingle()

      if (!error && data?.value && typeof data.value.enabled === 'boolean') {
        const val: BuilderSettings = { enabled: Boolean(data.value.enabled) }
        setSettings(val)
        saveLocalSettings(val)
      } else {
        const local = getInitialLocalSettings()
        setSettings(local)
      }
    } catch {
      const local = getInitialLocalSettings()
      setSettings(local)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSettings()

    const channel = supabase
      .channel(channelName('builder_settings'))
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'site_settings', filter: 'key=eq.builder_settings' },
        () => {
          fetchSettings()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchSettings])

  const setBuilderEnabled = async (enabled: boolean) => {
    const updated: BuilderSettings = { enabled }
    setSettings(updated)
    saveLocalSettings(updated)

    try {
      await supabase.from('site_settings').upsert({
        key: 'builder_settings',
        value: updated,
        updated_at: new Date().toISOString(),
      })
    } catch (err) {
      console.warn('Failed to save builder settings to Supabase:', err)
    }
  }

  return {
    enabled: settings.enabled,
    loading,
    setBuilderEnabled,
    refetch: fetchSettings,
  }
}
