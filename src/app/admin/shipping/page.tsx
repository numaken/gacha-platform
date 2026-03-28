import { createClient } from '@/lib/supabase/server'
import { ShippingAdmin } from './shipping-admin'

export default async function AdminShippingPage() {
  const supabase = await createClient()

  const { data: requests } = await supabase
    .from('shipping_requests')
    .select(`
      *,
      profile:profiles(email, display_name, postal_code, prefecture, city, address, building),
      items:shipping_request_items(*, gacha_result:gacha_results(*, prize:prizes(name, rank)))
    `)
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900">発送管理</h1>
      <ShippingAdmin requests={requests || []} />
    </div>
  )
}
