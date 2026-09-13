import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './AuthContext'

interface WishlistContextValue {
  ids: Set<string>
  loading: boolean
  has: (productId: string) => boolean
  toggle: (productId: string) => Promise<boolean> // returns true if now in wishlist
}

const WishlistContext = createContext<WishlistContextValue | null>(null)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [ids, setIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!user) {
        setIds(new Set())
        return
      }
      setLoading(true)
      const { data } = await supabase.from('wishlists').select('product_id').eq('user_id', user.id)
      if (!cancelled) {
        setIds(new Set((data || []).map((r: { product_id: string }) => r.product_id)))
        setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [user])

  const has = useCallback((productId: string) => ids.has(productId), [ids])

  const toggle = useCallback(
    async (productId: string) => {
      if (!user) return false
      const inList = ids.has(productId)
      if (inList) {
        await supabase.from('wishlists').delete().eq('user_id', user.id).eq('product_id', productId)
        setIds((prev) => {
          const next = new Set(prev)
          next.delete(productId)
          return next
        })
        return false
      }
      await supabase.from('wishlists').insert({ user_id: user.id, product_id: productId })
      setIds((prev) => new Set(prev).add(productId))
      return true
    },
    [user, ids],
  )

  const value = useMemo(() => ({ ids, loading, has, toggle }), [ids, loading, has, toggle])
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider')
  return ctx
}
