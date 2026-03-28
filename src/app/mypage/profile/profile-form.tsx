'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface ProfileData {
  id: string
  display_name: string | null
  phone: string | null
  postal_code: string | null
  prefecture: string | null
  city: string | null
  address: string | null
  building: string | null
}

const PREFECTURES = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県',
  '岐阜県', '静岡県', '愛知県', '三重県',
  '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県',
  '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県',
  '福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県',
]

export function ProfileForm({ profile, isDemo = false }: { profile: ProfileData; isDemo?: boolean }) {
  const [form, setForm] = useState({
    display_name: profile.display_name || '',
    phone: profile.phone || '',
    postal_code: profile.postal_code || '',
    prefecture: profile.prefecture || '',
    city: profile.city || '',
    address: profile.address || '',
    building: profile.building || '',
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [smsPhone, setSmsPhone] = useState('')
  const [smsOtpCode, setSmsOtpCode] = useState('')
  const [smsOtpSent, setSmsOtpSent] = useState(false)
  const [smsVerified, setSmsVerified] = useState(!!profile.phone)
  const [smsLoading, setSmsLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleSendSmsOtp = async () => {
    if (!smsPhone || isDemo) return
    setSmsLoading(true)
    setError('')
    const { error: otpError } = await supabase.auth.signInWithOtp({ phone: smsPhone })
    if (otpError) {
      setError('SMS送信に失敗しました / Failed to send SMS')
    } else {
      setSmsOtpSent(true)
    }
    setSmsLoading(false)
  }

  const handleVerifySmsOtp = async () => {
    if (!smsOtpCode || !smsPhone || isDemo) return
    setSmsLoading(true)
    setError('')
    const { error: verifyError } = await supabase.auth.verifyOtp({
      phone: smsPhone,
      token: smsOtpCode,
      type: 'sms',
    })
    if (verifyError) {
      setError('認証コードが正しくありません / Invalid verification code')
    } else {
      setSmsVerified(true)
      setForm(prev => ({ ...prev, phone: smsPhone }))
      setMessage('電話番号を認証しました')
    }
    setSmsLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        display_name: form.display_name || null,
        phone: form.phone || null,
        postal_code: form.postal_code || null,
        prefecture: form.prefecture || null,
        city: form.city || null,
        address: form.address || null,
        building: form.building || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id)

    if (updateError) {
      setError('保存に失敗しました / Failed to save')
    } else {
      setMessage('保存しました')
      router.refresh()
    }

    setLoading(false)
  }

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      {message && (
        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{message}</div>
      )}
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}

      <div>
        <label className="block text-sm font-medium text-zinc-700">表示名</label>
        <input
          type="text"
          value={form.display_name}
          onChange={e => handleChange('display_name', e.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          placeholder="表示名"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700">電話番号</label>
        <input
          type="tel"
          value={form.phone}
          onChange={e => handleChange('phone', e.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          placeholder="090-1234-5678"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700">郵便番号</label>
          <input
            type="text"
            value={form.postal_code}
            onChange={e => handleChange('postal_code', e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            placeholder="123-4567"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700">都道府県</label>
          <select
            value={form.prefecture}
            onChange={e => handleChange('prefecture', e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">選択してください</option>
            {PREFECTURES.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700">市区町村</label>
        <input
          type="text"
          value={form.city}
          onChange={e => handleChange('city', e.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          placeholder="渋谷区"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700">番地</label>
        <input
          type="text"
          value={form.address}
          onChange={e => handleChange('address', e.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          placeholder="1-2-3"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700">建物名</label>
        <input
          type="text"
          value={form.building}
          onChange={e => handleChange('building', e.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          placeholder="○○マンション 101号室"
        />
      </div>

      {/* SMS verification section */}
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
        <p className="text-sm font-bold text-zinc-700">SMS認証</p>
        {isDemo ? (
          <p className="mt-2 text-sm text-zinc-500">SMS認証はデモモードでは利用できません</p>
        ) : smsVerified ? (
          <p className="mt-2 text-sm font-medium text-green-600">認証済み: {form.phone}</p>
        ) : (
          <>
            <p className="mt-1 text-xs text-zinc-400">電話番号を認証するとアカウントのセキュリティが向上します</p>
            <div className="mt-3 flex gap-2">
              <input
                type="tel"
                value={smsPhone}
                onChange={(e) => setSmsPhone(e.target.value)}
                placeholder="+819012345678"
                disabled={smsOtpSent}
                className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={handleSendSmsOtp}
                disabled={!smsPhone || smsOtpSent || smsLoading}
                className="shrink-0 rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50"
              >
                {smsLoading && !smsOtpSent ? '送信中...' : smsOtpSent ? '送信済み' : 'コード送信'}
              </button>
            </div>
            {smsOtpSent && (
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={smsOtpCode}
                  onChange={(e) => setSmsOtpCode(e.target.value)}
                  placeholder="6桁の認証コード"
                  maxLength={6}
                  className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleVerifySmsOtp}
                  disabled={smsOtpCode.length !== 6 || smsLoading}
                  className="shrink-0 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:opacity-50"
                >
                  {smsLoading ? '確認中...' : '認証する'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || isDemo}
        className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? '保存中...' : '保存する'}
      </button>
    </form>
  )
}
