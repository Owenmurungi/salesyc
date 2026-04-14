import twilio from 'twilio'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
)

const FROM = `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`

interface SendMessageParams {
  to: string         // customer WhatsApp number e.g. "+256772123456"
  body: string       // text reply from AI
  mediaUrl?: string  // optional product image URL
}

export async function sendWhatsAppMessage({ to, body, mediaUrl }: SendMessageParams) {
  const params: any = {
    from: FROM,
    to: `whatsapp:${to}`,
    body,
  }

  // Attach product image if provided
  if (mediaUrl) {
    params.mediaUrl = [mediaUrl]
  }

  const message = await client.messages.create(params)
  return message
}
