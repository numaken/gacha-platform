'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

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

interface ShippingRequestData {
  id: string
  user_id: string
  status: string
  tracking_number: string | null
  created_at: string
  profile: {
    email: string
    display_name: string | null
    postal_code: string | null
    prefecture: string | null
    city: string | null
    address: string | null
    building: string | null
  } | null
  items: Array<{
    id: string
    gacha_result: {
      prize: { name: string; rank: string } | null
    } | null
  }>
}

export function ShippingAdmin({ requests }: { requests: ShippingRequestData[] }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editStatus, setEditStatus] = useState('')
  const [editTracking, setEditTracking] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const startEdit = (req: ShippingRequestData) => {
    setEditingId(req.id)
    setEditStatus(req.status)
    setEditTracking(req.tracking_number || '')
  }

  const handleSave = async () => {
    if (!editingId) return
    setLoading(true)

    const updateData: Record<string, string> = {
      status: editStatus,
      updated_at: new Date().toISOString(),
    }

    if (editTracking) {
      updateData.tracking_number = editTracking
    }

    if (editStatus === 'shipped') {
      updateData.shipped_at = new Date().toISOString()
    } else if (editStatus === 'delivered') {
      updateData.delivered_at = new Date().toISOString()
    }

    await supabase
      .from('shipping_requests')
      .update(updateData)
      .eq('id', editingId)

    setEditingId(null)
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="mt-6 space-y-4">
      {requests.map(req => (
        <div key={req.id} className="rounded-xl border border-zinc-200 bg-white p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-bold text-zinc-900">
                {req.profile?.display_name || req.profile?.email || 'Unknown'}
              </p>
              <p className="text-xs text-zinc-400">
                {new Date(req.created_at).toLocaleDateString('ja-JP', {
                  year: 'numeric', month: '2-digit', day: '2-digit',
                  hour: '2-digit', minute: '2-digit',
                })}
              </p>
            </div>
            <span className={`rounded-full px-3 py-0.5 text-xs font-bold ${statusColors[req.status]}`}>
              {statusLabels[req.status]}
            </span>
          </div>

          {/* Address */}
          {req.profile && (
            <div className="mt-3 rounded-lg bg-zinc-50 p-3 text-sm text-zinc-600">
              <p>〒{req.profile.postal_code}</p>
              <p>{req.profile.prefecture}{req.profile.city}{req.profile.address}</p>
              {req.profile.building && <p>{req.profile.building}</p>}
            </div>
          )}

          {/* Items */}
          <div className="mt-3 space-y-1">
            {req.items?.map(item => (
              <div key={item.id} className="text-sm text-zinc-700">
                [{item.gacha_result?.prize?.rank}] {item.gacha_result?.prize?.name}
              </div>
            ))}
          </div>

          {req.tracking_number && (
            <p className="mt-2 text-sm text-zinc-600">
              追跡番号: <span className="font-mono font-bold">{req.tracking_number}</span>
            </p>
          )}

          {/* Edit controls */}
          {editingId === req.id ? (
            <div className="mt-4 flex items-end gap-3 border-t border-zinc-100 pt-4">
              <div className="flex-1">
                <label className="block text-xs font-medium text-zinc-500">ステータス</label>
                <select
                  value={editStatus}
                  onChange={e => setEditStatus(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="pending">依頼済み</option>
                  <option value="processing">準備中</option>
                  <option value="shipped">発送済み</option>
                  <option value="delivered">配達完了</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-zinc-500">追跡番号</label>
                <input
                  type="text"
                  value={editTracking}
                  onChange={e => setEditTracking(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  placeholder="追跡番号"
                />
              </div>
              <button
                onClick={handleSave}
                disabled={loading}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                保存
              </button>
              <button
                onClick={() => setEditingId(null)}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50"
              >
                取消
              </button>
            </div>
          ) : (
            <button
              onClick={() => startEdit(req)}
              className="mt-3 rounded bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-200"
            >
              編集
            </button>
          )}
        </div>
      ))}

      {requests.length === 0 && (
        <div className="rounded-xl border border-dashed border-zinc-300 py-10 text-center text-zinc-400">
          発送依頼はありません
        </div>
      )}
    </div>
  )
}
