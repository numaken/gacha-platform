import { createClient } from '@/lib/supabase/server'
import { GachaCard } from '@/components/gacha/gacha-card'
import { isDemo } from '@/lib/is-demo'
import { demoGachas } from '@/lib/demo-data'

export default async function Home() {
  let gachas

  if (isDemo()) {
    gachas = demoGachas
  } else {
    const supabase = await createClient()
    const { data } = await supabase
      .from('gachas')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
    gachas = data
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <section className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900">
          GACHA <span className="text-blue-600">PLATFORM</span>
        </h1>
        <p className="mt-3 text-lg text-zinc-500">
          ポイントを購入して、商品パックを選ぼう
        </p>
        {isDemo() && (
          <span className="mt-4 inline-block rounded-full bg-amber-100 px-4 py-1.5 text-sm font-bold text-amber-700">
            DEMO MODE
          </span>
        )}
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
