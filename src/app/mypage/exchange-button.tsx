'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function ExchangeButton({
  gachaResultId,
  exchangePoints,
}: {
  gachaResultId: string
  exchangePoints: number
}) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleExchange = async () => {
    if (!confirm(`${exchangePoints.toLocaleString()} PTに交換しますか？この操作は取り消せません。`)) {
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/gacha/exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gacha_result_id: gachaResultId }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || 'エラーが発生しました / An error occurred')
        return
      }

      router.refresh()
    } catch {
      alert('通信エラーが発生しました / Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleExchange}
      disabled={loading}
      className="rounded-lg bg-purple-100 px-3 py-1.5 text-xs font-bold text-purple-700 transition hover:bg-purple-200 disabled:opacity-50"
    >
      {loading ? '交換中...' : `${exchangePoints} PTに交換`}
    </button>
  )
}
