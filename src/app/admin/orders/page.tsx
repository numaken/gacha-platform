import { createClient } from '@/lib/supabase/server'

const statusLabels: Record<string, string> = {
  pending: '処理中',
  paid: '支払済',
  failed: '失敗',
  refunded: '返金済',
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  paid: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-zinc-100 text-zinc-600',
}

export default async function AdminOrdersPage() {
  const supabase = await createClient()

  const { data: orders } = await supabase
    .from('orders')
    .select('*, profile:profiles(email, display_name)')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900">注文一覧</h1>

      <div className="mt-6 overflow-hidden rounded-xl border border-zinc-200">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50">
            <tr>
              <th className="px-4 py-3 font-medium text-zinc-600">日時</th>
              <th className="px-4 py-3 font-medium text-zinc-600">ユーザー</th>
              <th className="px-4 py-3 font-medium text-zinc-600">金額</th>
              <th className="px-4 py-3 font-medium text-zinc-600">ポイント</th>
              <th className="px-4 py-3 font-medium text-zinc-600">ステータス</th>
              <th className="px-4 py-3 font-medium text-zinc-600">Stripe ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {orders?.map((order: {
              id: string
              created_at: string
              amount: number
              points: number
              status: string
              stripe_payment_intent_id: string | null
              profile: { email: string; display_name: string | null } | null
            }) => (
              <tr key={order.id} className="bg-white">
                <td className="px-4 py-3 text-xs text-zinc-400">
                  {new Date(order.created_at).toLocaleDateString('ja-JP', {
                    year: 'numeric', month: '2-digit', day: '2-digit',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </td>
                <td className="px-4 py-3 text-zinc-900">
                  {order.profile?.display_name || order.profile?.email || '-'}
                </td>
                <td className="px-4 py-3 font-bold text-zinc-900">
                  ¥{order.amount.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-blue-600">
                  {order.points.toLocaleString()} PT
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${statusColors[order.status]}`}>
                    {statusLabels[order.status]}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-zinc-400">
                  {order.stripe_payment_intent_id
                    ? `${order.stripe_payment_intent_id.substring(0, 20)}...`
                    : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(!orders || orders.length === 0) && (
        <div className="mt-6 rounded-xl border border-dashed border-zinc-300 py-10 text-center text-zinc-400">
          注文はありません
        </div>
      )}
    </div>
  )
}
