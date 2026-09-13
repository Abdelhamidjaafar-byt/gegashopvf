import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Address } from '@/types'

export function useAddresses(userId: string | undefined) {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    if (!userId) {
      setAddresses([])
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
      await supabase.from('addresses').delete().eq('id', id)
      await refetch()
    },
    [userId, refetch],
  )

  return { addresses, loading, save, remove, refetch }
}
