import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const navItems = [
  { href: '/admin', label: 'ダッシュボード' },
  { href: '/admin/gachas', label: 'ガチャ管理' },
  { href: '/admin/users', label: 'ユーザー管理' },
  { href: '/admin/shipping', label: '発送管理' },
  { href: '/admin/orders', label: '注文一覧' },
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') redirect('/')

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 border-r border-zinc-200 bg-zinc-50 p-4">
        <h2 className="px-3 text-xs font-bold uppercase tracking-wider text-zinc-400">
          管理画面
        </h2>
        <nav className="mt-4 space-y-1">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-lg px-3 py-2 text-sm text-zinc-700 transition hover:bg-zinc-200"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-8 border-t border-zinc-200 pt-4">
          <Link
            href="/"
            className="block px-3 text-xs text-zinc-400 hover:text-zinc-600"
          >
            ← サイトに戻る
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 p-8">
        {children}
      </div>
    </div>
  )
}
