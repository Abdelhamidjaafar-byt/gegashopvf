import { useCallback, useEffect, useState } from 'react'
import { supabase, channelName } from '@/lib/supabase'
import type { Order } from '@/types'

/** Orders for the signed-in customer. */
export function useMyOrders(userId: string | undefined) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    if (!userId) {
      setOrders([])
      setLoading(false)
      return
    }
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    setOrders((data || []) as Order[])
    setLoading(false)
  }, [userId])

  useEffect(() => {
    refetch()
    if (!userId) return
    const client = supabase
    const channel = client
      .channel(channelName(`my-orders-${userId}`))
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `user_id=eq.${userId}` },
        () => refetch(),
      )
      .subscribe()
    return () => {
      client.removeChannel(channel)
    }
  }, [refetch, userId])

  return { orders, loading, refetch, setOrders }
}


/** All orders — admin only (RLS enforces this server-side too). Realtime enabled. */
export function useAllOrders(enabled: boolean) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    if (!enabled) return
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    setOrders((data || []) as Order[])
    setLoading(false)
  }, [enabled])

  useEffect(() => {
    refetch()
    if (!enabled) return
    const client = supabase
    const channel = client
      .channel(channelName('orders'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => refetch())
      .subscribe()
    return () => {
      client.removeChannel(channel)
    }
  }, [refetch, enabled])

  return { orders, loading, refetch }
}

export async function placeOrder(
  order: Omit<Order, 'id' | 'created_at' | 'status'>,
): Promise<{ id?: string; error?: string }> {
  const { data, error } = await supabase
    .from('orders')
    .insert({ ...order, status: 'processing' })
    .select('id')
    .single()
  if (error) return { error: error.message }
  return { id: (data as { id: string }).id.slice(0, 8).toUpperCase() }
}

export async function updateOrderStatus(orderId: string, status: Order['status']) {
  const { error } = await supabase.from('orders').update({ status }).eq('id', orderId)
  return { error: error?.message }
}

export async function cancelOrder(orderId: string) {
  return updateOrderStatus(orderId, 'cancelled')
}

