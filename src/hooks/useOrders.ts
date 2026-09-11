import { useCallback, useEffect, useState } from 'react'
import { supabase, isDemoMode, channelName } from '@/lib/supabase'
import type { Order } from '@/types'

const DEMO_ORDERS_KEY = 'eg_demo_orders'

function readDemoOrders(userId?: string): Order[] {
  try {
    const all: Order[] = JSON.parse(localStorage.getItem(DEMO_ORDERS_KEY) || '[]')
    return userId ? all.filter((o) => o.user_id === userId) : all
  } catch {
    return []
  }
}

function writeDemoOrder(order: Order) {
  const all = readDemoOrders()
  localStorage.setItem(DEMO_ORDERS_KEY, JSON.stringify([order, ...all]))
}

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
    if (isDemoMode || !supabase) {
      setOrders(readDemoOrders(userId))
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
  }, [refetch])

  return { orders, loading, refetch }
}

/** All orders — admin only (RLS enforces this server-side too). Realtime enabled. */
export function useAllOrders(enabled: boolean) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    if (!enabled) return
    if (isDemoMode || !supabase) {
      setOrders(readDemoOrders())
      setLoading(false)
      return
    }
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    setOrders((data || []) as Order[])
    setLoading(false)
  }, [enabled])

  useEffect(() => {
    refetch()
    if (!enabled || isDemoMode || !supabase) return
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
  if (isDemoMode || !supabase) {
    const id = `demo-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
    writeDemoOrder({ ...order, id, status: 'processing', created_at: new Date().toISOString() })
    return { id }
  }
  const { data, error } = await supabase
    .from('orders')
    .insert({ ...order, status: 'processing' })
    .select('id')
    .single()
  if (error) return { error: error.message }
  return { id: (data as { id: string }).id.slice(0, 8).toUpperCase() }
}

export async function updateOrderStatus(orderId: string, status: Order['status']) {
  if (isDemoMode || !supabase) {
    const all = readDemoOrders().map((o) => (o.id === orderId ? { ...o, status } : o))
    localStorage.setItem(DEMO_ORDERS_KEY, JSON.stringify(all))
    return {}
  }
  const { error } = await supabase.from('orders').update({ status }).eq('id', orderId)
  return { error: error?.message }
}
