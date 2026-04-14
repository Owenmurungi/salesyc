import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendWhatsAppMessage } from '@/lib/twilio'
import { chatWithGroq, detectOrder, extractProductFromMessage } from '@/lib/groq'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()

    // Extract Twilio webhook fields
    const customerPhone = (formData.get('From') as string)?.replace('whatsapp:', '')
    const twilioNumber  = (formData.get('To')   as string)?.replace('whatsapp:', '')
    const customerMessage = formData.get('Body') as string

    if (!customerPhone || !customerMessage) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // ── 1. Find which business this Twilio number belongs to ──
    const { data: business, error: bizError } = await supabaseAdmin
      .from('businesses')
      .select('id, shop_name, bot_active, plan')
      .eq('twilio_number', twilioNumber)
      .single()

    if (bizError || !business) {
      console.error('Business not found for number:', twilioNumber)
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Respect bot toggle — if owner turned bot off, do nothing
    if (!business.bot_active) {
      return NextResponse.json({ status: 'bot_inactive' })
    }

    // ── 2. Fetch product catalog ──
    const { data: products } = await supabaseAdmin
      .from('products')
      .select('id, name, price, stock, description, image_url, active')
      .eq('business_id', business.id)
      .eq('active', true)

    // ── 3. Fetch recent conversation history (last 10 messages) ──
    const { data: history } = await supabaseAdmin
      .from('conversations')
      .select('role, message')
      .eq('business_id', business.id)
      .eq('customer_phone', customerPhone)
      .order('created_at', { ascending: false })
      .limit(10)

    // Reverse so oldest first (correct order for AI context)
    const conversationHistory = (history ?? [])
      .reverse()
      .map(h => ({
        role: h.role === 'bot' ? 'assistant' : 'user' as 'user' | 'assistant',
        content: h.message,
      }))

    // ── 4. Save customer message to conversations ──
    await supabaseAdmin.from('conversations').insert({
      business_id: business.id,
      customer_phone: customerPhone,
      role: 'customer',
      message: customerMessage,
    })

    // ── 5. Call Groq AI ──
    const aiReply = await chatWithGroq({
      shopName: business.shop_name,
      products: products ?? [],
      conversationHistory,
      customerMessage,
    })

    // ── 6. Save bot reply to conversations ──
    await supabaseAdmin.from('conversations').insert({
      business_id: business.id,
      customer_phone: customerPhone,
      role: 'bot',
      message: aiReply,
    })

    // ── 7. Detect if this is an order and save it ──
    if (detectOrder(aiReply, customerMessage)) {
      const matchedProduct = extractProductFromMessage(
        customerMessage,
        products ?? []
      )

      await supabaseAdmin.from('orders').insert({
        business_id: business.id,
        customer_phone: customerPhone,
        product_name: matchedProduct?.name ?? 'Unknown product',
        status: 'pending',
        notes: customerMessage,
      })
    }

    // ── 8. Find product image if product is mentioned ──
    const mentionedProduct = extractProductFromMessage(
      customerMessage,
      products ?? []
    )
    const imageUrl = mentionedProduct?.image_url ?? undefined

    // ── 9. Send reply back via Twilio (with image if found) ──
    await sendWhatsAppMessage({
      to: customerPhone,
      body: aiReply,
      mediaUrl: imageUrl ?? undefined,
    })

    return NextResponse.json({ status: 'ok' })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
