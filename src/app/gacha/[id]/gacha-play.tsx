'use client'

import { useState } from 'react'
import { pickRandomDemoPrize } from '@/lib/demo-data'

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

interface PrizeResult {
  id: string
  name: string
  rank: string
  description: string | null
  image_url: string | null
  probability: number
  is_last_one: boolean
  exchange_points: number | null
}

type PlayState = 'idle' | 'confirming' | 'playing' | 'result'

export function GachaPlay({ gachaId, price, isDemo = false }: { gachaId: string; price: number; isDemo?: boolean }) {
  const [state, setState] = useState<PlayState>('idle')
  const [results, setResults] = useState<PrizeResult[]>([])
  const [error, setError] = useState('')
  const [playCount, setPlayCount] = useState(1)

  const handlePlay = async () => {
    setState('playing')
    setError('')

    try {
      if (isDemo) {
        // Demo mode: pick random prizes locally
        await new Promise(resolve => setTimeout(resolve, 2000))

        const prizes: PrizeResult[] = []
        for (let i = 0; i < playCount; i++) {
          const prize = pickRandomDemoPrize(gachaId)
          if (prize) {
            prizes.push({
              id: prize.id,
              name: prize.name,
              rank: prize.rank,
              description: prize.description,
              image_url: prize.image_url,
              probability: prize.probability,
              is_last_one: prize.is_last_one,
              exchange_points: prize.exchange_points,
            })
          }
        }

        if (prizes.length === 0) {
          setError('景品がありません / No prizes available')
          setState('idle')
          return
        }

        setResults(prizes)
        setState('result')
        return
      }

      const res = await fetch('/api/gacha/play', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gacha_id: gachaId, count: playCount }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'エラーが発生しました / An error occurred')
        setState('idle')
        return
      }

      // Animation wait
      await new Promise(resolve => setTimeout(resolve, 2000))

      setResults(data.prizes || [])
      setState('result')
    } catch {
      setError('通信エラーが発生しました / Network error')
      setState('idle')
    }
  }

  const handleReset = () => {
    setState('idle')
    setResults([])
    setError('')
  }

  const openConfirm = (count: number) => {
    setPlayCount(count)
    setState('confirming')
  }

  return (
    <>
      <div className="mt-6">
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}

        {isDemo && state === 'idle' && (
          <div className="mb-4 rounded-lg bg-amber-50 p-3 text-center text-xs font-medium text-amber-600">
            デモモード: 実際の決済は発生しません
          </div>
        )}

        {state === 'idle' && (
          <div className="space-y-3">
            <button
              onClick={() => openConfirm(1)}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 py-4 text-lg font-bold text-white shadow-lg transition hover:shadow-xl active:scale-[0.98]"
            >
              {price.toLocaleString()} PT で回す
            </button>
            <button
              onClick={() => openConfirm(10)}
              className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 py-4 text-lg font-bold text-white shadow-lg transition hover:shadow-xl active:scale-[0.98]"
            >
              {(price * 10).toLocaleString()} PT で10連ガチャ
            </button>
          </div>
        )}
      </div>

      {/* Confirm modal */}
      {state === 'confirming' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6">
            <h3 className="text-center text-lg font-bold text-zinc-900">確認</h3>
            <p className="mt-3 text-center text-zinc-600">
              <span className="text-2xl font-extrabold text-blue-600">{(price * playCount).toLocaleString()} PT</span>
              <br />を消費して{playCount === 10 ? '10連' : ''}ガチャを回しますか？
            </p>
            {isDemo && (
              <p className="mt-2 text-center text-xs text-amber-600">デモモード: 実際の消費はありません</p>
            )}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setState('idle')}
                className="flex-1 rounded-xl border border-zinc-300 py-3 text-sm font-bold text-zinc-600 transition hover:bg-zinc-50"
              >
                キャンセル
              </button>
              <button
                onClick={handlePlay}
                className="flex-1 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
              >
                回す
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Playing animation */}
      {state === 'playing' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="text-center">
            <div className="mx-auto h-24 w-24 animate-spin rounded-full border-4 border-blue-300 border-t-blue-600" />
            <p className="mt-6 text-xl font-bold text-white">抽選中...</p>
          </div>
        </div>
      )}

      {/* Results display */}
      {state === 'result' && results.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4">
          <div className="w-full max-w-lg">
            {results.length === 1 ? (
              // Single result
              <div className="overflow-hidden rounded-2xl bg-white">
                <div className={`bg-gradient-to-br ${rankColors[results[0].rank]} p-6 text-center`}>
                  <span className="text-4xl font-extrabold text-white">
                    {rankLabels[results[0].rank]}
                  </span>
                </div>
                <div className="p-6 text-center">
                  {results[0].image_url && (
                    <img
                      src={results[0].image_url}
                      alt={results[0].name}
                      className="mx-auto mb-4 h-40 w-40 rounded-xl object-cover"
                    />
                  )}
                  <h3 className="text-xl font-bold text-zinc-900">{results[0].name}</h3>
                  {results[0].description && (
                    <p className="mt-2 text-sm text-zinc-500">{results[0].description}</p>
                  )}
                  <button
                    onClick={handleReset}
                    className="mt-6 w-full rounded-xl bg-zinc-900 py-3 text-sm font-bold text-white transition hover:bg-zinc-800"
                  >
                    閉じる
                  </button>
                </div>
              </div>
            ) : (
              // Multi result (10連)
              <div className="rounded-2xl bg-white p-6">
                <h3 className="mb-4 text-center text-xl font-bold text-zinc-900">
                  {results.length}連ガチャ結果
                </h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {results.map((prize, idx) => (
                    <div key={idx} className="overflow-hidden rounded-xl border border-zinc-200">
                      <div className={`bg-gradient-to-br ${rankColors[prize.rank]} px-3 py-1.5 text-center`}>
                        <span className="text-sm font-extrabold text-white">
                          {rankLabels[prize.rank]}
                        </span>
                      </div>
                      <div className="p-3 text-center">
                        {prize.image_url && (
                          <img
                            src={prize.image_url}
                            alt={prize.name}
                            className="mx-auto mb-2 h-16 w-16 rounded-lg object-cover"
                          />
                        )}
                        <p className="text-xs font-bold text-zinc-900 line-clamp-2">{prize.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleReset}
                  className="mt-6 w-full rounded-xl bg-zinc-900 py-3 text-sm font-bold text-white transition hover:bg-zinc-800"
                >
                  閉じる
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
