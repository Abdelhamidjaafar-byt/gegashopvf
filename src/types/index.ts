export type Role = 'customer' | 'admin'

export interface UserProfile {
  id: string
  email: string
  display_name: string | null
  phone: string | null
  role: Role
  created_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  parent_id?: string | null
  created_at?: string
}

export interface Brand {
  id: string
  name: string
  created_at?: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  category_id: string | null
  brand_id: string | null
  images: string[]
  specs: Record<string, string>
  is_featured: boolean
  created_at: string
}

export interface CartItem {
  product: Product
  qty: number
}

export type OrderStatus = 'processing' | 'shipped' | 'delivered' | 'cancelled'

export interface OrderItem {
  product_id: string
  name: string
  price: number
  qty: number
  image: string | null
}

export interface ShippingAddress {
  full_name: string
  phone: string
  street: string
  city: string
  postal_code?: string
  country: string
}

export type ShippingMethod = 'cathedis_standard' | 'cathedis_express'
export type PaymentMethod = 'card' | 'cod' | 'whatsapp'

export interface Order {
  id: string
  user_id: string
  customer_email: string
  items: OrderItem[]
  subtotal: number
  shipping_method: ShippingMethod
  shipping_cost: number
  total: number
  payment_method: PaymentMethod
  shipping_address: ShippingAddress
  status: OrderStatus
  created_at: string
}

export interface Address extends ShippingAddress {
  id: string
  user_id: string
  label: string
  is_default: boolean
}

export interface Review {
  id: string
  product_id: string
  user_id: string
  rating: number
  comment: string
  created_at: string
  author?: string
}

export const SHIPPING_OPTIONS: Record<
  ShippingMethod,
  { label: string; eta: string; price: number; freeOver?: number }
> = {
  cathedis_standard: { label: 'Cathedis Standard', eta: '2–4 days', price: 35, freeOver: 500 },
  cathedis_express: { label: 'Cathedis Express', eta: '24 h', price: 60 },
}
