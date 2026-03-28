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
      { error: 'リザルトIDが必要です / Result ID required' },
      { status: 400 }
    )
  }

  // Fetch the original result
  const { data: originalResult } = await supabase
    .from('gacha_results')
    .select('*, gacha:gachas(*)')
    .eq('id', gacha_result_id)
    .eq('user_id', user.id)
    .single()

  if (!originalResult) {
    return NextResponse.json(
      { error: '結果が見つかりません / Result not found' },
      { status: 404 }
    )
  }

  if (originalResult.retried) {
    return NextResponse.json(
      { error: 'すでにリトライ済みです / Already retried' },
      { status: 400 }
    )
  }

  if (originalResult.status !== 'won') {
    return NextResponse.json(
      { error: '発送済み・交換済みの景品はリトライできません / Cannot retry shipped or exchanged prizes' },
      { status: 400 }
    )
  }

  const gacha = originalResult.gacha
  if (!gacha || !gacha.retry_cost) {
    return NextResponse.json(
      { error: 'このガチャはリトライ不可です / Retry not available for this gacha' },
      { status: 400 }
    )
  }

  const retryCost = gacha.retry_cost

  // Check point balance
  const { data: profile } = await supabase
    .from('profiles')
    .select('point_balance')
    .eq('id', user.id)
    .single()

  if (!profile || profile.point_balance < retryCost) {
    return NextResponse.json(
      { error: 'ポイントが不足しています / Insufficient points' },
      { status: 400 }
    )
  }

  // Mark original result as retried
  await supabase
    .from('gacha_results')
    .update({ retried: true })
    .eq('id', gacha_result_id)

  // Consume points for retry
  await supabase.rpc('consume_points', {
    p_user_id: user.id,
    p_amount: retryCost,
  })

  // Point transaction record
  await supabase.from('point_transactions').insert({
    user_id: user.id,
    amount: -retryCost,
    type: 'gacha',
    description: 'ガチャリトライ',
  })

  // Fetch available prizes
  const { data: allPrizes } = await supabase
    .from('prizes')
    .select('*')
    .eq('gacha_id', gacha.id)
    .gt('stock', 0)
    .eq('is_last_one', false)

  const availablePrizes = (allPrizes || []).filter(
    (p: { probability: number; stock: number }) => p.probability > 0 && p.stock > 0
  )

  if (availablePrizes.length === 0) {
    return NextResponse.json(
      { error: '景品がすべてなくなりました / All prizes are gone' },
      { status: 400 }
    )
  }

  // Weighted random selection
  const totalProb = availablePrizes.reduce(
    (sum: number, p: { probability: number }) => sum + Number(p.probability),
    0
  )
  let rand = Math.random() * totalProb
  let selectedPrize = availablePrizes[0]

  for (const prize of availablePrizes) {
    rand -= Number(prize.probability)
    if (rand <= 0) {
      selectedPrize = prize
      break
    }
  }

  // Decrease prize stock
  await supabase
    .from('prizes')
    .update({ stock: selectedPrize.stock - 1 })
    .eq('id', selectedPrize.id)

  // Record new result
  await supabase.from('gacha_results').insert({
    user_id: user.id,
    gacha_id: gacha.id,
    prize_id: selectedPrize.id,
    points_spent: retryCost,
  })

  return NextResponse.json({
    prize: {
      id: selectedPrize.id,
      name: selectedPrize.name,
      rank: selectedPrize.rank,
      description: selectedPrize.description,
      image_url: selectedPrize.image_url,
      probability: selectedPrize.probability,
      is_last_one: selectedPrize.is_last_one,
      exchange_points: selectedPrize.exchange_points,
    },
  })
}
