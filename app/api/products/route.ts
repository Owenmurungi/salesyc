import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// Helper — get authenticated business id from session
async function getBusinessId(req: NextRequest): Promise<string | null> {
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

// GET /api/products — fetch all products for authenticated business
export async function GET(req: NextRequest) {
  const businessId = await getBusinessId(req)
  if (!businessId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/products — create a new product
export async function POST(req: NextRequest) {
  const businessId = await getBusinessId(req)
  if (!businessId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { name, price, stock, description, image_url, active } = body

  if (!name || !price) {
    return NextResponse.json({ error: 'Name and price are required' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('products')
    .insert({
      business_id: businessId,
      name,
      price: parseInt(price),
      stock: parseInt(stock ?? 0),
      description,
      image_url,
      active: active ?? true,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
