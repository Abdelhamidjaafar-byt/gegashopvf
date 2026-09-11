import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/**
 * When credentials are absent the app runs in demo mode:
 * the UI stays fully browsable with bundled sample data, and a banner
 * explains how to connect a real Supabase project.
 */
export const isSupabaseConfigured = Boolean(url && key && url!.startsWith('http'))

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, key!)
  : null

export const isDemoMode = !isSupabaseConfigured

/** Unique realtime channel suffix (prevents subscription collisions). */
export function channelName(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}
