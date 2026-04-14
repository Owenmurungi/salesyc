import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

async function getBusinessId(): Promise<string | null> {
  const cookieStore = cookies()
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Cookie: cookieStore.toString() } } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: business } = await supabaseAdmin
    .from('businesses')
    .select('id')
    .eq('user_id', user.id)
    .single()
  return business?.id ?? null
}

// GET /api/orders — fetch all orders for authenticated business
export async function GET(req: NextRequest) {
  const businessId = await getBusinessId()
  if (!businessId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const limit  = parseInt(searchParams.get('limit') ?? '50')

  let query = supabaseAdmin
    .from('orders')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (status) query = query.eq('status', status)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
