import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createKomojuSession } from '@/lib/komoju'
import type { KomojuPaymentMethod } from '@/lib/komoju'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'ログインが必要です / Login required' },
      { status: 401 }
    )
  }

  const { package_id, payment_method } = await request.json()

  const validMethods: KomojuPaymentMethod[] = ['konbini', 'paypay', 'bank_transfer']
  if (!validMethods.includes(payment_method)) {
    return NextResponse.json(
      { error: '無効な決済方法です / Invalid payment method' },
      { status: 400 }
    )
  }

  const { data: pkg } = await supabase
    .from('point_packages')
    .select('*')
    .eq('id', package_id)
    .eq('is_active', true)
    .single()

  if (!pkg) {
    return NextResponse.json(
      { error: 'パッケージが見つかりません / Package not found' },
      { status: 404 }
    )
  }

  // Create order record
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

  try {
    const session = await createKomojuSession({
      amount: pkg.price,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?komoju_session_id={SESSION_ID}`,
      payment_methods: [payment_method],
      metadata: {
        order_id: order?.id || '',
        user_id: user.id,
        points: pkg.points.toString(),
      },
    })

    return NextResponse.json({ url: session.session_url })
  } catch (err) {
    console.error('KOMOJU session creation error:', err)
    return NextResponse.json(
      { error: 'KOMOJU決済セッションの作成に失敗しました / Failed to create KOMOJU payment session' },
      { status: 500 }
    )
  }
}
