import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { PrizesClient } from './prizes-client'

export default async function PrizesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: gacha } = await supabase
    .from('gachas')
    .select('id, name')
    .eq('id', id)
    .single()

  if (!gacha) notFound()

  const { data: prizes } = await supabase
    .from('prizes')
    .select('*')
    .eq('gacha_id', id)
    .order('sort_order', { ascending: true })

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900">景品管理: {gacha.name}</h1>
      <PrizesClient gachaId={id} initialPrizes={prizes || []} />
    </div>
  )
}
