import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { package_id } = await request.json()

  const { data: pkg } = await supabase
    .from('point_packages')
    .select('*')
    .eq('id', package_id)
    .eq('is_active', true)
    .single()

  if (!pkg) {
    return NextResponse.json({ error: 'Package not found' }, { status: 404 })
  }

  // 注文レコード作成
  const { data: order } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      point_package_id: pkg.id,
      amount: pkg.price,
      points: pkg.points,
      status: 'pending',
    })
    .select()
    .single()

  // Stripe Checkout Session 作成
  const stripe = getStripe()
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'jpy',
          product_data: {
            name: pkg.name,
            description: `${pkg.points.toLocaleString()} ポイント`,
          },
          unit_amount: pkg.price,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout`,
    metadata: {
      order_id: order?.id,
      user_id: user.id,
      points: pkg.points.toString(),
    },
  })

  // 注文にセッションID紐付け
  if (order) {
    await supabase
      .from('orders')
      .update({ stripe_checkout_session_id: session.id })
      .eq('id', order.id)
  }

  return NextResponse.json({ url: session.url })
}
