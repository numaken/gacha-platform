import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '利用規約 | GACHA PLATFORM',
  description: 'GACHA PLATFORMの利用規約',
}

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-2xl font-bold text-zinc-900">利用規約</h1>
      <p className="mt-4 text-sm text-zinc-500">
        最終更新日: 2026年3月28日
      </p>

      <div className="mt-8 space-y-0">
        {/* 第1条 */}
        <section>
          <h2 className="mt-8 text-lg font-bold text-zinc-900">第1条（定義）</h2>
          <div className="mt-3 text-sm leading-relaxed text-zinc-600">
            <p>本規約において使用する用語の定義は以下の通りとします。</p>
            <ol className="mt-2 list-inside list-decimal space-y-2">
              <li>「本サービス」とは、当社が運営する、実物商品をオンラインで販売するECプラットフォームをいいます。</li>
              <li>「商品パック」とは、本サービス内で販売される、あらかじめ設定された商品を含むパッケージをいいます。</li>
              <li>「ポイント」とは、本サービス内で商品パックの購入に使用できるデジタル通貨をいいます。</li>
              <li>「会員」とは、本規約に同意の上、所定の手続きにより会員登録を完了した個人をいいます。</li>
              <li>「当社」とは、本サービスを運営する事業者をいいます。</li>
            </ol>
          </div>
        </section>

        {/* 第2条 */}
        <section>
          <h2 className="mt-8 text-lg font-bold text-zinc-900">第2条（適用範囲）</h2>
          <div className="mt-3 text-sm leading-relaxed text-zinc-600">
            <ol className="list-inside list-decimal space-y-2">
              <li>本規約は、本サービスの利用に関する当社と会員との間の権利義務関係を定めるものです。</li>
              <li>本規約は、本サービスの利用に関する一切の関係に適用されます。</li>
              <li>当社が本サービス上で掲載する個別のルールやガイドラインは、本規約の一部を構成するものとします。</li>
            </ol>
          </div>
        </section>

        {/* 第3条 */}
        <section>
          <h2 className="mt-8 text-lg font-bold text-zinc-900">第3条（会員登録）</h2>
          <div className="mt-3 text-sm leading-relaxed text-zinc-600">
            <ol className="list-inside list-decimal space-y-2">
              <li>本サービスの利用を希望する方は、メールアドレスおよびパスワードを登録することで会員登録を行います。</li>
              <li>会員登録にあたり、虚偽の情報を登録することを禁止します。</li>
              <li>当社は、以下の場合に会員登録を拒否することがあります。
                <ul className="ml-4 mt-1 list-inside list-disc space-y-1">
                  <li>虚偽の情報を登録した場合</li>
                  <li>過去に本規約に違反したことがある場合</li>
                  <li>その他当社が不適当と判断した場合</li>
                </ul>
              </li>
            </ol>
          </div>
        </section>

        {/* 第4条 */}
        <section>
          <h2 className="mt-8 text-lg font-bold text-zinc-900">第4条（アカウント管理）</h2>
          <div className="mt-3 text-sm leading-relaxed text-zinc-600">
            <ol className="list-inside list-decimal space-y-2">
              <li>会員は、自己の責任においてアカウント情報（メールアドレスおよびパスワード）を管理するものとします。</li>
              <li>会員は、アカウント情報を第三者に利用させ、または譲渡、貸与、売買等を行ってはなりません。</li>
              <li>アカウント情報の管理不十分、第三者による使用等による損害は、会員が負担するものとし、当社は一切の責任を負いません。</li>
            </ol>
          </div>
        </section>

        {/* 第5条 */}
        <section>
          <h2 className="mt-8 text-lg font-bold text-zinc-900">第5条（ポイントの購入）</h2>
          <div className="mt-3 text-sm leading-relaxed text-zinc-600">
            <ol className="list-inside list-decimal space-y-2">
              <li>会員は、当社が定める決済手段により、ポイントを購入することができます。</li>
              <li>ポイントの購入代金は、決済時に即時請求されます。</li>
              <li>ポイントの有効期限は、購入日から1ヶ月間とします。有効期限を経過したポイントは自動的に失効し、返金の対象とはなりません。</li>
              <li>購入済みのポイントの返品、返金、現金への交換はできません。</li>
            </ol>
          </div>
        </section>

        {/* 第6条 */}
        <section>
          <h2 className="mt-8 text-lg font-bold text-zinc-900">第6条（ポイントの利用）</h2>
          <div className="mt-3 text-sm leading-relaxed text-zinc-600">
            <ol className="list-inside list-decimal space-y-2">
              <li>ポイントは、本サービス内における商品パックの購入にのみ使用できます。</li>
              <li>ポイントを現金、その他の電子マネー、暗号資産等に交換することはできません。</li>
              <li>ポイントは、他の会員に譲渡、貸与、売買等を行うことはできません。</li>
              <li>各商品パックに含まれる商品は、パック購入に必要なポイント相当額（1ポイント=1円）以上の市場価値を有します。</li>
            </ol>
          </div>
        </section>

        {/* 第7条 */}
        <section>
          <h2 className="mt-8 text-lg font-bold text-zinc-900">第7条（商品パックの購入と商品の割り当て）</h2>
          <div className="mt-3 text-sm leading-relaxed text-zinc-600">
            <ol className="list-inside list-decimal space-y-2">
              <li>各商品パックには、あらかじめ設定された商品が含まれており、購入時に商品が割り当てられます。</li>
              <li>すべての商品パックに実物商品が含まれています。</li>
              <li>割り当てられた商品の内容は、各商品パックの商品一覧に記載された商品のいずれかとなります。</li>
              <li>商品の割り当て結果に対する異議申立てはお受けいたしかねます。</li>
              <li>すべての商品パックに含まれる商品の市場価値は、購入に使用したポイント相当額以上であることを保証します。</li>
            </ol>
          </div>
        </section>

        {/* 第8条 */}
        <section>
          <h2 className="mt-8 text-lg font-bold text-zinc-900">第8条（商品の配送）</h2>
          <div className="mt-3 text-sm leading-relaxed text-zinc-600">
            <ol className="list-inside list-decimal space-y-2">
              <li>会員が配送を依頼した商品は、配送依頼後14営業日以内に発送いたします。</li>
              <li>送料は当社が負担します。</li>
              <li>配送先は日本国内に限ります。</li>
              <li>会員が登録した配送先情報に誤りがあった場合、再配送にかかる費用は会員の負担とします。</li>
              <li>配送業者の事情その他不可抗力により配送が遅延した場合、当社は一切の責任を負いません。</li>
            </ol>
          </div>
        </section>

        {/* 第9条 */}
        <section>
          <h2 className="mt-8 text-lg font-bold text-zinc-900">第9条（商品の交換）</h2>
          <div className="mt-3 text-sm leading-relaxed text-zinc-600">
            <ol className="list-inside list-decimal space-y-2">
              <li>会員は、割り当てられた商品をポイントに交換することができます。交換レートは各商品に設定された交換レートに基づきます。</li>
              <li>ポイントへの交換を行った場合、当該商品の配送を受ける権利は消滅します。</li>
              <li>交換後のポイントは、本サービス内でのみ利用可能です。</li>
            </ol>
          </div>
        </section>

        {/* 第10条 */}
        <section>
          <h2 className="mt-8 text-lg font-bold text-zinc-900">第10条（禁止事項）</h2>
          <div className="mt-3 text-sm leading-relaxed text-zinc-600">
            <p>会員は、本サービスの利用にあたり、以下の行為を行ってはなりません。</p>
            <ol className="mt-2 list-inside list-decimal space-y-2">
              <li>法令または公序良俗に反する行為</li>
              <li>不正アクセス、システムへの攻撃等の行為</li>
              <li>他の会員または第三者の権利を侵害する行為</li>
              <li>虚偽の情報を登録する行為</li>
              <li>転売目的での大量購入行為</li>
              <li>自動化ツール等を使用した不正な購入行為</li>
              <li>本サービスの運営を妨害する行為</li>
              <li>その他当社が不適切と判断する行為</li>
            </ol>
          </div>
        </section>

        {/* 第11条 */}
        <section>
          <h2 className="mt-8 text-lg font-bold text-zinc-900">第11条（知的財産権）</h2>
          <div className="mt-3 text-sm leading-relaxed text-zinc-600">
            <ol className="list-inside list-decimal space-y-2">
              <li>本サービスに関する知的財産権は、すべて当社または正当な権利者に帰属します。</li>
              <li>会員は、当社の事前の書面による承諾なく、本サービスのコンテンツを複製、転載、改変、その他二次利用することはできません。</li>
            </ol>
          </div>
        </section>

        {/* 第12条 */}
        <section>
          <h2 className="mt-8 text-lg font-bold text-zinc-900">第12条（免責事項）</h2>
          <div className="mt-3 text-sm leading-relaxed text-zinc-600">
            <ol className="list-inside list-decimal space-y-2">
              <li>当社は、本サービスの内容について、その正確性、完全性、有用性等について保証いたしません。</li>
              <li>当社は、本サービスの利用により生じた損害について、当社の故意または重過失による場合を除き、一切の責任を負いません。</li>
              <li>当社は、天災地変、戦争、テロ、暴動、法令の制定改廃、政府機関の介入その他不可抗力により生じた損害について、一切の責任を負いません。</li>
            </ol>
          </div>
        </section>

        {/* 第13条 */}
        <section>
          <h2 className="mt-8 text-lg font-bold text-zinc-900">第13条（個人情報の取り扱い）</h2>
          <div className="mt-3 text-sm leading-relaxed text-zinc-600">
            <p>当社は、会員の個人情報を、別途定める「プライバシーポリシー」に基づき適切に取り扱います。</p>
          </div>
        </section>

        {/* 第14条 */}
        <section>
          <h2 className="mt-8 text-lg font-bold text-zinc-900">第14条（サービスの変更・中断）</h2>
          <div className="mt-3 text-sm leading-relaxed text-zinc-600">
            <ol className="list-inside list-decimal space-y-2">
              <li>当社は、会員に事前に通知することなく、本サービスの内容を変更し、または本サービスの提供を中断もしくは終了することができます。</li>
              <li>当社は、本サービスの変更、中断または終了により会員に生じた損害について、一切の責任を負いません。</li>
              <li>当社は、サービスの終了に際し、未使用ポイントの取り扱いについて合理的な措置を講じるよう努めます。</li>
            </ol>
          </div>
        </section>

        {/* 第15条 */}
        <section>
          <h2 className="mt-8 text-lg font-bold text-zinc-900">第15条（退会）</h2>
          <div className="mt-3 text-sm leading-relaxed text-zinc-600">
            <ol className="list-inside list-decimal space-y-2">
              <li>会員は、当社所定の方法により退会することができます。</li>
              <li>退会時に未使用のポイントがある場合、当該ポイントは失効します。返金はいたしかねます。</li>
              <li>退会後も、未配送の商品がある場合は、配送完了まで当社は責任を持って対応します。</li>
            </ol>
          </div>
        </section>

        {/* 第16条 */}
        <section>
          <h2 className="mt-8 text-lg font-bold text-zinc-900">第16条（損害賠償）</h2>
          <div className="mt-3 text-sm leading-relaxed text-zinc-600">
            <ol className="list-inside list-decimal space-y-2">
              <li>会員が本規約に違反し、当社に損害を与えた場合、会員は当社に対し損害を賠償する義務を負います。</li>
              <li>当社が会員に対して損害賠償責任を負う場合、その額は当該会員が過去1ヶ月間に当社に支払った金額を上限とします。</li>
            </ol>
          </div>
        </section>

        {/* 第17条 */}
        <section>
          <h2 className="mt-8 text-lg font-bold text-zinc-900">第17条（準拠法）</h2>
          <div className="mt-3 text-sm leading-relaxed text-zinc-600">
            <p>本規約の解釈および適用は、日本法に準拠するものとします。</p>
          </div>
        </section>

        {/* 第18条 */}
        <section>
          <h2 className="mt-8 text-lg font-bold text-zinc-900">第18条（管轄裁判所）</h2>
          <div className="mt-3 text-sm leading-relaxed text-zinc-600">
            <p>本規約に関する紛争については、当社の本店所在地を管轄する地方裁判所を第一審の専属的合意管轄裁判所とします。</p>
          </div>
        </section>
      </div>
    </div>
  )
}
