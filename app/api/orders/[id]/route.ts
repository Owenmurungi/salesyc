import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// PATCH /api/orders/[id] — update order status
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
