import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

async function isAdmin(): Promise<boolean> {
  const cookieStore = cookies()
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Cookie: cookieStore.toString() } } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const { data } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()
  return data?.role === 'admin'
}

// GET /api/admin/stats — platform wide stats for admin dashboard
export async function GET(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Total active clients
  const { count: activeClients } = await supabaseAdmin
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .eq('bot_active', true)

  // Trial accounts
  const { count: trialClients } = await supabaseAdmin
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .gte('trial_ends_at', new Date().toISOString())

  // Messages sent today
  const { count: messagesToday } = await supabaseAdmin
    .from('conversations')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today.toISOString())

  // Orders this week
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const { count: ordersThisWeek } = await supabaseAdmin
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', weekAgo.toISOString())

  // Plan breakdown for MRR calculation
  const { data: planCounts } = await supabaseAdmin
    .from('businesses')
    .select('plan')

  const planPrices: Record<string, number> = {
    starter: 80000,
    standard: 150000,
    premium: 250000,
  }
  const mrr = (planCounts ?? []).reduce((sum, b) => {
    return sum + (planPrices[b.plan] ?? 0)
  }, 0)

  return NextResponse.json({
    activeClients,
    trialClients,
    messagesToday,
    ordersThisWeek,
    mrr,
  })
}
