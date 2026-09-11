import { useCallback, useEffect, useState } from 'react'
import { supabase, isDemoMode } from '@/lib/supabase'
import { demoReviews } from '@/lib/demo-data'
import type { Review } from '@/types'

export function useReviews(productId: string | undefined) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    if (!productId) return
    if (isDemoMode || !supabase) {
      setReviews(demoReviews.filter((r) => r.product_id === productId))
      setLoading(false)
      return
    }
    const { data } = await supabase
      .from('reviews')
      .select('*, users(display_name)')
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
    const mapped = (data || []).map((r: Record<string, unknown>) => ({
      ...(r as unknown as Review),
      author: (r.users as { display_name?: string } | null)?.display_name || 'Customer',
    }))
    setReviews(mapped)
    setLoading(false)
  }, [productId])

  useEffect(() => {
    refetch()
  }, [refetch])

  const addReview = useCallback(
    async (userId: string, rating: number, comment: string, author: string) => {
      if (!productId) return { error: 'no-product' }
      if (isDemoMode || !supabase) {
        const review: Review = {
          id: `local-${Date.now()}`,
          product_id: productId,
          user_id: userId,
          rating,
          comment,
          created_at: new Date().toISOString(),
          author,
        }
        setReviews((prev) => [review, ...prev])
        return {}
      }
      const { error } = await supabase
        .from('reviews')
        .upsert({ product_id: productId, user_id: userId, rating, comment })
      if (error) return { error: error.message }
      await refetch()
      return {}
    },
    [productId, refetch],
  )

  const average = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0

  return { reviews, loading, average, addReview, refetch }
}
