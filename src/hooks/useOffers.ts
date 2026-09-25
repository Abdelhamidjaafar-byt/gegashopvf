import { useCallback, useEffect, useState } from 'react'
import { supabase, channelName } from '@/lib/supabase'
import type { Offer } from '@/types'

// Default mock offers for demo mode when Supabase table isn't populated yet
const DEFAULT_OFFERS: Offer[] = [
  {
    id: 'off-1',
    title: 'GeForce RTX 4080 Super Gaming OC',
    badge: 'Deal of the Day',
    description: 'Ultimate 4K high refresh rate gaming graphics card with ultra-efficient DLSS 3.5.',
    product_id: 'd1000000-0000-4000-8000-000000000005',
    discount_percent: 25,
    discounted_price: 10499,
    start_time: new Date().toISOString(),
    end_time: new Date(Date.now() + 14 * 3600 * 1000).toISOString(), // 14 hours from now
    claimed_percentage: 68,
    is_deal_of_day: true,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'off-2',
    title: 'MacBook Pro 16 M3 Max Flash Deal',
    badge: 'Flash Sale',
    description: 'Blazing fast workstation laptop with Liquid Retina XDR display and 36GB unified memory.',
    product_id: 'd1000000-0000-4000-8000-000000000002',
    discount_percent: 15,
    discounted_price: 33999,
    start_time: new Date().toISOString(),
    end_time: new Date(Date.now() + 6 * 3600 * 1000).toISOString(), // 6 hours from now
    claimed_percentage: 82,
    is_deal_of_day: false,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'off-3',
    title: 'Samsung Galaxy S24 Ultra Weekend Special',
    badge: 'Weekend Offer',
    description: 'Titanium chassis, 200MP camera, and built-in S-Pen with Galaxy AI feature suite.',
    product_id: 'd1000000-0000-4000-8000-000000000001',
    discount_percent: 20,
    discounted_price: 11999,
    start_time: new Date().toISOString(),
    end_time: new Date(Date.now() + 30 * 3600 * 1000).toISOString(), // 30 hours from now
    claimed_percentage: 45,
    is_deal_of_day: false,
    is_active: true,
    created_at: new Date().toISOString(),
  },
]

const STORAGE_KEY = 'electrogega_local_offers'

function getStoredLocalOffers(): Offer[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      return JSON.parse(raw)
    }
  } catch (e) {
    console.error('Failed to parse local offers', e)
  }
  return DEFAULT_OFFERS
}

function saveLocalOffers(offers: Offer[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(offers))
  } catch (e) {
    console.error('Failed to save local offers', e)
  }
}

export function useOffers() {
  const initial = getStoredLocalOffers()
  const [offers, setOffers] = useState<Offer[]>(initial)
  const [loading, setLoading] = useState(initial.length === 0)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    try {
      const { data, error: err } = await supabase
        .from('offers')
        .select('*, product:products(*)')
        .order('created_at', { ascending: false })

      if (err || !data || data.length === 0) {
        if (err) setError(err.message)
        const local = getStoredLocalOffers()
        setOffers(local)
      } else {
        setError(null)
        const list = data as Offer[]
        saveLocalOffers(list)
        setOffers(list)
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to fetch offers')
      const local = getStoredLocalOffers()
      setOffers(local)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refetch()
    const channel = supabase
      .channel(channelName('offers'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'offers' }, () => refetch())
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [refetch])

  const createOffer = async (newOffer: Omit<Offer, 'id' | 'created_at'>) => {
    // Attempt Supabase insert
    try {
      if (newOffer.is_deal_of_day) {
        // Reset existing deal of the day
        await supabase.from('offers').update({ is_deal_of_day: false }).eq('is_deal_of_day', true)
      }

      const { data, error } = await supabase
        .from('offers')
        .insert({
          ...newOffer,
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (!error && data) {
        await refetch()
        return data as Offer
      }
    } catch {
      // Fallback
    }

    // Fallback to local state
    const created: Offer = {
      ...newOffer,
      id: `off-${Date.now()}`,
      created_at: new Date().toISOString(),
    }

    setOffers((prev) => {
      let updated = prev
      if (created.is_deal_of_day) {
        updated = prev.map((o) => ({ ...o, is_deal_of_day: false }))
      }
      const next = [created, ...updated]
      saveLocalOffers(next)
      return next
    })
    return created
  }

  const updateOffer = async (id: string, updates: Partial<Offer>) => {
    try {
      if (updates.is_deal_of_day) {
        await supabase.from('offers').update({ is_deal_of_day: false }).neq('id', id)
      }

      const { error } = await supabase.from('offers').update(updates).eq('id', id)
      if (!error) {
        await refetch()
        return
      }
    } catch {
      // Fallback
    }

    setOffers((prev) => {
      const next = prev.map((o) => {
        if (updates.is_deal_of_day && o.id !== id) {
          return { ...o, is_deal_of_day: false }
        }
        if (o.id === id) {
          return { ...o, ...updates }
        }
        return o
      })
      saveLocalOffers(next)
      return next
    })
  }

  const deleteOffer = async (id: string) => {
    try {
      const { error } = await supabase.from('offers').delete().eq('id', id)
      if (!error) {
        await refetch()
        return
      }
    } catch {
      // Fallback
    }

    setOffers((prev) => {
      const next = prev.filter((o) => o.id !== id)
      saveLocalOffers(next)
      return next
    })
  }

  const toggleOfferActive = async (id: string, is_active: boolean) => {
    await updateOffer(id, { is_active })
  }

  const setDealOfDay = async (id: string) => {
    await updateOffer(id, { is_deal_of_day: true, is_active: true })
  }

  return {
    offers,
    loading,
    error,
    refetch,
    createOffer,
    updateOffer,
    deleteOffer,
    toggleOfferActive,
    setDealOfDay,
  }
}
