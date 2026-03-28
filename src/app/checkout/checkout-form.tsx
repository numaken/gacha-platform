'use client'

import { useState } from 'react'
import type { PointPackage } from '@/types/database'

type PaymentMethod = 'card' | 'konbini' | 'paypay' | 'bank_transfer'

const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: string }[] = [
  { id: 'card', label: 'クレジットカード', icon: '💳' },
  { id: 'konbini', label: 'コンビニ決済', icon: '🏪' },
  { id: 'paypay', label: 'PayPay', icon: '📱' },
  { id: 'bank_transfer', label: '銀行振込', icon: '🏦' },
]

export function CheckoutForm({ packages, isDemo = false }: { packages: PointPackage[]; isDemo?: boolean }) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card')
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    if (!selectedId) return
    setLoading(true)

    try {
      if (paymentMethod === 'card') {
        const res = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ package_id: selectedId }),
        })
        const data = await res.json()
        if (data.url) {
          window.location.href = data.url
        }
      } else {
        const res = await fetch('/api/checkout/komoju', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            package_id: selectedId,
            payment_method: paymentMethod,
          }),
        })
        const data = await res.json()
        if (data.url) {
          window.location.href = data.url
        } else if (data.error) {
          alert(data.error)
        }
      }
    } catch {
      alert('エラーが発生しました / An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-8">
      {/* Payment method tabs */}
      <div className="mb-6">
        <p className="mb-3 text-sm font-medium text-zinc-700">決済方法を選択</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PAYMENT_METHODS.map((method) => (
            <button
              key={method.id}
              onClick={() => setPaymentMethod(method.id)}
              className={`rounded-xl border-2 px-3 py-3 text-center text-sm transition ${
                paymentMethod === method.id
                  ? 'border-blue-600 bg-blue-50 font-bold text-blue-700'
                  : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300'
              }`}
            >
              <span className="block text-lg">{method.icon}</span>
              <span className="mt-1 block text-xs">{method.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Demo mode notice for non-card methods */}
      {isDemo && paymentMethod !== 'card' && (
        <div className="mb-4 rounded-lg bg-zinc-100 p-4 text-center text-sm text-zinc-500">
          デモモードでは利用できません
        </div>
      )}

      {/* Package selection */}
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
        disabled={!selectedId || loading || (isDemo && paymentMethod !== 'card')}
        className="mt-6 w-full rounded-xl bg-blue-600 py-4 text-lg font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? '処理中...' : '購入する'}
      </button>

      <p className="mt-4 text-center text-xs text-zinc-400">
        {paymentMethod === 'card' && '決済は購入時に即時請求されます'}
        {paymentMethod === 'konbini' && 'コンビニでお支払い後にポイントが付与されます'}
        {paymentMethod === 'paypay' && 'PayPayアプリで決済後にポイントが付与されます'}
        {paymentMethod === 'bank_transfer' && '振込確認後にポイントが付与されます'}
      </p>
    </div>
  )
}
