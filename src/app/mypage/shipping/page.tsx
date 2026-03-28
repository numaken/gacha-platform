import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ShippingClient } from './shipping-client'

export default async function ShippingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('postal_code, prefecture, city, address, building')
    .eq('id', user.id)
    .single()

  const hasAddress = !!(profile?.postal_code && profile?.prefecture && profile?.city && profile?.address)

  // Get unshipped prizes (status = 'won')
  const { data: unshippedResults } = await supabase
    .from('gacha_results')
    .select('*, prize:prizes(name, rank, image_url), gacha:gachas(name)')
    .eq('user_id', user.id)
    .eq('status', 'won')
    .order('created_at', { ascending: false })

  // Get shipping requests
  const { data: shippingRequests } = await supabase
    .from('shipping_requests')
    .select('*, items:shipping_request_items(*, gacha_result:gacha_results(*, prize:prizes(name, rank)))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-2xl font-bold text-zinc-900">発送依頼</h1>

      <ShippingClient
        hasAddress={hasAddress}
        unshippedResults={unshippedResults || []}
        shippingRequests={shippingRequests || []}
      />
    </div>
  )
}
