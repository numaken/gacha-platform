import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ExchangeButton } from './exchange-button'
import { isDemo } from '@/lib/is-demo'
import { demoProfile, demoGachaResults, demoTransactions } from '@/lib/demo-data'
import { getUserRank, getNextRank, getAmountToNextRank, RANK_COLORS } from '@/lib/ranks'

const rankLabels: Record<string, string> = {
  S: 'S賞', A: 'A賞', B: 'B賞', C: 'C賞', last_one: 'ラストワン',
}

const rankColors: Record<string, string> = {
  S: 'bg-amber-100 text-amber-700',
  A: 'bg-rose-100 text-rose-700',
  B: 'bg-blue-100 text-blue-700',
  C: 'bg-zinc-100 text-zinc-700',
  last_one: 'bg-purple-100 text-purple-700',
}

export default async function MyPage() {
  const demo = isDemo()

  let profile
  let results
  let transactions

  if (demo) {
    profile = demoProfile
    results = demoGachaResults
    transactions = demoTransactions
  } else {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    profile = profileData

    const { data: resultsData } = await supabase
      .from('gacha_results')
      .select('*, prize:prizes(*), gacha:gachas(name)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)
    results = resultsData

    const { data: txData } = await supabase
      .from('point_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)
    transactions = txData
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">マイページ</h1>
        <Link
          href="/mypage/profile"
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50"
        >
          プロフィール編集
        </Link>
      </div>

      {demo && (
        <div className="mt-4 rounded-lg bg-amber-50 p-3 text-center text-sm font-medium text-amber-600">
          デモモードです。表示はサンプルデータです。
        </div>
      )}

      {/* Point balance + Rank */}
      <div className="mt-6 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm opacity-80">ポイント残高</p>
            <p className="mt-1 text-4xl font-extrabold">
              {(profile?.point_balance || 0).toLocaleString()} <span className="text-lg">PT</span>
            </p>
          </div>
          {(() => {
            const rank = getUserRank(profile?.total_spent || 0)
            const colors = RANK_COLORS[rank.name]
            return (
              <Link href="/mypage/rank" className={`rounded-full ${colors.badge} px-4 py-1.5 text-sm font-bold text-white transition hover:opacity-90`}>
                {rank.display_name}
              </Link>
            )
          })()}
        </div>
        {(() => {
          const amountToNext = getAmountToNextRank(profile?.total_spent || 0)
          const nextRank = getNextRank(profile?.total_spent || 0)
          if (amountToNext !== null && nextRank) {
            return (
              <p className="mt-2 text-xs opacity-70">
                次のランク「{nextRank.display_name}」まであと {amountToNext.toLocaleString()}円
              </p>
            )
          }
          return (
            <p className="mt-2 text-xs opacity-70">最高ランクに到達しています</p>
          )
        })()}
        <Link
          href="/checkout"
          className="mt-4 inline-block rounded-full bg-white/20 px-6 py-2 text-sm font-bold backdrop-blur transition hover:bg-white/30"
        >
          ポイントを購入する
        </Link>
      </div>

      {/* Won prizes */}
      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-900">獲得した景品</h2>
          <Link href="/mypage/shipping" className="text-sm text-blue-600 hover:text-blue-700">
            発送依頼 →
          </Link>
        </div>

        {results && results.length > 0 ? (
          <div className="mt-4 space-y-3">
            {results.map((result: {
              id: string
              created_at: string
              status: string
              prize: {
                rank: string
                name: string
                image_url: string | null
                exchange_points: number | null
              } | null
              gacha: { name: string } | null
            }) => (
              <div key={result.id} className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-4">
                {result.prize?.image_url && (
                  <img src={result.prize.image_url} alt="" className="h-14 w-14 rounded-lg object-cover" />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${rankColors[result.prize?.rank || 'C']}`}>
                      {rankLabels[result.prize?.rank || 'C']}
                    </span>
                    <span className="font-bold text-zinc-900">{result.prize?.name}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-zinc-400">
                    {result.gacha?.name} ・ {new Date(result.created_at).toLocaleDateString('ja-JP')}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {!demo && result.status === 'won' && result.prize?.exchange_points && result.prize.exchange_points > 0 && (
                    <ExchangeButton
                      gachaResultId={result.id}
                      exchangePoints={result.prize.exchange_points}
                    />
                  )}
                  <span className={`text-xs font-medium ${
                    result.status === 'won' ? 'text-amber-600' :
                    result.status === 'shipped' ? 'text-blue-600' :
                    result.status === 'exchanged' ? 'text-purple-600' : 'text-green-600'
                  }`}>
                    {result.status === 'won' ? '未発送' :
                     result.status === 'shipped' ? '発送済' :
                     result.status === 'exchanged' ? '交換済' : '配達完了'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-zinc-300 py-10 text-center text-zinc-400">
            まだ景品がありません
          </div>
        )}
      </section>

      {/* Point history */}
      <section className="mt-10">
        <h2 className="text-lg font-bold text-zinc-900">ポイント履歴</h2>
        {transactions && transactions.length > 0 ? (
          <div className="mt-4 space-y-2">
            {transactions.map((tx: { id: string; amount: number; type: string; description: string | null; created_at: string }) => (
              <div key={tx.id} className="flex items-center justify-between rounded-lg border border-zinc-100 bg-white px-4 py-3">
                <div>
                  <p className="text-sm text-zinc-700">{tx.description || tx.type}</p>
                  <p className="text-xs text-zinc-400">
                    {new Date(tx.created_at).toLocaleDateString('ja-JP', {
                      year: 'numeric', month: '2-digit', day: '2-digit',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
                <span className={`font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()} PT
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-zinc-300 py-10 text-center text-zinc-400">
            履歴がありません
          </div>
        )}
      </section>
    </div>
  )
}
