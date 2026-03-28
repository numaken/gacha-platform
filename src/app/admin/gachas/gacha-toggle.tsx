'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function GachaToggle({ gachaId, isActive }: { gachaId: string; isActive: boolean }) {
  const [active, setActive] = useState(isActive)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleToggle = async () => {
    setLoading(true)
    const newValue = !active
    const { error } = await supabase
      .from('gachas')
      .update({ is_active: newValue, updated_at: new Date().toISOString() })
      .eq('id', gachaId)

    if (!error) {
      setActive(newValue)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`rounded-full px-3 py-1 text-xs font-bold transition ${
        active
          ? 'bg-green-100 text-green-700 hover:bg-green-200'
          : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
      } disabled:opacity-50`}
    >
      {active ? '公開中' : '非公開'}
    </button>
  )
}
