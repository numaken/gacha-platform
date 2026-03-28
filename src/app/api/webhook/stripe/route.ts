import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { getStripe } from '@/lib/stripe'

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!
  const stripe = getStripe()

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    console.error('Webhook signature verification failed')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const supabase = getSupabaseAdmin()

    const orderId = session.metadata?.order_id
    const userId = session.metadata?.user_id
    const points = parseInt(session.metadata?.points || '0', 10)

    if (!orderId || !userId || !points) {
      console.error('Missing metadata in checkout session')
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
    }

    // 注文ステータス更新
    await supabase
      .from('orders')
      .update({
        status: 'paid',
        stripe_payment_intent_id: session.payment_intent as string,
      })
      .eq('id', orderId)

    // ポイント付与
    await supabase.rpc('add_points', {
      p_user_id: userId,
      p_amount: points,
    })

    // ポイント取引記録
    await supabase.from('point_transactions').insert({
      user_id: userId,
      amount: points,
      type: 'purchase',
      description: `ポイント購入 (${points.toLocaleString()} PT)`,
      stripe_payment_intent_id: session.payment_intent as string,
    })
  }

  return NextResponse.json({ received: true })
}
