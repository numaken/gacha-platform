import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-zinc-50">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div>
            <h3 className="text-sm font-bold text-zinc-900">GACHA PLATFORM</h3>
            <p className="mt-2 text-xs text-zinc-500">
              オンラインで商品パックを購入できるECサービス
            </p>
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900">サービス</h3>
            <ul className="mt-2 space-y-1">
              <li><Link href="/" className="text-xs text-zinc-500 hover:text-zinc-900">商品一覧</Link></li>
              <li><Link href="/checkout" className="text-xs text-zinc-500 hover:text-zinc-900">ポイント購入</Link></li>
              <li><Link href="/mypage" className="text-xs text-zinc-500 hover:text-zinc-900">マイページ</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900">法的情報</h3>
            <ul className="mt-2 space-y-1">
              <li><Link href="/tokushoho" className="text-xs text-zinc-500 hover:text-zinc-900">特定商取引法に基づく表示</Link></li>
              <li><Link href="/terms" className="text-xs text-zinc-500 hover:text-zinc-900">利用規約</Link></li>
              <li><Link href="/privacy" className="text-xs text-zinc-500 hover:text-zinc-900">プライバシーポリシー</Link></li>
              <li><Link href="/contact" className="text-xs text-zinc-500 hover:text-zinc-900">お問い合わせ</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-zinc-200 pt-8 text-center text-xs text-zinc-400">
          © {new Date().getFullYear()} GACHA PLATFORM. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
