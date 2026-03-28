'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

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

const statusLabels: Record<string, string> = {
  pending: '依頼済み',
  processing: '準備中',
  shipped: '発送済み',
  delivered: '配達完了',
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
}

interface UnshippedResult {
  id: string
  created_at: string
  prize: { name: string; rank: string; image_url: string | null } | null
  gacha: { name: string } | null
}

interface ShippingRequest {
  id: string
  status: string
  tracking_number: string | null
  created_at: string
  items: Array<{
    id: string
    gacha_result: {
      prize: { name: string; rank: string } | null
    } | null
  }>
}

export function ShippingClient({
  hasAddress,
  unshippedResults,
  shippingRequests,
}: {
  hasAddress: boolean
  unshippedResults: UnshippedResult[]
  shippingRequests: ShippingRequest[]
}) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleSubmit = async () => {
    if (selectedIds.size === 0) return
    setLoading(true)

    try {
      // Create shipping request
      const { data: shippingRequest, error: createError } = await supabase
        .from('shipping_requests')
        .insert({ user_id: (await supabase.auth.getUser()).data.user?.id })
        .select()
        .single()

      if (createError || !shippingRequest) {
        alert('発送依頼の作成に失敗しました / Failed to create shipping request')
        return
      }

      // Create shipping request items
      const items = Array.from(selectedIds).map(gachaResultId => ({
        shipping_request_id: shippingRequest.id,
        gacha_result_id: gachaResultId,
      }))

      const { error: itemsError } = await supabase
        .from('shipping_request_items')
        .insert(items)

      if (itemsError) {
        alert('発送アイテムの登録に失敗しました / Failed to register shipping items')
        return
      }

      // Update gacha_results status to 'shipped'
      for (const id of selectedIds) {
        await supabase
          .from('gacha_results')
          .update({ status: 'shipped' })
          .eq('id', id)
      }

      setSelectedIds(new Set())
      router.refresh()
    } catch {
      alert('エラーが発生しました / An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {!hasAddress && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-800">
            配送先住所が登録されていません。先に住所を登録してください。
          </p>
          <Link
            href="/mypage/profile"
            className="mt-2 inline-block rounded-lg bg-amber-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-amber-700"
          >
            プロフィール編集へ
          </Link>
        </div>
      )}

      {/* Unshipped prizes */}
      <section className="mt-8">
        <h2 className="text-lg font-bold text-zinc-900">未発送の景品</h2>
        {unshippedResults.length > 0 ? (
          <>
            <div className="mt-4 space-y-2">
              {unshippedResults.map(result => (
                <label
                  key={result.id}
                  className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition ${
                    selectedIds.has(result.id)
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-zinc-200 bg-white hover:border-zinc-300'
                  } ${!hasAddress ? 'pointer-events-none opacity-50' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(result.id)}
                    onChange={() => toggleSelect(result.id)}
                    disabled={!hasAddress}
                    className="h-4 w-4 rounded border-zinc-300 text-blue-600"
                  />
                  {result.prize?.image_url && (
                    <img src={result.prize.image_url} alt="" className="h-12 w-12 rounded-lg object-cover" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${rankColors[result.prize?.rank || 'C']}`}>
                        {rankLabels[result.prize?.rank || 'C']}
                      </span>
                      <span className="font-bold text-zinc-900">{result.prize?.name}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-zinc-400">{result.gacha?.name}</p>
                  </div>
                </label>
              ))}
            </div>

            <button
              onClick={handleSubmit}
              disabled={selectedIds.size === 0 || loading || !hasAddress}
              className="mt-4 w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '送信中...' : `選択した${selectedIds.size}件の発送を依頼する`}
            </button>
          </>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-zinc-300 py-10 text-center text-zinc-400">
            未発送の景品はありません
          </div>
        )}
      </section>

      {/* Shipping request history */}
      <section className="mt-10">
        <h2 className="text-lg font-bold text-zinc-900">発送依頼履歴</h2>
        {shippingRequests.length > 0 ? (
          <div className="mt-4 space-y-4">
            {shippingRequests.map(req => (
              <div key={req.id} className="rounded-xl border border-zinc-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400">
                    {new Date(req.created_at).toLocaleDateString('ja-JP', {
                      year: 'numeric', month: '2-digit', day: '2-digit',
                    })}
                  </span>
                  <span className={`rounded-full px-3 py-0.5 text-xs font-bold ${statusColors[req.status]}`}>
                    {statusLabels[req.status]}
                  </span>
                </div>
                {req.tracking_number && (
                  <p className="mt-2 text-sm text-zinc-600">
                    追跡番号: <span className="font-mono font-bold">{req.tracking_number}</span>
                  </p>
                )}
                <div className="mt-2 space-y-1">
                  {req.items?.map(item => (
                    <div key={item.id} className="flex items-center gap-2 text-sm text-zinc-600">
                      <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${rankColors[item.gacha_result?.prize?.rank || 'C']}`}>
                        {rankLabels[item.gacha_result?.prize?.rank || 'C']}
                      </span>
                      <span>{item.gacha_result?.prize?.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-zinc-300 py-10 text-center text-zinc-400">
            発送依頼履歴がありません
          </div>
        )}
      </section>
    </>
  )
}
