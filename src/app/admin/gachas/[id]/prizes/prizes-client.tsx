'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface PrizeData {
  id: string
  name: string
  description: string | null
  rank: string
  image_url: string | null
  probability: number
  stock: number
  initial_stock: number
  is_last_one: boolean
  once_per_user: boolean
  exchange_points: number | null
  sort_order: number
}

const emptyPrize = {
  name: '',
  description: '',
  rank: 'C',
  image_url: '',
  probability: 10,
  stock: 10,
  initial_stock: 10,
  is_last_one: false,
  once_per_user: false,
  exchange_points: '',
  sort_order: 0,
}

export function PrizesClient({
  gachaId,
  initialPrizes,
}: {
  gachaId: string
  initialPrizes: PrizeData[]
}) {
  const [prizes, setPrizes] = useState(initialPrizes)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyPrize)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleChange = (field: string, value: string | number | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleCreate = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('prizes')
      .insert({
        gacha_id: gachaId,
        name: form.name,
        description: form.description || null,
        rank: form.rank,
        image_url: form.image_url || null,
        probability: form.probability,
        stock: form.stock,
        initial_stock: form.initial_stock,
        is_last_one: form.is_last_one,
        once_per_user: form.once_per_user,
        exchange_points: form.exchange_points ? parseInt(form.exchange_points as string) : null,
        sort_order: form.sort_order,
      })
      .select()
      .single()

    if (!error && data) {
      setPrizes(prev => [...prev, data])
      setForm(emptyPrize)
      setShowForm(false)
    }
    setLoading(false)
    router.refresh()
  }

  const handleUpdate = async () => {
    if (!editingId) return
    setLoading(true)

    const { error } = await supabase
      .from('prizes')
      .update({
        name: form.name,
        description: form.description || null,
        rank: form.rank,
        image_url: form.image_url || null,
        probability: form.probability,
        stock: form.stock,
        initial_stock: form.initial_stock,
        is_last_one: form.is_last_one,
        once_per_user: form.once_per_user,
        exchange_points: form.exchange_points ? parseInt(form.exchange_points as string) : null,
        sort_order: form.sort_order,
      })
      .eq('id', editingId)

    if (!error) {
      setPrizes(prev => prev.map(p =>
        p.id === editingId ? { ...p, ...form, exchange_points: form.exchange_points ? parseInt(form.exchange_points as string) : null } : p
      ))
      setEditingId(null)
      setForm(emptyPrize)
      setShowForm(false)
    }
    setLoading(false)
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('この景品を削除しますか？')) return
    const { error } = await supabase.from('prizes').delete().eq('id', id)
    if (!error) {
      setPrizes(prev => prev.filter(p => p.id !== id))
    }
    router.refresh()
  }

  const startEdit = (prize: PrizeData) => {
    setEditingId(prize.id)
    setForm({
      name: prize.name,
      description: prize.description || '',
      rank: prize.rank,
      image_url: prize.image_url || '',
      probability: prize.probability,
      stock: prize.stock,
      initial_stock: prize.initial_stock,
      is_last_one: prize.is_last_one,
      once_per_user: prize.once_per_user,
      exchange_points: prize.exchange_points?.toString() || '',
      sort_order: prize.sort_order,
    })
    setShowForm(true)
  }

  const cancelForm = () => {
    setShowForm(false)
    setEditingId(null)
    setForm(emptyPrize)
  }

  const rankColors: Record<string, string> = {
    S: 'bg-amber-100 text-amber-700',
    A: 'bg-rose-100 text-rose-700',
    B: 'bg-blue-100 text-blue-700',
    C: 'bg-zinc-100 text-zinc-700',
    last_one: 'bg-purple-100 text-purple-700',
  }

  return (
    <div className="mt-6">
      {/* Prize list */}
      <div className="space-y-2">
        {prizes.map(prize => (
          <div key={prize.id} className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-4">
            {prize.image_url && (
              <img src={prize.image_url} alt="" className="h-12 w-12 rounded-lg object-cover" />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${rankColors[prize.rank]}`}>
                  {prize.rank === 'last_one' ? 'LO' : prize.rank}
                </span>
                <span className="font-bold text-zinc-900">{prize.name}</span>
                {prize.once_per_user && (
                  <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-600">1回限定</span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-zinc-400">
                確率: {prize.probability}% / 在庫: {prize.stock}/{prize.initial_stock}
                {prize.exchange_points ? ` / 交換: ${prize.exchange_points}PT` : ''}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => startEdit(prize)}
                className="rounded bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-200"
              >
                編集
              </button>
              <button
                onClick={() => handleDelete(prize.id)}
                className="rounded bg-red-100 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-200"
              >
                削除
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit form */}
      {!showForm && (
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyPrize); }}
          className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700"
        >
          景品を追加
        </button>
      )}

      {showForm && (
        <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-6">
          <h3 className="text-lg font-bold text-zinc-900">
            {editingId ? '景品を編集' : '景品を追加'}
          </h3>

          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700">名称 *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => handleChange('name', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700">ランク</label>
                <select
                  value={form.rank}
                  onChange={e => handleChange('rank', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="S">S</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="last_one">ラストワン</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700">説明</label>
              <input
                type="text"
                value={form.description}
                onChange={e => handleChange('description', e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700">画像URL</label>
              <input
                type="text"
                value={form.image_url}
                onChange={e => handleChange('image_url', e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700">確率 (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.probability}
                  onChange={e => handleChange('probability', parseFloat(e.target.value) || 0)}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700">在庫</label>
                <input
                  type="number"
                  value={form.stock}
                  onChange={e => handleChange('stock', parseInt(e.target.value) || 0)}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700">初期在庫</label>
                <input
                  type="number"
                  value={form.initial_stock}
                  onChange={e => handleChange('initial_stock', parseInt(e.target.value) || 0)}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700">交換ポイント</label>
                <input
                  type="number"
                  value={form.exchange_points}
                  onChange={e => handleChange('exchange_points', e.target.value)}
                  placeholder="空=交換不可"
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700">表示順</label>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={e => handleChange('sort_order', parseInt(e.target.value) || 0)}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.is_last_one}
                  onChange={e => handleChange('is_last_one', e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-300 text-blue-600"
                />
                <span className="text-sm text-zinc-700">ラストワン賞</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.once_per_user}
                  onChange={e => handleChange('once_per_user', e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-300 text-blue-600"
                />
                <span className="text-sm text-zinc-700">一人一回限定</span>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={cancelForm}
                className="flex-1 rounded-lg border border-zinc-300 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50"
              >
                キャンセル
              </button>
              <button
                onClick={editingId ? handleUpdate : handleCreate}
                disabled={loading || !form.name}
                className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? '保存中...' : editingId ? '更新' : '追加'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
