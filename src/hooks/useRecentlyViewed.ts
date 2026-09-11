import { useCallback, useEffect, useState } from 'react'

const KEY = 'eg_recently_viewed'

/** Tracks recently viewed product ids in session history (localStorage). */
export function useRecentlyViewed() {
  const [ids, setIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY) || '[]')
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(ids))
  }, [ids])

  const track = useCallback((productId: string) => {
    setIds((prev) => [productId, ...prev.filter((id) => id !== productId)].slice(0, 8))
  }, [])

  return { ids, track }
}
