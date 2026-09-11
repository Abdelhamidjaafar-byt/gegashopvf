import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { CartItem, Product } from '@/types'

interface CartContextValue {
  items: CartItem[]
  count: number
  subtotal: number
  add: (product: Product, qty?: number) => void
  remove: (productId: string) => void
  setQty: (productId: string, qty: number) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | null>(null)
const KEY = 'eg_cart'

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY) || '[]')
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items))
  }, [items])

  const add = useCallback((product: Product, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id)
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, qty: Math.min(i.qty + qty, product.stock || 99) } : i,
        )
      }
      return [...prev, { product, qty: Math.min(qty, product.stock || 99) }]
    })
  }, [])

  const remove = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId))
  }, [])

  const setQty = useCallback((productId: string, qty: number) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.product.id !== productId)
        : prev.map((i) => (i.product.id === productId ? { ...i, qty } : i)),
    )
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((s, i) => s + i.qty, 0)
    const subtotal = items.reduce((s, i) => s + i.qty * Number(i.product.price), 0)
    return { items, count, subtotal, add, remove, setQty, clear }
  }, [items, add, remove, setQty, clear])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
