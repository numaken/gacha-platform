import Link from 'next/link'
import type { Gacha } from '@/types/database'

const typeLabels: Record<string, string> = {
  normal: '通常',
  daily: 'デイリー',
  infinite: '無限',
}

const typeBadgeColors: Record<string, string> = {
  normal: 'bg-blue-100 text-blue-700',
  daily: 'bg-amber-100 text-amber-700',
  infinite: 'bg-purple-100 text-purple-700',
}

function getSaleStatus(gacha: Gacha): 'active' | 'upcoming' | 'ended' {
  const now = new Date()
  if (gacha.sale_start_at && new Date(gacha.sale_start_at) > now) return 'upcoming'
  if (gacha.sale_end_at && new Date(gacha.sale_end_at) < now) return 'ended'
  return 'active'
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ja-JP', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function GachaCard({ gacha }: { gacha: Gacha }) {
  const remaining = gacha.remaining_count
  const total = gacha.total_count
  const progress = total && remaining !== null ? ((total - remaining) / total) * 100 : 0
  const saleStatus = getSaleStatus(gacha)

  return (
    <Link
      href={`/gacha/${gacha.id}`}
      className={`group block overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
        saleStatus !== 'active' ? 'opacity-70' : ''
      }`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100">
        {gacha.image_url ? (
          <img
            src={gacha.image_url}
            alt={gacha.name}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl text-zinc-300">
            🎰
          </div>
        )}
        <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold ${typeBadgeColors[gacha.type]}`}>
          {typeLabels[gacha.type]}
        </span>
        {saleStatus === 'upcoming' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded-full bg-white px-4 py-2 text-sm font-bold text-zinc-900">準備中</span>
          </div>
        )}
        {saleStatus === 'ended' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded-full bg-zinc-800 px-4 py-2 text-sm font-bold text-white">終了</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-lg font-bold text-zinc-900">{gacha.name}</h3>
        {gacha.description && (
          <p className="mt-1 line-clamp-2 text-sm text-zinc-500">{gacha.description}</p>
        )}

        {(gacha.sale_start_at || gacha.sale_end_at) && (
          <p className="mt-2 text-xs text-zinc-400">
            {gacha.sale_start_at && `${formatDateTime(gacha.sale_start_at)} 〜`}
            {gacha.sale_end_at && ` ${formatDateTime(gacha.sale_end_at)}`}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between">
          <span className="text-2xl font-extrabold text-blue-600">
            {gacha.price.toLocaleString()} <span className="text-sm">PT</span>
          </span>
          {total && remaining !== null && (
            <span className="text-xs text-zinc-400">
              残り {remaining} / {total}
            </span>
          )}
        </div>

        {total && remaining !== null && (
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </Link>
  )
}
