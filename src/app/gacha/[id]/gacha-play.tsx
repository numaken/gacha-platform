'use client'

import { useState, useCallback } from 'react'
import { pickRandomDemoPrize } from '@/lib/demo-data'
import { Countdown, CardReveal, MultiReveal } from '@/components/gacha/gacha-animation'

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

type PlayState = 'idle' | 'confirming' | 'countdown' | 'playing' | 'result'

export function GachaPlay({ gachaId, price, isDemo = false }: { gachaId: string; price: number; isDemo?: boolean }) {
  const [state, setState] = useState<PlayState>('idle')
  const [results, setResults] = useState<PrizeResult[]>([])
  const [error, setError] = useState('')
  const [playCount, setPlayCount] = useState(1)

  const handlePlay = useCallback(async () => {
    setState('playing')
    setError('')

    try {
      if (isDemo) {
        await new Promise(resolve => setTimeout(resolve, 1500))

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

      setResults(data.prizes || [])
      setState('result')
    } catch {
      setError('通信エラーが発生しました / Network error')
      setState('idle')
    }
  }, [isDemo, playCount, gachaId])

  const handleReset = () => {
    setState('idle')
    setResults([])
    setError('')
  }

  const openConfirm = (count: number) => {
    setPlayCount(count)
    setState('confirming')
  }

  const startCountdown = () => {
    setState('countdown')
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
              {(price * 10).toLocaleString()} PT で10連
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
              <br />を消費して{playCount === 10 ? '10連' : ''}回しますか？
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
                onClick={startCountdown}
                className="flex-1 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
              >
                回す
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Countdown */}
      {state === 'countdown' && (
        <Countdown onComplete={handlePlay} />
      )}

      {/* Playing animation */}
      {state === 'playing' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
          <div className="text-center">
            <div className="relative mx-auto h-32 w-32">
              <div className="absolute inset-0 animate-spin rounded-full border-4 border-blue-300 border-t-blue-600" />
              <div className="absolute inset-2 animate-spin rounded-full border-4 border-amber-300 border-b-amber-600" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
              <div className="absolute inset-4 animate-pulse rounded-full bg-white/10" />
            </div>
            <p className="mt-6 text-xl font-bold text-white animate-pulse">開封中...</p>
          </div>
        </div>
      )}

      {/* Results */}
      {state === 'result' && results.length === 1 && (
        <CardReveal
          rank={results[0].rank}
          prizeName={results[0].name}
          prizeImage={results[0].image_url}
          prizeDescription={results[0].description}
          onClose={handleReset}
        />
      )}

      {state === 'result' && results.length > 1 && (
        <MultiReveal
          results={results}
          onClose={handleReset}
        />
      )}
    </>
  )
}
