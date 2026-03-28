'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

const rankConfig: Record<string, {
  label: string
  colors: string[]
  bg: string
  particleCount: number
  shockwave: boolean
}> = {
  S: {
    label: 'S賞',
    colors: ['#FFD700', '#FFA500', '#FF6347', '#FFEC8B'],
    bg: 'bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500',
    particleCount: 80,
    shockwave: true,
  },
  A: {
    label: 'A賞',
    colors: ['#FF69B4', '#FF1493', '#DB7093', '#FFB6C1'],
    bg: 'bg-gradient-to-br from-rose-400 via-pink-500 to-fuchsia-500',
    particleCount: 60,
    shockwave: true,
  },
  B: {
    label: 'B賞',
    colors: ['#4169E1', '#6495ED', '#87CEEB', '#00BFFF'],
    bg: 'bg-gradient-to-br from-blue-400 via-indigo-500 to-cyan-500',
    particleCount: 40,
    shockwave: false,
  },
  C: {
    label: 'C賞',
    colors: ['#A9A9A9', '#C0C0C0', '#D3D3D3', '#808080'],
    bg: 'bg-gradient-to-br from-zinc-400 via-zinc-500 to-zinc-600',
    particleCount: 20,
    shockwave: false,
  },
  last_one: {
    label: 'ラストワン賞',
    colors: ['#9B59B6', '#8E44AD', '#E91E63', '#FFD700'],
    bg: 'bg-gradient-to-br from-purple-500 via-violet-600 to-fuchsia-600',
    particleCount: 100,
    shockwave: true,
  },
}

// Canvas particle explosion
function ParticleCanvas({ rank, active }: { rank: string; active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const config = rankConfig[rank] || rankConfig.C

  useEffect(() => {
    if (!active || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const cx = canvas.width / 2
    const cy = canvas.height / 2

    interface P { x: number; y: number; vx: number; vy: number; size: number; color: string; life: number; decay: number }
    const particles: P[] = []

    for (let i = 0; i < config.particleCount; i++) {
      const angle = (Math.PI * 2 * i) / config.particleCount + Math.random() * 0.5
      const speed = 3 + Math.random() * 8
      particles.push({
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        size: 3 + Math.random() * 5,
        color: config.colors[Math.floor(Math.random() * config.colors.length)],
        life: 1,
        decay: 0.008 + Math.random() * 0.01,
      })
    }

    let frame = 0
    function draw() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      frame++

      if (config.shockwave && frame < 25) {
        const r = frame * 18
        const a = 1 - frame / 25
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(255,255,255,${a * 0.5})`
        ctx.lineWidth = 3
        ctx.stroke()
      }

      let alive = false
      for (const p of particles) {
        if (p.life <= 0) continue
        alive = true
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.1
        p.vx *= 0.99
        p.life -= p.decay

        ctx.globalAlpha = Math.max(0, p.life)
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1

      if (alive && frame < 150) {
        animRef.current = requestAnimationFrame(draw)
      }
    }
    draw()

    return () => cancelAnimationFrame(animRef.current)
  }, [active, rank, config])

  if (!active) return null
  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-[70]" />
}

// Countdown: 3 -> 2 -> 1 -> GO
export function Countdown({ onComplete }: { onComplete: () => void }) {
  const [count, setCount] = useState(3)

  useEffect(() => {
    if (count <= 0) {
      const t = setTimeout(onComplete, 300)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setCount(c => c - 1), 700)
    return () => clearTimeout(t)
  }, [count, onComplete])

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90">
      <div
        key={count}
        className="animate-countdown text-center"
      >
        {count > 0 ? (
          <span className="text-9xl font-black text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]">
            {count}
          </span>
        ) : (
          <span className="text-7xl font-black text-amber-400 drop-shadow-[0_0_30px_rgba(255,200,0,0.5)]">
            GO!
          </span>
        )}
      </div>
      <style>{`
        @keyframes countdownPop {
          0% { transform: scale(2.5); opacity: 0; }
          30% { transform: scale(0.9); opacity: 1; }
          50% { transform: scale(1.1); }
          70% { transform: scale(1); }
          100% { transform: scale(0.8); opacity: 0; }
        }
        .animate-countdown {
          animation: countdownPop 0.7s ease-out forwards;
        }
      `}</style>
    </div>
  )
}

// Single result: reveal with animation
export function CardReveal({
  rank,
  prizeName,
  prizeImage,
  prizeDescription,
  onClose,
  retryCost,
  onRetry,
  retryLoading,
}: {
  rank: string
  prizeName: string
  prizeImage: string | null
  prizeDescription: string | null
  onClose: () => void
  retryCost?: number | null
  onRetry?: () => void
  retryLoading?: boolean
}) {
  const [phase, setPhase] = useState<'hidden' | 'flash' | 'reveal'>('hidden')
  const config = rankConfig[rank] || rankConfig.C

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('flash'), 300)
    const t2 = setTimeout(() => setPhase('reveal'), 800)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <>
      <ParticleCanvas rank={rank} active={phase === 'reveal'} />
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4">

        {/* Flash */}
        {phase === 'flash' && (
          <div className="animate-flash absolute inset-0 bg-white" />
        )}

        {/* Card */}
        <div className={`w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-500 ${
          phase === 'reveal' ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
        }`}>
          <div className={`${config.bg} p-8 text-center`}>
            <span className={`inline-block text-5xl font-black text-white drop-shadow-lg transition-all duration-700 ${
              phase === 'reveal' ? 'scale-100 translate-y-0' : 'scale-150 translate-y-4'
            }`}>
              {config.label}
            </span>
          </div>

          <div className="p-6 text-center">
            {prizeImage && (
              <img
                src={prizeImage}
                alt={prizeName}
                className={`mx-auto mb-4 h-40 w-40 rounded-xl object-cover transition-all duration-500 delay-200 ${
                  phase === 'reveal' ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
                }`}
              />
            )}
            <h3 className={`text-xl font-bold text-zinc-900 transition-all duration-500 delay-300 ${
              phase === 'reveal' ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}>
              {prizeName}
            </h3>
            {prizeDescription && (
              <p className={`mt-2 text-sm text-zinc-500 transition-all duration-500 delay-400 ${
                phase === 'reveal' ? 'opacity-100' : 'opacity-0'
              }`}>
                {prizeDescription}
              </p>
            )}
            <div className={`mt-6 flex gap-3 transition-all duration-500 delay-500 ${
              phase === 'reveal' ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}>
              {retryCost != null && retryCost > 0 && onRetry && (
                <button
                  onClick={onRetry}
                  disabled={retryLoading}
                  className="flex-1 rounded-xl bg-amber-500 py-3 text-sm font-bold text-white transition hover:bg-amber-600 disabled:opacity-50"
                >
                  {retryLoading ? '再抽選中...' : `${retryCost.toLocaleString()} PT でリトライ`}
                </button>
              )}
              <button
                onClick={onClose}
                className={`${retryCost != null && retryCost > 0 && onRetry ? 'flex-1' : 'w-full'} rounded-xl bg-zinc-900 py-3 text-sm font-bold text-white transition hover:bg-zinc-800`}
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes flash {
          0% { opacity: 0; }
          50% { opacity: 0.8; }
          100% { opacity: 0; }
        }
        .animate-flash {
          animation: flash 0.5s ease-out forwards;
        }
      `}</style>
    </>
  )
}

// Multi result (10連): sequential reveal
export function MultiReveal({
  results,
  onClose,
}: {
  results: Array<{ rank: string; name: string; image_url: string | null; description: string | null }>
  onClose: () => void
}) {
  const [revealedCount, setRevealedCount] = useState(0)
  const [showParticles, setShowParticles] = useState(false)

  const rankOrder = ['last_one', 'S', 'A', 'B', 'C']
  const highestRank = results.reduce((best, r) => {
    const bestIdx = rankOrder.indexOf(best)
    const currentIdx = rankOrder.indexOf(r.rank)
    return currentIdx < bestIdx ? r.rank : best
  }, 'C')

  useEffect(() => {
    if (revealedCount < results.length) {
      const t = setTimeout(() => {
        setRevealedCount(c => c + 1)
      }, 250)
      return () => clearTimeout(t)
    } else {
      setShowParticles(true)
    }
  }, [revealedCount, results.length])

  return (
    <>
      <ParticleCanvas rank={highestRank} active={showParticles} />
      <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/90 p-4">
        <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
          <h3 className="mb-4 text-center text-xl font-bold text-zinc-900">
            {results.length}連 結果
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {results.map((prize, idx) => {
              const cfg = rankConfig[prize.rank] || rankConfig.C
              const isRevealed = idx < revealedCount
              return (
                <div
                  key={idx}
                  className={`overflow-hidden rounded-xl border border-zinc-200 transition-all duration-300 ${
                    isRevealed ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
                  }`}
                  style={{ transitionDelay: `${idx * 80}ms` }}
                >
                  <div className={`${cfg.bg} px-3 py-1.5 text-center`}>
                    <span className="text-sm font-extrabold text-white">{cfg.label}</span>
                  </div>
                  <div className="p-3 text-center">
                    {prize.image_url && (
                      <img src={prize.image_url} alt={prize.name} className="mx-auto mb-2 h-16 w-16 rounded-lg object-cover" />
                    )}
                    <p className="text-xs font-bold text-zinc-900 line-clamp-2">{prize.name}</p>
                  </div>
                </div>
              )
            })}
          </div>
          <button
            onClick={onClose}
            className={`mt-6 w-full rounded-xl bg-zinc-900 py-3 text-sm font-bold text-white transition-all duration-300 hover:bg-zinc-800 ${
              revealedCount >= results.length ? 'opacity-100' : 'opacity-0'
            }`}
          >
            閉じる
          </button>
        </div>
      </div>
    </>
  )
}
