import { createClient } from '@/lib/supabase/server'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // User count
  const { count: userCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  // Total revenue (paid orders)
  const { data: orders } = await supabase
    .from('orders')
    .select('amount')
    .eq('status', 'paid')

  const totalRevenue = orders?.reduce((sum: number, o: { amount: number }) => sum + o.amount, 0) || 0

  // Today's gacha plays
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { count: todayPlays } = await supabase
    .from('gacha_results')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today.toISOString())

  // Active gachas
  const { count: activeGachas } = await supabase
    .from('gachas')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  // Pending shipping
  const { count: pendingShipping } = await supabase
    .from('shipping_requests')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  const stats = [
    { label: 'ユーザー数', value: (userCount || 0).toLocaleString(), color: 'text-blue-600' },
    { label: '総売上', value: `¥${totalRevenue.toLocaleString()}`, color: 'text-green-600' },
    { label: '本日のガチャ回数', value: (todayPlays || 0).toLocaleString(), color: 'text-amber-600' },
    { label: '公開中ガチャ', value: (activeGachas || 0).toLocaleString(), color: 'text-purple-600' },
    { label: '未発送依頼', value: (pendingShipping || 0).toLocaleString(), color: 'text-rose-600' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900">ダッシュボード</h1>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map(stat => (
          <div key={stat.label} className="rounded-xl border border-zinc-200 bg-white p-6">
            <p className="text-sm text-zinc-500">{stat.label}</p>
            <p className={`mt-2 text-3xl font-extrabold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
