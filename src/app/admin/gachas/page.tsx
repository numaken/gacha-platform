import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { GachaToggle } from './gacha-toggle'
import { isDemo } from '@/lib/is-demo'
import { demoGachas } from '@/lib/demo-data'

export default async function AdminGachasPage() {
  const demo = isDemo()

  let gachas

  if (demo) {
    gachas = demoGachas
  } else {
    const supabase = await createClient()
    const { data } = await supabase
      .from('gachas')
      .select('*')
      .order('sort_order', { ascending: true })
    gachas = data
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">ガチャ管理</h1>
        {!demo && (
          <Link
            href="/admin/gachas/new"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700"
          >
            新規作成
          </Link>
        )}
      </div>

      {demo && (
        <div className="mt-4 rounded-lg bg-amber-50 p-3 text-sm font-medium text-amber-600">
          デモモード: サンプルデータを表示しています
        </div>
      )}

      <div className="mt-6 overflow-hidden rounded-xl border border-zinc-200">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50">
            <tr>
              <th className="px-4 py-3 font-medium text-zinc-600">名称</th>
              <th className="px-4 py-3 font-medium text-zinc-600">価格</th>
              <th className="px-4 py-3 font-medium text-zinc-600">タイプ</th>
              <th className="px-4 py-3 font-medium text-zinc-600">残数</th>
              <th className="px-4 py-3 font-medium text-zinc-600">状態</th>
              {!demo && <th className="px-4 py-3 font-medium text-zinc-600">操作</th>}
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
                  {demo ? (
                    <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-700">
                      公開中
                    </span>
                  ) : (
                    <GachaToggle gachaId={gacha.id} isActive={gacha.is_active} />
                  )}
                </td>
                {!demo && (
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
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
