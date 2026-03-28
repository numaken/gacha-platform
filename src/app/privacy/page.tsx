import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'プライバシーポリシー | GACHA PLATFORM',
  description: 'GACHA PLATFORMのプライバシーポリシー',
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-2xl font-bold text-zinc-900">プライバシーポリシー</h1>
      <p className="mt-4 text-sm text-zinc-500">
        最終更新日: 2026年3月28日
      </p>

      <div className="mt-6 text-sm leading-relaxed text-zinc-600">
        <p>
          当社（以下「当社」といいます）は、本サービスにおける個人情報の取り扱いについて、以下の通りプライバシーポリシーを定めます。
        </p>
      </div>

      <div className="mt-8 space-y-0">
        {/* 1 */}
        <section>
          <h2 className="mt-8 text-lg font-bold text-zinc-900">1. 個人情報の定義</h2>
          <div className="mt-3 text-sm leading-relaxed text-zinc-600">
            <p>
              本ポリシーにおいて「個人情報」とは、個人情報の保護に関する法律（個人情報保護法）に定義される個人情報を指し、生存する個人に関する情報であって、氏名、メールアドレス、住所、電話番号その他の記述等により特定の個人を識別できるものをいいます。
            </p>
          </div>
        </section>

        {/* 2 */}
        <section>
          <h2 className="mt-8 text-lg font-bold text-zinc-900">2. 個人情報の収集方法</h2>
          <div className="mt-3 text-sm leading-relaxed text-zinc-600">
            <p>当社は、以下の場合に個人情報を収集することがあります。</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>会員登録時（メールアドレス、パスワード、表示名）</li>
              <li>商品購入時（決済に関する情報）</li>
              <li>配送依頼時（氏名、住所、電話番号）</li>
              <li>お問い合わせ時（氏名、メールアドレス、お問い合わせ内容）</li>
            </ul>
          </div>
        </section>

        {/* 3 */}
        <section>
          <h2 className="mt-8 text-lg font-bold text-zinc-900">3. 利用目的</h2>
          <div className="mt-3 text-sm leading-relaxed text-zinc-600">
            <p>当社は、収集した個人情報を以下の目的で利用いたします。</p>
            <ol className="mt-2 list-inside list-decimal space-y-1">
              <li>本サービスの提供および運営</li>
              <li>会員の本人確認</li>
              <li>決済処理</li>
              <li>商品の配送</li>
              <li>お問い合わせへの対応</li>
              <li>利用状況の分析およびサービス改善</li>
              <li>利用規約に違反する行為の調査</li>
              <li>サービスの改善および新機能の開発</li>
              <li>重要なお知らせの通知</li>
              <li>マーケティング活動（オプトアウト可能です）</li>
              <li>法令に基づく対応</li>
            </ol>
          </div>
        </section>

        {/* 4 */}
        <section>
          <h2 className="mt-8 text-lg font-bold text-zinc-900">4. 第三者への提供</h2>
          <div className="mt-3 text-sm leading-relaxed text-zinc-600">
            <p>
              当社は、以下の場合を除き、会員の個人情報を第三者に提供することはありません。
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>会員の同意がある場合</li>
              <li>決済処理のため、Stripe, Inc. およびその関連会社に提供する場合</li>
              <li>商品配送のため、配送業者に提供する場合</li>
              <li>法令に基づく場合</li>
              <li>人の生命、身体または財産の保護のために必要がある場合</li>
            </ul>
          </div>
        </section>

        {/* 5 */}
        <section>
          <h2 className="mt-8 text-lg font-bold text-zinc-900">5. 個人情報の安全管理</h2>
          <div className="mt-3 text-sm leading-relaxed text-zinc-600">
            <p>
              当社は、個人情報の漏洩、滅失またはき損の防止のため、適切な安全管理措置を講じます。個人情報の取り扱いに関する従業員教育を実施し、適正な管理を行います。
            </p>
          </div>
        </section>

        {/* 6 */}
        <section>
          <h2 className="mt-8 text-lg font-bold text-zinc-900">6. 個人情報の開示・訂正・削除</h2>
          <div className="mt-3 text-sm leading-relaxed text-zinc-600">
            <ol className="list-inside list-decimal space-y-2">
              <li>会員は、当社に対して自己の個人情報の開示を請求することができます。</li>
              <li>開示の結果、情報が誤っている場合は、訂正または削除を請求することができます。</li>
              <li>上記の請求は、お問い合わせページまたはメールにて受け付けます。</li>
              <li>本人確認を行った上で、合理的な期間内に対応いたします。</li>
            </ol>
          </div>
        </section>

        {/* 7 */}
        <section>
          <h2 className="mt-8 text-lg font-bold text-zinc-900">7. Cookieの使用</h2>
          <div className="mt-3 text-sm leading-relaxed text-zinc-600">
            <ol className="list-inside list-decimal space-y-2">
              <li>本サービスでは、サービスの提供および改善のためにCookieを使用する場合があります。</li>
              <li>Cookieにより、会員のブラウザを識別しますが、個人を特定する情報は含まれません。</li>
              <li>会員は、ブラウザの設定によりCookieの受け入れを拒否することができますが、その場合一部のサービスが利用できなくなる場合があります。</li>
            </ol>
          </div>
        </section>

        {/* 8 */}
        <section>
          <h2 className="mt-8 text-lg font-bold text-zinc-900">8. プライバシーポリシーの変更</h2>
          <div className="mt-3 text-sm leading-relaxed text-zinc-600">
            <ol className="list-inside list-decimal space-y-2">
              <li>当社は、必要に応じて本ポリシーを変更することがあります。</li>
              <li>変更後のプライバシーポリシーは、本ページに掲載した時点から効力を生じるものとします。</li>
              <li>重要な変更を行う場合は、本サービス上で事前に通知いたします。</li>
            </ol>
          </div>
        </section>

        {/* 9 */}
        <section>
          <h2 className="mt-8 text-lg font-bold text-zinc-900">9. お問い合わせ窓口</h2>
          <div className="mt-3 text-sm leading-relaxed text-zinc-600">
            <p>
              個人情報の取り扱いに関するお問い合わせは、お問い合わせページよりご連絡ください。
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
