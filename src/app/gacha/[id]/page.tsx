import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { GachaPlay } from './gacha-play'
import { isDemo } from '@/lib/is-demo'
import { demoGachas, demoPrizes } from '@/lib/demo-data'

const rankColors: Record<string, string> = {
  S: 'from-yellow-400 to-amber-500',
  A: 'from-rose-400 to-pink-500',
  B: 'from-blue-400 to-indigo-500',
  C: 'from-zinc-400 to-zinc-500',
  last_one: 'from-purple-400 to-violet-600',
}

const rankLabels: Record<string, string> = {
  S: 'S賞',
  A: 'A賞',
  B: 'B賞',
  C: 'C賞',
  last_one: 'ラストワン賞',
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function GachaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const demo = isDemo()

  let gacha
  let prizes

  if (demo) {
    gacha = demoGachas.find(g => g.id === id) || null
    prizes = demoPrizes[id] || []
  } else {
    const supabase = await createClient()
    const { data } = await supabase
      .from('gachas')
      .select('*, prizes(*)')
      .eq('id', id)
      .eq('is_active', true)
      .single()
    gacha = data
    prizes = gacha?.prizes?.sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order) || []
  }

  if (!gacha) notFound()

  if (demo) {
    prizes = prizes.sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
  }

  const now = new Date()
  const isUpcoming = gacha.sale_start_at && new Date(gacha.sale_start_at) > now
  const isEnded = gacha.sale_end_at && new Date(gacha.sale_end_at) < now
  const isPlayable = !isUpcoming && !isEnded

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="overflow-hidden rounded-2xl bg-zinc-100">
          {gacha.image_url ? (
            <img src={gacha.image_url} alt={gacha.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex aspect-square items-center justify-center text-6xl text-zinc-300">🎰</div>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900">{gacha.name}</h1>
          {gacha.description && (
            <p className="mt-3 text-zinc-500">{gacha.description}</p>
          )}

          {/* Sale period display */}
          {(gacha.sale_start_at || gacha.sale_end_at) && (
            <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3">
              <p className="text-xs font-medium text-zinc-500">販売期間</p>
              <p className="mt-0.5 text-sm text-zinc-700">
                {gacha.sale_start_at && formatDateTime(gacha.sale_start_at)}
                {gacha.sale_start_at && gacha.sale_end_at && ' 〜 '}
                {gacha.sale_end_at && formatDateTime(gacha.sale_end_at)}
              </p>
            </div>
          )}

          {isUpcoming && (
            <div className="mt-4 rounded-lg bg-amber-50 p-4 text-center text-sm font-medium text-amber-700">
              このガチャは準備中です
            </div>
          )}

          {isEnded && (
            <div className="mt-4 rounded-lg bg-zinc-100 p-4 text-center text-sm font-medium text-zinc-500">
              このガチャの販売は終了しました
            </div>
          )}

          <div className="mt-6 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-blue-600">{gacha.price.toLocaleString()}</span>
            <span className="text-lg font-bold text-blue-600">PT / 1回</span>
          </div>

          {gacha.remaining_count !== null && gacha.total_count && (
            <div className="mt-4">
              <div className="flex justify-between text-sm text-zinc-500">
                <span>残り {gacha.remaining_count} / {gacha.total_count}</span>
                <span>{Math.round(((gacha.total_count - gacha.remaining_count) / gacha.total_count) * 100)}%</span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-zinc-200">
                <div
                  className="h-full rounded-full bg-blue-600"
                  style={{ width: `${((gacha.total_count - gacha.remaining_count) / gacha.total_count) * 100}%` }}
                />
              </div>
            </div>
          )}

          {gacha.pity_count && (
            <p className="mt-3 text-xs text-zinc-400">
              天井: {gacha.pity_count}回ごとにレア確定
            </p>
          )}

          {gacha.min_total_spent && gacha.min_total_spent > 0 && (
            <p className="mt-2 text-xs text-amber-600">
              累計{gacha.min_total_spent.toLocaleString()}PT以上の購入者限定
            </p>
          )}

          {isPlayable && <GachaPlay gachaId={gacha.id} price={gacha.price} isDemo={demo} retryCost={gacha.retry_cost} />}
        </div>
      </div>

      <section className="mt-12">
        <h2 className="text-xl font-bold text-zinc-900">景品一覧</h2>
        <div className="mt-4 mb-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
          <span className="text-lg">💎</span>
          <p className="text-sm font-medium text-emerald-700">
            すべてのパックに購入額以上の価値の商品が含まれています
          </p>
        </div>
        <div className="mt-4 grid gap-3">
          {prizes.map((prize: { id: string; rank: string; name: string; description: string | null; image_url: string | null; probability: number; stock: number }) => (
            <div
              key={prize.id}
              className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-4"
            >
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${rankColors[prize.rank]} text-sm font-extrabold text-white`}>
                {rankLabels[prize.rank]}
              </div>
              {prize.image_url && (
                <img src={prize.image_url} alt={prize.name} className="h-16 w-16 rounded-lg object-cover" />
              )}
              <div className="flex-1">
                <h3 className="font-bold text-zinc-900">{prize.name}</h3>
                {prize.description && (
                  <p className="text-sm text-zinc-500">{prize.description}</p>
                )}
              </div>
              <div className="text-right text-xs text-zinc-400">
                <div>残り {prize.stock}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
