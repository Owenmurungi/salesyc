import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
})

export interface Product {
  id: string
  name: string
  price: number
  stock: number
  description: string | null
  image_url: string | null
  active: boolean
}

export interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface ChatParams {
  shopName: string
  products: Product[]
  conversationHistory: Message[]
  customerMessage: string
}

export async function chatWithGroq({
  shopName,
  products,
  conversationHistory,
  customerMessage,
}: ChatParams): Promise<string> {

  const systemPrompt = buildSystemPrompt(shopName, products)

  const messages: Message[] = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory,
    { role: 'user', content: customerMessage },
  ]

  const response = await groq.chat.completions.create({
    model: 'llama3-70b-8192',
    messages,
    temperature: 0.7,
    max_tokens: 500,
  })

  return response.choices[0]?.message?.content ?? 'Sorry, I could not process that. Please try again.'
}

function buildSystemPrompt(shopName: string, products: Product[]): string {
  const productList = products
    .filter(p => p.active)
    .map(p => {
      const stockStatus = p.stock > 0 ? `${p.stock} in stock` : 'OUT OF STOCK'
      return `- ${p.name}: UGX ${p.price.toLocaleString()} (${stockStatus})${p.description ? ` | ${p.description}` : ''}`
    })
    .join('\n')

  return `You are a helpful sales assistant for ${shopName}, a phone and electronics shop in Uganda.
You communicate via WhatsApp in a friendly, professional way.

PRODUCT CATALOG:
${productList || 'No products available yet.'}

YOUR RULES:
1. Only recommend products that are IN STOCK. Never offer out-of-stock items.
2. When a customer wants to order, collect: their name, exact item, quantity, and delivery address.
3. Once you have all order details, confirm the order and give Mobile Money payment instructions.
4. Keep replies SHORT and conversational — this is WhatsApp, not email.
5. If asked about something not in the catalog, politely say it is not available.
6. Handle mixed English and Luganda naturally.
7. Never make up prices or products that are not in the catalog above.

PAYMENT INSTRUCTIONS (use when confirming an order):
Tell the customer to send payment via MTN MoMo or Airtel Money to the shop's number.
Tell them to use their name as the reference.
Confirm delivery will happen after payment is received.`
}

// Helper — detect if a message contains an order
export function detectOrder(aiReply: string, customerMessage: string): boolean {
  const orderKeywords = [
    'order confirmed', 'your order', 'send payment',
    'delivery address', 'momo', 'mobile money', 'confirmed your order'
  ]
  const combined = (aiReply + ' ' + customerMessage).toLowerCase()
  return orderKeywords.some(kw => combined.includes(kw))
}

// Helper — extract product name from conversation
export function extractProductFromMessage(message: string, products: Product[]): Product | null {
  const lower = message.toLowerCase()
  return products.find(p =>
    lower.includes(p.name.toLowerCase()) ||
    p.name.toLowerCase().split(' ').some(word => word.length > 3 && lower.includes(word))
  ) ?? null
}
