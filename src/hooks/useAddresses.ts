import { useCallback, useEffect, useState } from 'react'
import { supabase, isDemoMode } from '@/lib/supabase'
import type { Address } from '@/types'

const KEY = 'eg_demo_addresses'

function readDemo(userId: string): Address[] {
  try {
    return JSON.parse(localStorage.getItem(`${KEY}:${userId}`) || '[]')
  } catch {
    return []
  }
}

function writeDemo(userId: string, addresses: Address[]) {
  localStorage.setItem(`${KEY}:${userId}`, JSON.stringify(addresses))
}

export function useAddresses(userId: string | undefined) {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    if (!userId) {
      setAddresses([])
      setLoading(false)
      return
    }
    if (isDemoMode || !supabase) {
      setAddresses(readDemo(userId))
      setLoading(false)
      return
    }
    const { data } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    setAddresses((data || []) as Address[])
    setLoading(false)
  }, [userId])

  useEffect(() => {
    refetch()
  }, [refetch])

  const save = useCallback(
    async (address: Partial<Address> & { id?: string }) => {
      if (!userId) return { error: 'not-signed-in' }
      if (isDemoMode || !supabase) {
        const all = readDemo(userId)
        if (address.id) {
          writeDemo(userId, all.map((a) => (a.id === address.id ? ({ ...a, ...address } as Address) : a)))
        } else {
          const row: Address = {
            id: `addr-${Date.now()}`,
            user_id: userId,
            label: address.label || 'Home',
            full_name: address.full_name || '',
            phone: address.phone || '',
            street: address.street || '',
            city: address.city || '',
            postal_code: address.postal_code,
            country: address.country || 'Morocco',
            is_default: address.is_default ?? all.length === 0,
          }
          writeDemo(userId, [row, ...all])
        }
        await refetch()
        return {}
      }
      const { id, ...fields } = address
      const res = id
        ? await supabase.from('addresses').update(fields).eq('id', id)
        : await supabase.from('addresses').insert({ ...fields, user_id: userId })
      if (res.error) return { error: res.error.message }
      await refetch()
      return {}
    },
    [userId, refetch],
  )

  const remove = useCallback(
    async (id: string) => {
      if (!userId) return
      if (isDemoMode || !supabase) {
        writeDemo(userId, readDemo(userId).filter((a) => a.id !== id))
      } else {
        await supabase.from('addresses').delete().eq('id', id)
      }
      await refetch()
    },
    [userId, refetch],
  )

  return { addresses, loading, save, remove, refetch }
}
