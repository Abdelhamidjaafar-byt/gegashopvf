import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

if (!url || !key || !url.startsWith('http')) {
  throw new Error(
    'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file (see .env.example), then restart the dev server.',
  )
}

export const supabase: SupabaseClient = createClient(url, key)

/** Unique realtime channel suffix (prevents subscription collisions). */
export function channelName(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}
