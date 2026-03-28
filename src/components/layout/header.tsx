'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { isDemo } from '@/lib/is-demo'
import { demoProfile } from '@/lib/demo-data'
import type { Profile } from '@/types/database'

export function Header() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const demo = isDemo()

  useEffect(() => {
    if (demo) {
      setProfile(demoProfile)
      setLoading(false)
      return
    }

    async function getProfile() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(data)
      }
      setLoading(false)
    }
    getProfile()
  }, [demo])

  const handleLogout = async () => {
    if (demo) return
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-xl font-bold text-zinc-900">
            GACHA<span className="text-blue-600">PLATFORM</span>
          </Link>
          {demo && (
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-700">
              DEMO
            </span>
          )}
        </div>

        <nav className="flex items-center gap-4">
          {loading ? (
            <div className="h-8 w-20 animate-pulse rounded bg-zinc-200" />
          ) : profile ? (
            <>
              <Link
                href="/checkout"
                className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                ポイント購入
              </Link>
              <Link
                href="/mypage"
                className="flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900"
              >
                <span className="font-bold text-blue-600">{profile.point_balance.toLocaleString()} PT</span>
                <span>{profile.display_name || 'マイページ'}</span>
              </Link>
              {profile.role === 'admin' && (
                <Link
                  href="/admin"
                  className="text-sm text-zinc-500 hover:text-zinc-900"
                >
                  管理
                </Link>
              )}
              {!demo && (
                <button
                  onClick={handleLogout}
                  className="text-sm text-zinc-400 hover:text-zinc-600"
                >
                  ログアウト
                </button>
              )}
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-zinc-600 hover:text-zinc-900"
              >
                ログイン
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                新規登録
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
