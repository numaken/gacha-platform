export type KomojuPaymentMethod = 'konbini' | 'paypay' | 'bank_transfer'

interface KomojuSessionParams {
  amount: number
  currency?: string
  return_url: string
  payment_methods: KomojuPaymentMethod[]
  metadata?: Record<string, string>
  default_locale?: string
}

interface KomojuSession {
  id: string
  session_url: string
  status: string
}

export async function createKomojuSession(params: KomojuSessionParams): Promise<KomojuSession> {
  const secretKey = process.env.KOMOJU_SECRET_KEY
  if (!secretKey) {
    throw new Error('KOMOJU_SECRET_KEY is not configured')
  }

  const response = await fetch('https://komoju.com/api/v1/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${Buffer.from(secretKey + ':').toString('base64')}`,
    },
    body: JSON.stringify({
      amount: params.amount,
      currency: params.currency || 'JPY',
      return_url: params.return_url,
      payment_methods: params.payment_methods.map(method => ({ type: method })),
      metadata: params.metadata || {},
      default_locale: params.default_locale || 'ja',
    }),
  })

  if (!response.ok) {
    const errorData = await response.text()
    console.error('KOMOJU session creation failed:', errorData)
    throw new Error('KOMOJUセッション作成に失敗しました / Failed to create KOMOJU session')
  }

  return response.json()
}

export function verifyKomojuWebhook(body: string, signature: string): boolean {
  const crypto = require('crypto')
  const secret = process.env.KOMOJU_WEBHOOK_SECRET
  if (!secret) return false

  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(body)
  const expectedSignature = hmac.digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}
