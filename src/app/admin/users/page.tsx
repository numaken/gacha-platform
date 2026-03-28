import { createClient } from '@/lib/supabase/server'

export default async function AdminUsersPage() {
  const supabase = await createClient()

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  // Get gacha result counts per user
  const userIds = profiles?.map(p => p.id) || []
  const resultCounts: Record<string, number> = {}

  if (userIds.length > 0) {
    for (const userId of userIds) {
      const { count } = await supabase
        .from('gacha_results')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
      resultCounts[userId] = count || 0
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900">ユーザー管理</h1>

      <div className="mt-6 overflow-hidden rounded-xl border border-zinc-200">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50">
            <tr>
              <th className="px-4 py-3 font-medium text-zinc-600">メール</th>
              <th className="px-4 py-3 font-medium text-zinc-600">表示名</th>
              <th className="px-4 py-3 font-medium text-zinc-600">ポイント残高</th>
              <th className="px-4 py-3 font-medium text-zinc-600">獲得数</th>
              <th className="px-4 py-3 font-medium text-zinc-600">権限</th>
              <th className="px-4 py-3 font-medium text-zinc-600">登録日</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {profiles?.map(profile => (
              <tr key={profile.id} className="bg-white">
                <td className="px-4 py-3 text-zinc-900">{profile.email}</td>
                <td className="px-4 py-3 text-zinc-600">{profile.display_name || '-'}</td>
                <td className="px-4 py-3 font-bold text-blue-600">{profile.point_balance.toLocaleString()} PT</td>
                <td className="px-4 py-3 text-zinc-600">{(resultCounts[profile.id] || 0).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                    profile.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-zinc-100 text-zinc-600'
                  }`}>
                    {profile.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-zinc-400">
                  {new Date(profile.created_at).toLocaleDateString('ja-JP')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
