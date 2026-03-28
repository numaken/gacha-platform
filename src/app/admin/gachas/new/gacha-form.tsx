'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function GachaForm() {
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: 500,
    type: 'normal',
    image_url: '',
    is_active: true,
    total_count: '',
    daily_limit: '',
    pity_count: '',
    pity_rank: '',
    min_total_spent: '',
    sale_start_at: '',
    sale_end_at: '',
    sort_order: 0,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const totalCount = form.total_count ? parseInt(form.total_count) : null

    const { error: insertError } = await supabase.from('gachas').insert({
      name: form.name,
      description: form.description || null,
      price: form.price,
      type: form.type,
      image_url: form.image_url || null,
      is_active: form.is_active,
      total_count: totalCount,
      remaining_count: totalCount,
      daily_limit: form.daily_limit ? parseInt(form.daily_limit) : null,
      pity_count: form.pity_count ? parseInt(form.pity_count) : null,
      pity_rank: form.pity_rank || null,
      min_total_spent: form.min_total_spent ? parseInt(form.min_total_spent) : null,
      sale_start_at: form.sale_start_at || null,
      sale_end_at: form.sale_end_at || null,
      sort_order: form.sort_order,
    })

    if (insertError) {
      setError('作成に失敗しました / Failed to create')
      setLoading(false)
      return
    }

    router.push('/admin/gachas')
    router.refresh()
  }

  const handleChange = (field: string, value: string | number | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 max-w-2xl space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}

      <div>
        <label className="block text-sm font-medium text-zinc-700">名称 *</label>
        <input
          type="text"
          required
          value={form.name}
          onChange={e => handleChange('name', e.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700">説明</label>
        <textarea
          value={form.description}
          onChange={e => handleChange('description', e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700">価格 (PT) *</label>
          <input
            type="number"
            required
            min={1}
            value={form.price}
            onChange={e => handleChange('price', parseInt(e.target.value) || 0)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700">タイプ</label>
          <select
            value={form.type}
            onChange={e => handleChange('type', e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          >
            <option value="normal">通常</option>
            <option value="daily">デイリー</option>
            <option value="infinite">無限</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700">画像URL</label>
        <input
          type="text"
          value={form.image_url}
          onChange={e => handleChange('image_url', e.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700">総数 (空=無制限)</label>
          <input
            type="number"
            value={form.total_count}
            onChange={e => handleChange('total_count', e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700">デイリー制限</label>
          <input
            type="number"
            value={form.daily_limit}
            onChange={e => handleChange('daily_limit', e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700">天井回数</label>
          <input
            type="number"
            value={form.pity_count}
            onChange={e => handleChange('pity_count', e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700">天井確定ランク</label>
          <select
            value={form.pity_rank}
            onChange={e => handleChange('pity_rank', e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">なし</option>
            <option value="S">S賞</option>
            <option value="A">A賞</option>
            <option value="B">B賞</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700">最低累計課金額 (PT)</label>
        <input
          type="number"
          value={form.min_total_spent}
          onChange={e => handleChange('min_total_spent', e.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700">販売開始日時</label>
          <input
            type="datetime-local"
            value={form.sale_start_at}
            onChange={e => handleChange('sale_start_at', e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700">販売終了日時</label>
          <input
            type="datetime-local"
            value={form.sale_end_at}
            onChange={e => handleChange('sale_end_at', e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700">表示順</label>
        <input
          type="number"
          value={form.sort_order}
          onChange={e => handleChange('sort_order', parseInt(e.target.value) || 0)}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_active"
          checked={form.is_active}
          onChange={e => handleChange('is_active', e.target.checked)}
          className="h-4 w-4 rounded border-zinc-300 text-blue-600"
        />
        <label htmlFor="is_active" className="text-sm text-zinc-700">公開する</label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? '作成中...' : '作成する'}
      </button>
    </form>
  )
}
