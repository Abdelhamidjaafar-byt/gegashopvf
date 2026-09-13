import { useCallback, useEffect, useState } from 'react'
import { supabase, channelName } from '@/lib/supabase'
import type { Brand, Category, Product } from '@/types'

/**
 * Products / categories / brands — fetched from Supabase with realtime
 * sync (postgres_changes).
 */
export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setProducts((data || []) as Product[])
    setLoading(false)
  }, [])

  useEffect(() => {
    refetch()
    const client = supabase
    const channel = client
      .channel(channelName('products'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => refetch())
      .subscribe()
    return () => {
      client.removeChannel(channel)
    }
  }, [refetch])

  return { products, loading, error, refetch }
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    const { data } = await supabase.from('categories').select('*').order('name')
    setCategories((data || []) as Category[])
    setLoading(false)
  }, [])

  useEffect(() => {
    refetch()
    const client = supabase
    const channel = client
      .channel(channelName('categories'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => refetch())
      .subscribe()
    return () => {
      client.removeChannel(channel)
    }
  }, [refetch])

  return { categories, loading, refetch }
}

export function useBrands() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    const { data } = await supabase.from('brands').select('*').order('name')
    setBrands((data || []) as Brand[])
    setLoading(false)
  }, [])

  useEffect(() => {
    refetch()
    const client = supabase
    const channel = client
      .channel(channelName('brands'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'brands' }, () => refetch())
      .subscribe()
    return () => {
      client.removeChannel(channel)
    }
  }, [refetch])

  return { brands, loading, refetch }
}
