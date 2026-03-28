import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '特定商取引法に基づく表示 | GACHA PLATFORM',
  description: '特定商取引法に基づく表示',
}

const rows = [
  { label: '販売業者', value: '{{company_name}}' },
  { label: '代表者', value: '{{representative}}' },
  { label: '所在地', value: '{{address}}' },
  { label: '電話番号', value: '{{phone}}' },
  { label: 'メールアドレス', value: '{{email}}' },
  { label: '販売URL', value: '{{site_url}}' },
  { label: '販売価格', value: '各商品ページに記載の金額' },
  { label: '追加手数料', value: 'なし' },
  {
    label: '受け付け可能な決済手段',
    value: 'クレジットカード、コンビニ決済、PayPay、銀行振込等',
  },
  { label: '決済期間', value: 'ご注文時に決済が完了いたします' },
  {
    label: '商品の引渡時期',
    value:
      'ポイントは決済完了後即時付与されます。実物商品は配送依頼後14営業日以内に発送いたします。',
  },
  { label: '送料', value: '無料（当社負担）' },
  {
    label: '返品・交換',
    value:
      'ポイントの返品・返金・現金への交換は承っておりません。商品到着後3日以内に不備があった場合のみ交換対応いたします。',
  },
  {
    label: '商品の価値保証',
    value:
      'すべての商品パックに含まれる商品の市場価値は、購入金額以上です',
  },
  { label: '古物商許可', value: '{{license}}' },
  { label: '資格', value: '古物商許可証' },
]

export default function TokushohoPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-2xl font-bold text-zinc-900">
        特定商取引法に基づく表示
      </h1>

      <div className="mt-8 overflow-hidden rounded-lg border border-zinc-200">
        <table className="w-full text-sm">
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.label}
                className={i % 2 === 1 ? 'bg-zinc-50' : 'bg-white'}
              >
                <th className="w-1/3 border-b border-zinc-200 px-4 py-3 text-left font-semibold text-zinc-900">
                  {row.label}
                </th>
                <td className="border-b border-zinc-200 px-4 py-3 text-zinc-600">
                  {row.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
