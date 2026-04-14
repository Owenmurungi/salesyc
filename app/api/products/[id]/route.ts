import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { deleteProductImage } from '@/lib/image-upload'

// PATCH /api/products/[id] — update a product
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// DELETE /api/products/[id] — delete product and its image from storage
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Fetch the product first to get image_url for cleanup
  const { data: product } = await supabaseAdmin
    .from('products')
    .select('image_url')
    .eq('id', params.id)
    .single()

  // Delete the product row
  const { error } = await supabaseAdmin
    .from('products')
    .delete()
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Clean up image from Supabase Storage if it exists
  if (product?.image_url) {
    try {
      await deleteProductImage(product.image_url)
    } catch (e) {
      console.warn('Image cleanup failed:', e)
    }
  }

  return NextResponse.json({ success: true })
}
