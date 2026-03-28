import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileForm } from './profile-form'
import { isDemo } from '@/lib/is-demo'
import { demoProfile } from '@/lib/demo-data'

export default async function ProfilePage() {
  const demo = isDemo()

  let profile

  if (demo) {
    profile = demoProfile
  } else {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profileData) redirect('/login')
    profile = profileData
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-bold text-zinc-900">プロフィール編集</h1>
      <p className="mt-2 text-sm text-zinc-500">配送先住所やお名前を設定してください</p>

      {demo && (
        <div className="mt-4 rounded-lg bg-amber-50 p-3 text-center text-sm font-medium text-amber-600">
          デモモードです。変更は保存されません。
        </div>
      )}

      <ProfileForm profile={profile} isDemo={demo} />
    </div>
  )
}
