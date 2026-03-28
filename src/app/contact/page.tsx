'use client'

import type { FormEvent } from 'react'
import { useState } from 'react'
import { isDemo } from '@/lib/is-demo'

export default function ContactPage() {
  const demo = isDemo()
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (demo) {
      setSubmitted(true)
      return
    }
    // Production: send to API
    setSubmitted(true)
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-2xl font-bold text-zinc-900">お問い合わせ</h1>
      <p className="mt-4 text-sm text-zinc-500">
        お問い合わせいただいてから3営業日以内にご返信いたします。
      </p>

      {submitted ? (
        <div className="mt-8 rounded-lg border border-green-200 bg-green-50 px-6 py-8 text-center">
          {demo && (
            <span className="mb-3 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
              デモモードです
            </span>
          )}
          <p className="text-lg font-bold text-green-800">
            お問い合わせを受け付けました
          </p>
          <p className="mt-2 text-sm text-green-600">
            3営業日以内にご返信いたします。
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-semibold text-zinc-900"
            >
              お名前
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="mt-1 block w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="山田 太郎"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-zinc-900"
            >
              メールアドレス
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="mt-1 block w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="example@email.com"
            />
          </div>

          <div>
            <label
              htmlFor="subject"
              className="block text-sm font-semibold text-zinc-900"
            >
              件名
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              required
              className="mt-1 block w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="お問い合わせの件名"
            />
          </div>

          <div>
            <label
              htmlFor="message"
              className="block text-sm font-semibold text-zinc-900"
            >
              お問い合わせ内容
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={6}
              className="mt-1 block w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="お問い合わせ内容をご記入ください"
            />
          </div>

          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            送信する
          </button>
        </form>
      )}
    </div>
  )
}
