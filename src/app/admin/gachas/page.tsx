import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { GachaToggle } from './gacha-toggle'

export default async function AdminGachasPage() {
  const supabase = await createClient()

  const { data: gachas } = await supabase
    .from('gachas')
    .select('*')
    .order('sort_order', { ascending: true })

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">ガチャ管理</h1>
        <Link
          href="/admin/gachas/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700"
        >
          新規作成
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-zinc-200">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50">
            <tr>
              <th className="px-4 py-3 font-medium text-zinc-600">名称</th>
              <th className="px-4 py-3 font-medium text-zinc-600">価格</th>
              <th className="px-4 py-3 font-medium text-zinc-600">タイプ</th>
              <th className="px-4 py-3 font-medium text-zinc-600">残数</th>
              <th className="px-4 py-3 font-medium text-zinc-600">状態</th>
              <th className="px-4 py-3 font-medium text-zinc-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {gachas?.map(gacha => (
              <tr key={gacha.id} className="bg-white">
                <td className="px-4 py-3 font-medium text-zinc-900">{gacha.name}</td>
                <td className="px-4 py-3 text-zinc-600">{gacha.price.toLocaleString()} PT</td>
                <td className="px-4 py-3 text-zinc-600">{gacha.type}</td>
                <td className="px-4 py-3 text-zinc-600">
                  {gacha.remaining_count !== null ? `${gacha.remaining_count} / ${gacha.total_count}` : '無制限'}
                </td>
                <td className="px-4 py-3">
                  <GachaToggle gachaId={gacha.id} isActive={gacha.is_active} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/gachas/${gacha.id}/edit`}
                      className="rounded bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-200"
                    >
                      編集
                    </Link>
                    <Link
                      href={`/admin/gachas/${gacha.id}/prizes`}
                      className="rounded bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200"
                    >
                      景品
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
