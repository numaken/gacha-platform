import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CheckoutForm } from './checkout-form'
import { isDemo } from '@/lib/is-demo'
import { demoProfile, demoPointPackages } from '@/lib/demo-data'

export default async function CheckoutPage() {
  const demo = isDemo()

  let pointBalance = 0
  let packages

  if (demo) {
    pointBalance = demoProfile.point_balance
    packages = demoPointPackages
  } else {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase
      .from('profiles')
      .select('point_balance')
      .eq('id', user.id)
      .single()

    pointBalance = profile?.point_balance || 0

    const { data: pkgs } = await supabase
      .from('point_packages')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    packages = pkgs || []
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-2xl font-bold text-zinc-900">ポイント購入</h1>
      <p className="mt-2 text-zinc-500">
        現在の残高: <span className="font-bold text-blue-600">{pointBalance.toLocaleString()} PT</span>
      </p>

      {demo && (
        <div className="mt-4 rounded-lg bg-amber-50 p-3 text-center text-sm font-medium text-amber-600">
          デモモードです。実際の決済は発生しません。
        </div>
      )}

      <CheckoutForm packages={packages} />
    </div>
  )
}
