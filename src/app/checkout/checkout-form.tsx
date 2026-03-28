'use client'

import { useState } from 'react'
import type { PointPackage } from '@/types/database'

export function CheckoutForm({ packages }: { packages: PointPackage[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    if (!selectedId) return
    setLoading(true)

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ package_id: selectedId }),
      })

      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      alert('エラーが発生しました / An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-8">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {packages.map((pkg) => (
          <button
            key={pkg.id}
            onClick={() => setSelectedId(pkg.id)}
            className={`rounded-xl border-2 p-4 text-center transition ${
              selectedId === pkg.id
                ? 'border-blue-600 bg-blue-50'
                : 'border-zinc-200 bg-white hover:border-zinc-300'
            }`}
          >
            <span className="block text-2xl font-extrabold text-zinc-900">
              {pkg.points.toLocaleString()}
            </span>
            <span className="text-sm font-bold text-blue-600">PT</span>
            <span className="mt-2 block text-sm text-zinc-500">
              ¥{pkg.price.toLocaleString()}
            </span>
          </button>
        ))}
      </div>

      <button
        onClick={handleCheckout}
        disabled={!selectedId || loading}
        className="mt-6 w-full rounded-xl bg-blue-600 py-4 text-lg font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? '処理中...' : '購入する'}
      </button>

      <p className="mt-4 text-center text-xs text-zinc-400">
        決済は購入時に即時請求されます
      </p>
    </div>
  )
}
