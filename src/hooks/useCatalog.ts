import { useCallback, useEffect, useState } from 'react'
import { supabase, channelName } from '@/lib/supabase'
import type { Brand, Category, Product } from '@/types'

const PRODS_KEY = 'electrogega_prods_cache'
const CATS_KEY = 'electrogega_cats_cache'
const BRANDS_KEY = 'electrogega_brands_cache'

let memoryProducts: Product[] | null = null
let memoryCategories: Category[] | null = null
let memoryBrands: Brand[] | null = null

function getInitialCache<T>(key: string, memoryVal: T[] | null): T[] {
  if (memoryVal && Array.isArray(memoryVal) && memoryVal.length > 0) return memoryVal
  try {
    const raw = localStorage.getItem(key)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed as T[]
    }
  } catch {
    // Ignore localStorage errors
  }
  return []
}

function saveCache<T>(key: string, data: T[]) {
  try {
    // Keep payload lightweight for localStorage (omit huge inline base64 images if present)
    const sanitized = data.map((item: any) => {
      if (item && Array.isArray(item.images)) {
        const cleanImages = item.images.filter((img: string) => typeof img === 'string' && !img.startsWith('data:'))
        return { ...item, images: cleanImages.length > 0 ? cleanImages : item.images.slice(0, 1) }
      }
      return item
    })
    localStorage.setItem(key, JSON.stringify(sanitized))
  } catch {
    // Gracefully ignore QuotaExceededError or storage restrictions
  }
}

/**
 * Products / categories / brands — fetched from Supabase with instant
 * cache-first render and silent background sync.
 */
export function useProducts() {
  const initial = getInitialCache<Product>(PRODS_KEY, memoryProducts)
  const [products, setProducts] = useState<Product[]>(initial)
  const [loading, setLoading] = useState(initial.length === 0)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) {
      setError(error.message)
    } else if (data) {
      const list = data as Product[]
      memoryProducts = list
      saveCache(PRODS_KEY, list)
      setProducts(list)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    refetch()
    const channel = supabase
      .channel(channelName('products'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => refetch())
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [refetch])

  return { products, loading, error, refetch }
}

export function useCategories() {
  const initial = getInitialCache<Category>(CATS_KEY, memoryCategories)
  const [categories, setCategories] = useState<Category[]>(initial)
  const [loading, setLoading] = useState(initial.length === 0)

  const refetch = useCallback(async () => {
    const { data } = await supabase.from('categories').select('*').order('name')
    if (data) {
      const list = data as Category[]
      memoryCategories = list
      saveCache(CATS_KEY, list)
      setCategories(list)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    refetch()
    const channel = supabase
      .channel(channelName('categories'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => refetch())
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [refetch])

  return { categories, loading, refetch }
}

export function useBrands() {
  const initial = getInitialCache<Brand>(BRANDS_KEY, memoryBrands)
  const [brands, setBrands] = useState<Brand[]>(initial)
  const [loading, setLoading] = useState(initial.length === 0)

  const refetch = useCallback(async () => {
    const { data } = await supabase.from('brands').select('*').order('name')
    if (data) {
      const list = data as Brand[]
      memoryBrands = list
      saveCache(BRANDS_KEY, list)
      setBrands(list)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    refetch()
    const channel = supabase
      .channel(channelName('brands'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'brands' }, () => refetch())
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [refetch])

  return { brands, loading, refetch }
}
