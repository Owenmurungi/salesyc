import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client for browser / frontend — respects RLS
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client for server / API routes — bypasses RLS
// Only use this in API routes, never expose to the browser
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
