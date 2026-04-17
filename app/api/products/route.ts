
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { deleteProductImage } from '@/lib/image-upload'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const { name, price, stock, description, image_url, active } = body

  const { data, error } = await supabaseAdmin
    .from('products')
    .update({
      ...(name        !== undefined && { name }),
      ...(price       !== undefined && { price: parseInt(price) }),
      ...(stock       !== undefined && { stock: parseInt(stock) }),
      ...(description !== undefined && { description }),
      ...(image_url   !== undefined && { image_url }),
      ...(active      !== undefined && { active }),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { data: product } = await supabaseAdmin
    .from('products')
    .select('image_url')
    .eq('id', id)
    .single()

  const { error } = await supabaseAdmin
    .from('products')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (product?.image_url) {
    try {
      await deleteProductImage(product.image_url)
    } catch (e) {
      console.warn('Image cleanup failed:', e)
    }
  }

  return NextResponse.json({ success: true })
}
