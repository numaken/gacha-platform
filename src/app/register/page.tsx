'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { isDemo } from '@/lib/is-demo'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [phone, setPhone] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const demo = isDemo()

  const handleSendOtp = async () => {
    if (!phone) return
    setOtpLoading(true)
    setError('')
    const supabase = createClient()
    const { error: otpError } = await supabase.auth.signInWithOtp({ phone })
    if (otpError) {
      setError('SMS送信に失敗しました / Failed to send SMS')
    } else {
      setOtpSent(true)
    }
    setOtpLoading(false)
  }

  const handleVerifyOtp = async () => {
    if (!otpCode || !phone) return
    setOtpLoading(true)
    setError('')
    const supabase = createClient()
    const { error: verifyError } = await supabase.auth.verifyOtp({
      phone,
      token: otpCode,
      type: 'sms',
    })
    if (verifyError) {
      setError('認証コードが正しくありません / Invalid verification code')
    } else {
      setPhoneVerified(true)
    }
    setOtpLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (demo) return

    setError('')
    setLoading(true)

    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
      },
    })

    if (error) {
      setError('登録に失敗しました。入力内容をご確認ください / Registration failed. Please check your input.')
      setLoading(false)
      return
    }

    if (data.user) {
      await supabase
        .from('profiles')
        .update({ display_name: displayName })
        .eq('id', data.user.id)
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <h1 className="text-center text-2xl font-bold text-zinc-900">新規登録</h1>

      {demo && (
        <div className="mt-6 space-y-3">
          <div className="rounded-lg bg-amber-50 p-4 text-center text-sm font-medium text-amber-600">
            デモモードです。実際の登録はできません。
            <Link href="/" className="mt-2 block text-blue-600 hover:text-blue-700">
              トップに戻る
            </Link>
          </div>
          <div className="rounded-lg bg-zinc-100 p-4 text-center text-sm text-zinc-500">
            SMS認証はデモモードでは利用できません
          </div>
        </div>
      )}

      {!demo && (
        <>
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
            )}

            <div>
              <label className="block text-sm font-medium text-zinc-700">表示名</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700">メールアドレス</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700">パスワード</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-zinc-400">8文字以上</p>
            </div>

            {/* SMS verification (optional) */}
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-sm font-medium text-zinc-700">電話番号認証（任意）</p>
              <p className="mt-1 text-xs text-zinc-400">後からマイページで設定することもできます</p>
              {phoneVerified ? (
                <p className="mt-2 text-sm font-medium text-green-600">認証済み</p>
              ) : (
                <>
                  <div className="mt-3 flex gap-2">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+819012345678"
                      disabled={otpSent}
                      className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={!phone || otpSent || otpLoading}
                      className="shrink-0 rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50"
                    >
                      {otpLoading && !otpSent ? '送信中...' : otpSent ? '送信済み' : 'コード送信'}
                    </button>
                  </div>
                  {otpSent && (
                    <div className="mt-3 flex gap-2">
                      <input
                        type="text"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="6桁の認証コード"
                        maxLength={6}
                        className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        disabled={otpCode.length !== 6 || otpLoading}
                        className="shrink-0 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:opacity-50"
                      >
                        {otpLoading ? '確認中...' : '認証する'}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '登録中...' : '新規登録'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-500">
            すでにアカウントをお持ちの方は{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-700">
              ログイン
            </Link>
          </p>
        </>
      )}
    </div>
  )
}
