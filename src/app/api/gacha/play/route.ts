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

  const { gacha_id, count = 1 } = await request.json()

  // count validation
  const playCount = count === 10 ? 10 : 1

  // Fetch gacha info
  const { data: gacha } = await supabase
    .from('gachas')
    .select('*')
    .eq('id', gacha_id)
    .eq('is_active', true)
    .single()

  if (!gacha) {
    return NextResponse.json(
      { error: 'ガチャが見つかりません / Gacha not found' },
      { status: 404 }
    )
  }

  // Sale period check
  const now = new Date()
  if (gacha.sale_start_at && new Date(gacha.sale_start_at) > now) {
    return NextResponse.json(
      { error: 'このガチャはまだ販売開始前です / This gacha has not started yet' },
      { status: 400 }
    )
  }
  if (gacha.sale_end_at && new Date(gacha.sale_end_at) < now) {
    return NextResponse.json(
      { error: 'このガチャの販売は終了しました / This gacha has ended' },
      { status: 400 }
    )
  }

  // Remaining count check
  if (gacha.remaining_count !== null && gacha.remaining_count < playCount) {
    return NextResponse.json(
      { error: 'このガチャの残数が足りません / Not enough remaining plays' },
      { status: 400 }
    )
  }

  const totalCost = gacha.price * playCount

  // Point balance check
  const { data: profile } = await supabase
    .from('profiles')
    .select('point_balance')
    .eq('id', user.id)
    .single()

  if (!profile || profile.point_balance < totalCost) {
    return NextResponse.json(
      { error: 'ポイントが不足しています / Insufficient points' },
      { status: 400 }
    )
  }

  // Min total spent check (whales only)
  if (gacha.min_total_spent && gacha.min_total_spent > 0) {
    const { data: totalSpentData } = await supabase
      .from('orders')
      .select('amount')
      .eq('user_id', user.id)
      .eq('status', 'paid')

    const totalSpent = totalSpentData?.reduce((sum: number, o: { amount: number }) => sum + o.amount, 0) || 0
    if (totalSpent < gacha.min_total_spent) {
      return NextResponse.json(
        { error: `累計${gacha.min_total_spent.toLocaleString()}PT以上の購入が必要です / Requires ${gacha.min_total_spent.toLocaleString()} PT total spending` },
        { status: 400 }
      )
    }
  }

  // Daily limit check
  if (gacha.type === 'daily' && gacha.daily_limit) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { count: todayCount } = await supabase
      .from('gacha_results')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('gacha_id', gacha_id)
      .gte('created_at', today.toISOString())

    if (todayCount && (todayCount + playCount) > gacha.daily_limit) {
      return NextResponse.json(
        { error: '本日の上限に達しました / Daily limit reached' },
        { status: 400 }
      )
    }
  }

  // Get user's play count for this gacha (for pity system)
  let userPlayCount = 0
  if (gacha.pity_count && gacha.pity_rank) {
    const { count: playedCount } = await supabase
      .from('gacha_results')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('gacha_id', gacha_id)

    userPlayCount = playedCount || 0
  }

  // Get user's already-won prize IDs (for once_per_user)
  const { data: wonResults } = await supabase
    .from('gacha_results')
    .select('prize_id')
    .eq('user_id', user.id)
    .eq('gacha_id', gacha_id)

  const wonPrizeIds = new Set(wonResults?.map((r: { prize_id: string }) => r.prize_id) || [])

  // Fetch prizes (in stock, not last_one)
  const { data: allPrizes } = await supabase
    .from('prizes')
    .select('*')
    .eq('gacha_id', gacha_id)
    .gt('stock', 0)
    .eq('is_last_one', false)

  // Last one prize
  const { data: lastOnePrize } = await supabase
    .from('prizes')
    .select('*')
    .eq('gacha_id', gacha_id)
    .eq('is_last_one', true)
    .gt('stock', 0)
    .single()

  const results: Array<{
    id: string
    name: string
    rank: string
    description: string | null
    image_url: string | null
    probability: number
    is_last_one: boolean
    exchange_points: number | null
  }> = []

  // Track won prize IDs during this batch (for once_per_user within same request)
  const batchWonPrizeIds = new Set<string>()
  // Track stock changes locally
  const stockChanges = new Map<string, number>()

  for (let i = 0; i < playCount; i++) {
    // Build available prizes list (filter once_per_user and stock)
    let availablePrizes = (allPrizes || []).filter((p: { id: string; once_per_user: boolean; stock: number }) => {
      const localStockChange = stockChanges.get(p.id) || 0
      const currentStock = p.stock - localStockChange
      if (currentStock <= 0) return false
      if (p.once_per_user && (wonPrizeIds.has(p.id) || batchWonPrizeIds.has(p.id))) return false
      return true
    })

    // Pity system: check if this play triggers pity
    const currentPlayNumber = userPlayCount + i + 1
    let isPity = false
    if (gacha.pity_count && gacha.pity_rank && currentPlayNumber % gacha.pity_count === 0) {
      isPity = true
    }

    if (isPity && gacha.pity_rank) {
      // Filter to pity rank prizes only
      const pityPrizes = availablePrizes.filter((p: { rank: string }) => p.rank === gacha.pity_rank)
      if (pityPrizes.length > 0) {
        availablePrizes = pityPrizes
      }
      // If no pity rank prizes available, fall through to normal draw
    }

    if (availablePrizes.length === 0) {
      // Check last one prize
      if (lastOnePrize) {
        const localStockChange = stockChanges.get(lastOnePrize.id) || 0
        if (lastOnePrize.stock - localStockChange > 0) {
          await awardSinglePrize(supabase, user.id, gacha, lastOnePrize)
          stockChanges.set(lastOnePrize.id, localStockChange + 1)
          batchWonPrizeIds.add(lastOnePrize.id)
          results.push(formatPrize(lastOnePrize))
          continue
        }
      }
      // No prizes available at all - refund remaining plays
      break
    }

    // Weighted random selection
    const totalProb = availablePrizes.reduce((sum: number, p: { probability: number }) => sum + Number(p.probability), 0)
    let rand = Math.random() * totalProb
    let selectedPrize = availablePrizes[0]

    for (const prize of availablePrizes) {
      rand -= Number(prize.probability)
      if (rand <= 0) {
        selectedPrize = prize
        break
      }
    }

    await awardSinglePrize(supabase, user.id, gacha, selectedPrize)
    const localStockChange = stockChanges.get(selectedPrize.id) || 0
    stockChanges.set(selectedPrize.id, localStockChange + 1)
    batchWonPrizeIds.add(selectedPrize.id)
    results.push(formatPrize(selectedPrize))
  }

  if (results.length === 0) {
    return NextResponse.json(
      { error: '景品がすべてなくなりました / All prizes are gone' },
      { status: 400 }
    )
  }

  return NextResponse.json({
    prizes: results,
    count: results.length,
  })
}

function formatPrize(prize: {
  id: string
  name: string
  rank: string
  description: string | null
  image_url: string | null
  probability: number
  is_last_one: boolean
  exchange_points: number | null
}) {
  return {
    id: prize.id,
    name: prize.name,
    rank: prize.rank,
    description: prize.description,
    image_url: prize.image_url,
    probability: prize.probability,
    is_last_one: prize.is_last_one,
    exchange_points: prize.exchange_points,
  }
}

async function awardSinglePrize(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  gacha: { id: string; price: number; remaining_count: number | null },
  prize: { id: string; stock: number }
) {
  // Consume points
  await supabase.rpc('consume_points', {
    p_user_id: userId,
    p_amount: gacha.price,
  })

  // Point transaction record
  await supabase.from('point_transactions').insert({
    user_id: userId,
    amount: -gacha.price,
    type: 'gacha',
    description: 'ガチャ実行',
  })

  // Decrease prize stock
  await supabase
    .from('prizes')
    .update({ stock: prize.stock - 1 })
    .eq('id', prize.id)

  // Decrease gacha remaining count
  if (gacha.remaining_count !== null) {
    await supabase
      .from('gachas')
      .update({ remaining_count: gacha.remaining_count - 1 })
      .eq('id', gacha.id)
    gacha.remaining_count--
  }

  // Record result
  await supabase.from('gacha_results').insert({
    user_id: userId,
    gacha_id: gacha.id,
    prize_id: prize.id,
    points_spent: gacha.price,
  })
}
