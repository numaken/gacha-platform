import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { isDemo } from '@/lib/is-demo'
import { demoProfile } from '@/lib/demo-data'
import { RANK_DEFINITIONS, getUserRank, getNextRank, getAmountToNextRank, RANK_COLORS } from '@/lib/ranks'

export default async function RankPage() {
  const demo = isDemo()

  let totalSpent = 0

  if (demo) {
    totalSpent = demoProfile.total_spent
  } else {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase
      .from('profiles')
      .select('total_spent')
      .eq('id', user.id)
      .single()

    totalSpent = profile?.total_spent || 0
  }

  const currentRank = getUserRank(totalSpent)
  const nextRank = getNextRank(totalSpent)
  const amountToNext = getAmountToNextRank(totalSpent)

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">VIPランク</h1>
        <Link
          href="/mypage"
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          マイページに戻る
        </Link>
      </div>

      {demo && (
        <div className="mt-4 rounded-lg bg-amber-50 p-3 text-center text-sm font-medium text-amber-600">
          デモモードです。表示はサンプルデータです。
        </div>
      )}

      {/* Current rank */}
      <div className={`mt-6 rounded-2xl border-2 ${RANK_COLORS[currentRank.name].border} ${RANK_COLORS[currentRank.name].bg} p-6`}>
        <p className="text-sm font-medium text-zinc-500">現在のランク</p>
        <div className="mt-2 flex items-center gap-3">
          <span className={`rounded-full ${RANK_COLORS[currentRank.name].badge} px-4 py-1.5 text-lg font-bold text-white`}>
            {currentRank.display_name}
          </span>
          <div>
            <p className="text-sm text-zinc-600">累計課金額: {totalSpent.toLocaleString()}円</p>
            {amountToNext !== null && nextRank ? (
              <p className="text-xs text-zinc-400">
                次のランク「{nextRank.display_name}」まであと {amountToNext.toLocaleString()}円
              </p>
            ) : (
              <p className="text-xs text-zinc-400">最高ランクに到達しています</p>
            )}
          </div>
        </div>
        {amountToNext !== null && nextRank && (
          <div className="mt-4">
            <div className="h-2 rounded-full bg-white/60">
              <div
                className={`h-2 rounded-full ${RANK_COLORS[currentRank.name].badge} transition-all`}
                style={{
                  width: `${Math.min(100, ((totalSpent - currentRank.min_spent) / (nextRank.min_spent - currentRank.min_spent)) * 100)}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* All ranks */}
      <section className="mt-10">
        <h2 className="text-lg font-bold text-zinc-900">ランク一覧</h2>
        <div className="mt-4 space-y-3">
          {RANK_DEFINITIONS.map((rank) => {
            const isCurrent = rank.name === currentRank.name
            const colors = RANK_COLORS[rank.name]
            return (
              <div
                key={rank.id}
                className={`rounded-xl border-2 p-4 transition ${
                  isCurrent ? `${colors.border} ${colors.bg}` : 'border-zinc-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full ${colors.badge} px-3 py-1 text-sm font-bold text-white`}>
                      {rank.display_name}
                    </span>
                    {isCurrent && (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">
                        現在のランク
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-zinc-500">
                    {rank.min_spent > 0 ? `${rank.min_spent.toLocaleString()}円~` : '初期ランク'}
                  </span>
                </div>
                <div className="mt-3 flex gap-6 text-sm">
                  <div>
                    <span className="text-zinc-400">ポイントボーナス</span>
                    <span className={`ml-2 font-bold ${rank.point_bonus_rate > 0 ? 'text-green-600' : 'text-zinc-400'}`}>
                      {rank.point_bonus_rate > 0 ? `+${rank.point_bonus_rate}%` : 'なし'}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-400">ガチャ割引</span>
                    <span className={`ml-2 font-bold ${rank.gacha_discount_rate > 0 ? 'text-blue-600' : 'text-zinc-400'}`}>
                      {rank.gacha_discount_rate > 0 ? `${rank.gacha_discount_rate}% OFF` : 'なし'}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
