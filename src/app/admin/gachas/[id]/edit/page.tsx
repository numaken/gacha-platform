import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { GachaEditForm } from './gacha-edit-form'

export default async function EditGachaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: gacha } = await supabase
    .from('gachas')
    .select('*')
    .eq('id', id)
    .single()

  if (!gacha) notFound()

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900">ガチャ編集</h1>
      <GachaEditForm gacha={gacha} />
    </div>
  )
}
