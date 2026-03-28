import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'ログインが必要です / Login required' },
      { status: 401 }
    )
  }

  const { gacha_result_id } = await request.json()

  if (!gacha_result_id) {
    return NextResponse.json(
      { error: 'パラメータが不正です / Invalid parameters' },
      { status: 400 }
    )
  }

  // Fetch the gacha result with prize info
  const { data: result } = await supabase
    .from('gacha_results')
    .select('*, prize:prizes(*)')
    .eq('id', gacha_result_id)
    .eq('user_id', user.id)
    .eq('status', 'won')
    .single()

  if (!result) {
    return NextResponse.json(
      { error: '交換対象の景品が見つかりません / Prize not found for exchange' },
      { status: 404 }
    )
  }

  const prize = result.prize
  if (!prize || !prize.exchange_points || prize.exchange_points <= 0) {
    return NextResponse.json(
      { error: 'この景品はポイント交換できません / This prize cannot be exchanged for points' },
      { status: 400 }
    )
  }

  // Update gacha_result status to exchanged
  await supabase
    .from('gacha_results')
    .update({ status: 'exchanged' })
    .eq('id', gacha_result_id)

  // Add points
  await supabase.rpc('add_points', {
    p_user_id: user.id,
    p_amount: prize.exchange_points,
  })

  // Record point transaction
  await supabase.from('point_transactions').insert({
    user_id: user.id,
    amount: prize.exchange_points,
    type: 'exchange',
    description: `景品交換: ${prize.name}`,
  })

  return NextResponse.json({
    exchanged_points: prize.exchange_points,
    message: 'ポイント交換が完了しました',
  })
}
