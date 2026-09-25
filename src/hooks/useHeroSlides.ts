import { useEffect, useState, useCallback } from 'react'
import { supabase, channelName } from '@/lib/supabase'
import type { HeroSlide } from '@/types/hero'

const STORAGE_KEY = 'electrogega_hero_slides'

export const DEFAULT_HERO_SLIDE: HeroSlide = {
  id: 'default-hero-1',
  type: 'video',
  url: 'hero.mp4',
  badge: 'New season drops are live',
  titleA: 'Tech that',
  titleB: 'electrifies.',
  sub: 'Phones, laptops, audio and gaming gear — hand-picked, fairly priced, and delivered anywhere in Morocco by Cathedis.',
  bubbleText: '🔥 Fast 24h Express Delivery across Morocco | Hand-picked Tech Gear!',
  ctaText: 'Shop now',
  ctaLink: '/shop',
  active: true,
  order: 0,
}

function getInitialLocalSlides(): HeroSlide[] {
  try {
    const cached = localStorage.getItem(STORAGE_KEY)
    if (cached) {
      const parsed = JSON.parse(cached)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch (err) {
    console.warn('Failed to parse local hero slides:', err)
  }
  return [DEFAULT_HERO_SLIDE]
}

export function useHeroSlides() {
  const [slides, setSlides] = useState<HeroSlide[]>(getInitialLocalSlides)
  const [loading, setLoading] = useState(true)

  const syncToLocal = (newSlides: HeroSlide[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSlides))
    } catch (err) {
      console.warn('Failed to save hero slides to localStorage:', err)
    }
  }

  const fetchSlides = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'hero_slides')
        .maybeSingle()

      if (!error && data?.value && Array.isArray(data.value) && data.value.length > 0) {
        setSlides(data.value)
        syncToLocal(data.value)
      } else {
        const local = getInitialLocalSlides()
        setSlides(local)
      }
    } catch {
      const local = getInitialLocalSlides()
      setSlides(local)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSlides()

    const channel = supabase
      .channel(channelName('hero_slides'))
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'site_settings', filter: 'key=eq.hero_slides' },
        () => {
          fetchSlides()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchSlides])

  const saveSlides = async (newSlides: HeroSlide[]) => {
    setSlides(newSlides)
    syncToLocal(newSlides)

    try {
      await supabase.from('site_settings').upsert(
        {
          key: 'hero_slides',
          value: newSlides,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
      )
    } catch (err) {
      console.warn('Failed to persist hero slides to Supabase:', err)
    }
  }

  const addSlide = async (slideData: Omit<HeroSlide, 'id' | 'order'>) => {
    const newSlide: HeroSlide = {
      ...slideData,
      id: `hero-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      order: slides.length,
    }
    const updated = [...slides, newSlide]
    await saveSlides(updated)
  }

  const updateSlide = async (id: string, updates: Partial<HeroSlide>) => {
    const updated = slides.map((s) => (s.id === id ? { ...s, ...updates } : s))
    await saveSlides(updated)
  }

  const deleteSlide = async (id: string) => {
    const filtered = slides.filter((s) => s.id !== id)
    const reordered = filtered.map((s, idx) => ({ ...s, order: idx }))
    await saveSlides(reordered.length > 0 ? reordered : [DEFAULT_HERO_SLIDE])
  }

  const toggleSlideActive = async (id: string) => {
    const updated = slides.map((s) => (s.id === id ? { ...s, active: !s.active } : s))
    await saveSlides(updated)
  }

  const moveSlide = async (id: string, direction: 'up' | 'down') => {
    const index = slides.findIndex((s) => s.id === id)
    if (index === -1) return
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= slides.length) return

    const reordered = [...slides]
    const temp = reordered[index]
    reordered[index] = reordered[targetIndex]
    reordered[targetIndex] = temp

    const updated = reordered.map((s, idx) => ({ ...s, order: idx }))
    await saveSlides(updated)
  }

  const resetToDefaults = async () => {
    await saveSlides([DEFAULT_HERO_SLIDE])
  }

  const activeSlides = slides
    .filter((s) => s.active)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

  return {
    slides,
    activeSlides: activeSlides.length > 0 ? activeSlides : [DEFAULT_HERO_SLIDE],
    loading,
    saveSlides,
    addSlide,
    updateSlide,
    deleteSlide,
    toggleSlideActive,
    moveSlide,
    resetToDefaults,
  }
}
