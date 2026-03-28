import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CheckoutForm } from './checkout-form'

export default async function CheckoutPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('point_balance')
    .eq('id', user.id)
    .single()

  const { data: packages } = await supabase
    .from('point_packages')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-2xl font-bold text-zinc-900">ポイント購入</h1>
      <p className="mt-2 text-zinc-500">
        現在の残高: <span className="font-bold text-blue-600">{(profile?.point_balance || 0).toLocaleString()} PT</span>
      </p>

      <CheckoutForm packages={packages || []} />
    </div>
  )
}
