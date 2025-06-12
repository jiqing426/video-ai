import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const createClient = () => {
  return createBrowserClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'supabase.auth.token',
        storage: {
          getItem: (key) => {
            if (typeof window === 'undefined') return null
            const value = window.localStorage.getItem(key)
            return value ? JSON.parse(value) : null
          },
          setItem: (key, value) => {
            if (typeof window === 'undefined') return
            window.localStorage.setItem(key, JSON.stringify(value))
          },
          removeItem: (key) => {
            if (typeof window === 'undefined') return
            window.localStorage.removeItem(key)
          },
        },
      },
    }
  )
} 