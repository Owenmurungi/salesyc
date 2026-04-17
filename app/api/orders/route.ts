import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const { status, customer_name, delivery_address, quantity, notes } = body

  const validStatuses = ['pending', 'confirmed', 'delivered']
  if (status && !validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('orders')
    .update({
      ...(status           && { status }),
      ...(customer_name    && { customer_name }),
      ...(delivery_address && { delivery_address }),
      ...(quantity         && { quantity: parseInt(quantity) }),
      ...(notes            && { notes }),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
