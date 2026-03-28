import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyKomojuWebhook } from '@/lib/komoju'

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('x-komoju-signature') || ''

  if (!verifyKomojuWebhook(body, signature)) {
    console.error('KOMOJU webhook signature verification failed')
    return NextResponse.json(
      { error: '署名の検証に失敗しました / Invalid signature' },
      { status: 400 }
    )
  }

  const event = JSON.parse(body)

  if (event.type === 'payment.captured') {
    const payment = event.data
    const metadata = payment.metadata || {}
    const orderId = metadata.order_id
    const userId = metadata.user_id
    const points = parseInt(metadata.points || '0', 10)

    if (!orderId || !userId || !points) {
      console.error('Missing metadata in KOMOJU webhook')
      return NextResponse.json(
        { error: 'メタデータが不足しています / Missing metadata' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()

    // Update order status
    await supabase
      .from('orders')
      .update({ status: 'paid' })
      .eq('id', orderId)

    // Add points
    await supabase.rpc('add_points', {
      p_user_id: userId,
      p_amount: points,
    })

    // Update total_spent
    await supabase.rpc('add_points', {
      p_user_id: userId,
      p_amount: 0,
    })

    // Manually update total_spent
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('total_spent')
      .eq('id', userId)
      .single()

    const currentTotalSpent = currentProfile?.total_spent || 0
    const orderAmount = payment.amount || 0

    await supabase
      .from('profiles')
      .update({ total_spent: currentTotalSpent + orderAmount })
      .eq('id', userId)

    // Point transaction record
    await supabase.from('point_transactions').insert({
      user_id: userId,
      amount: points,
      type: 'purchase',
      description: `ポイント購入 (${points.toLocaleString()} PT) - KOMOJU`,
    })
  }

  return NextResponse.json({ received: true })
}
