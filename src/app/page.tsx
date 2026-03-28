import { createClient } from '@/lib/supabase/server'
import { GachaCard } from '@/components/gacha/gacha-card'

export default async function Home() {
  const supabase = await createClient()
  const { data: gachas } = await supabase
    .from('gachas')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <section className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900">
          GACHA <span className="text-blue-600">PLATFORM</span>
        </h1>
        <p className="mt-3 text-lg text-zinc-500">
          ポイントを購入して、商品パックを選ぼう
        </p>
      </section>

      {gachas && gachas.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {gachas.map((gacha) => (
            <GachaCard key={gacha.id} gacha={gacha} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-zinc-300 py-20 text-center">
          <p className="text-lg text-zinc-400">現在公開中のガチャはありません</p>
        </div>
      )}
    </div>
  )
}
