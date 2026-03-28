'use client'

import { useEffect, useRef, useState, useCallback, useMemo } from 'react'

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

// Detect mobile for particle count adjustment
function isMobile(): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 768
}

// ============================================================
// ParticleCanvas - Enhanced with gravity, rotation, size change,
// shape variants (circle, star, petal)
// ============================================================
interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  life: number
  decay: number
  rotation: number
  rotationSpeed: number
  shape: 'circle' | 'star' | 'petal' | 'confetti'
}

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, rotation: number) {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(rotation)
  ctx.beginPath()
  for (let i = 0; i < 5; i++) {
    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2
    const outerX = Math.cos(angle) * r
    const outerY = Math.sin(angle) * r
    if (i === 0) ctx.moveTo(outerX, outerY)
    else ctx.lineTo(outerX, outerY)
    const innerAngle = angle + Math.PI / 5
    ctx.lineTo(Math.cos(innerAngle) * r * 0.4, Math.sin(innerAngle) * r * 0.4)
  }
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

function drawPetal(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, rotation: number) {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(rotation)
  ctx.beginPath()
  ctx.ellipse(0, 0, r, r * 0.5, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawConfetti(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, rotation: number) {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(rotation)
  ctx.fillRect(-r, -r * 0.3, r * 2, r * 0.6)
  ctx.restore()
}

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
    const mobile = isMobile()
    const count = mobile ? Math.floor(config.particleCount * 0.5) : config.particleCount

    const shapes: Particle['shape'][] =
      rank === 'S' || rank === 'last_one'
        ? ['star', 'confetti', 'circle', 'confetti']
        : rank === 'A'
          ? ['petal', 'circle', 'petal']
          : rank === 'B'
            ? ['circle', 'circle']
            : ['circle']

    const particles: Particle[] = []

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5
      const speed = 3 + Math.random() * 10
      particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        size: 3 + Math.random() * 6,
        color: config.colors[Math.floor(Math.random() * config.colors.length)],
        life: 1,
        decay: 0.006 + Math.random() * 0.008,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.15,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
      })
    }

    let frame = 0
    function draw() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      frame++

      // Shockwave rings
      if (config.shockwave && frame < 30) {
        for (let ring = 0; ring < 2; ring++) {
          const rr = frame * 16 - ring * 80
          if (rr > 0) {
            const a = 1 - frame / 30
            ctx.beginPath()
            ctx.arc(cx, cy, rr, 0, Math.PI * 2)
            ctx.strokeStyle = `rgba(255,255,255,${a * 0.4})`
            ctx.lineWidth = 4 - ring * 2
            ctx.stroke()
          }
        }
      }

      let alive = false
      for (const p of particles) {
        if (p.life <= 0) continue
        alive = true
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.12 // gravity
        p.vx *= 0.99
        p.life -= p.decay
        p.rotation += p.rotationSpeed
        const currentSize = p.size * Math.max(0.3, p.life)

        ctx.globalAlpha = Math.max(0, p.life)
        ctx.fillStyle = p.color

        if (p.shape === 'star') {
          drawStar(ctx, p.x, p.y, currentSize, p.rotation)
        } else if (p.shape === 'petal') {
          drawPetal(ctx, p.x, p.y, currentSize, p.rotation)
        } else if (p.shape === 'confetti') {
          drawConfetti(ctx, p.x, p.y, currentSize, p.rotation)
        } else {
          ctx.beginPath()
          ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      ctx.globalAlpha = 1

      if (alive && frame < 180) {
        animRef.current = requestAnimationFrame(draw)
      }
    }
    draw()

    return () => cancelAnimationFrame(animRef.current)
  }, [active, rank, config])

  if (!active) return null
  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-[70]" />
}

// ============================================================
// Countdown - Dark bg + rotating radial rays + rainbow numbers
// ============================================================
export function Countdown({ onComplete }: { onComplete: () => void }) {
  const [count, setCount] = useState(3)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)

  // Rotating radial rays background
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    const cx = canvas.width / 2
    const cy = canvas.height / 2

    let angle = 0
    function drawRays() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = 'rgba(0,0,0,0.95)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const rayCount = 24
      for (let i = 0; i < rayCount; i++) {
        const a = angle + (Math.PI * 2 * i) / rayCount
        const grad = ctx.createLinearGradient(cx, cy, cx + Math.cos(a) * 800, cy + Math.sin(a) * 800)
        grad.addColorStop(0, 'rgba(255,255,255,0)')
        grad.addColorStop(0.3, 'rgba(255,200,50,0.08)')
        grad.addColorStop(1, 'rgba(255,200,50,0)')

        ctx.beginPath()
        ctx.moveTo(cx, cy)
        const spread = Math.PI / rayCount * 0.4
        ctx.lineTo(cx + Math.cos(a - spread) * 1200, cy + Math.sin(a - spread) * 1200)
        ctx.lineTo(cx + Math.cos(a + spread) * 1200, cy + Math.sin(a + spread) * 1200)
        ctx.closePath()
        ctx.fillStyle = grad
        ctx.fill()
      }
      angle += 0.008
      animRef.current = requestAnimationFrame(drawRays)
    }
    drawRays()
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  useEffect(() => {
    if (count <= 0) {
      const t = setTimeout(onComplete, 500)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setCount(c => c - 1), 800)
    return () => clearTimeout(t)
  }, [count, onComplete])

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <canvas ref={canvasRef} className="absolute inset-0" />
      <div key={count} className="gacha-countdown-number relative z-10 text-center">
        {count > 0 ? (
          <span className="gacha-countdown-text gacha-rainbow-text text-[12rem] font-black leading-none drop-shadow-[0_0_60px_rgba(255,200,0,0.6)]">
            {count}
          </span>
        ) : (
          <>
            <span className="gacha-countdown-text gacha-go-text text-[10rem] font-black leading-none text-amber-400 drop-shadow-[0_0_60px_rgba(255,200,0,0.8)]">
              GO!
            </span>
            <div className="gacha-go-flash" />
            <div className="gacha-go-shockwave" />
          </>
        )}
      </div>
      <style>{`
        @keyframes gachaCountdownPop {
          0% { transform: scale(3); opacity: 0; }
          20% { transform: scale(0.8); opacity: 1; }
          35% { transform: scale(1.15); }
          50% { transform: scale(0.95); }
          65% { transform: scale(1.05); }
          80% { transform: scale(1); }
          100% { transform: scale(0.7); opacity: 0; }
        }
        .gacha-countdown-number {
          animation: gachaCountdownPop 0.8s ease-out forwards;
        }
        .gacha-rainbow-text {
          background: linear-gradient(90deg, #ff0000, #ff8800, #ffff00, #00ff00, #0088ff, #8800ff, #ff0000);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gachaRainbowShift 1s linear infinite;
        }
        @keyframes gachaRainbowShift {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        .gacha-go-flash {
          position: fixed;
          inset: 0;
          background: white;
          animation: gachaGoFlash 0.4s ease-out forwards;
          z-index: 5;
          pointer-events: none;
        }
        @keyframes gachaGoFlash {
          0% { opacity: 0; }
          30% { opacity: 0.9; }
          100% { opacity: 0; }
        }
        .gacha-go-shockwave {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          border: 3px solid rgba(255,200,0,0.6);
          transform: translate(-50%, -50%);
          animation: gachaShockwave 0.6s ease-out forwards;
          pointer-events: none;
          z-index: 6;
        }
        @keyframes gachaShockwave {
          0% { width: 0; height: 0; opacity: 1; }
          100% { width: 150vw; height: 150vw; opacity: 0; }
        }
      `}</style>
    </div>
  )
}

// ============================================================
// SlotAnimation - Pachinko-style slot reel animation
// ============================================================
const REEL_SYMBOLS = ['S', 'A', 'B', 'C', '\u2605'] // S, A, B, C, star

const symbolColors: Record<string, string> = {
  S: '#FFD700',
  A: '#FF69B4',
  B: '#4169E1',
  C: '#A9A9A9',
  '\u2605': '#FFD700',
}

export function SlotAnimation({
  rank,
  onComplete,
}: {
  rank: string
  onComplete: () => void
}) {
  const [reelStates, setReelStates] = useState<('spinning' | 'stopping' | 'stopped')[]>(['spinning', 'spinning', 'spinning'])
  const [flashColor, setFlashColor] = useState<string | null>(null)
  const [shakeLevel, setShakeLevel] = useState(0)
  const [exciteText, setExciteText] = useState<string | null>(null)
  const [showGoldExplosion, setShowGoldExplosion] = useState(false)
  const [showLastOne, setShowLastOne] = useState(false)

  // Determine timing based on rank
  const timings = useMemo(() => {
    switch (rank) {
      case 'C':
        return { totalDuration: 2000, hasFlash: false, hasExcite: false, hasExplosion: false }
      case 'B':
        return { totalDuration: 2500, hasFlash: true, hasExcite: false, hasExplosion: false }
      case 'A':
        return { totalDuration: 3000, hasFlash: true, hasExcite: true, hasExplosion: false }
      case 'S':
        return { totalDuration: 4000, hasFlash: true, hasExcite: true, hasExplosion: true }
      case 'last_one':
        return { totalDuration: 4000, hasFlash: true, hasExcite: true, hasExplosion: true }
      default:
        return { totalDuration: 2000, hasFlash: false, hasExcite: false, hasExplosion: false }
    }
  }, [rank])

  useEffect(() => {
    const timeouts: ReturnType<typeof setTimeout>[] = []

    // Reel stop sequence: left at 500ms, center at 800ms, right at 1100ms
    timeouts.push(setTimeout(() => {
      setReelStates(prev => {
        const next = [...prev]
        next[0] = 'stopping'
        return next as ('spinning' | 'stopping' | 'stopped')[]
      })
    }, 500))

    timeouts.push(setTimeout(() => {
      setReelStates(prev => {
        const next = [...prev]
        next[0] = 'stopped'
        return next as ('spinning' | 'stopping' | 'stopped')[]
      })
      setShakeLevel(1)
      setTimeout(() => setShakeLevel(0), 150)
    }, 700))

    timeouts.push(setTimeout(() => {
      setReelStates(prev => {
        const next = [...prev]
        next[1] = 'stopping'
        return next as ('spinning' | 'stopping' | 'stopped')[]
      })
    }, 800))

    timeouts.push(setTimeout(() => {
      setReelStates(prev => {
        const next = [...prev]
        next[1] = 'stopped'
        return next as ('spinning' | 'stopping' | 'stopped')[]
      })
      setShakeLevel(1)
      setTimeout(() => setShakeLevel(0), 150)
    }, 1000))

    timeouts.push(setTimeout(() => {
      setReelStates(prev => {
        const next = [...prev]
        next[2] = 'stopping'
        return next as ('spinning' | 'stopping' | 'stopped')[]
      })
    }, 1100))

    timeouts.push(setTimeout(() => {
      setReelStates(prev => {
        const next = [...prev]
        next[2] = 'stopped'
        return next as ('spinning' | 'stopping' | 'stopped')[]
      })
      setShakeLevel(2)
      setTimeout(() => setShakeLevel(0), 200)
    }, 1300))

    // Post-reel effects based on rank
    if (timings.hasFlash) {
      const flashDelay = 1400
      const color = rank === 'B' ? 'rgba(65,105,225,0.4)'
        : rank === 'A' ? 'rgba(255,105,180,0.5)'
          : 'rgba(255,215,0,0.5)'
      timeouts.push(setTimeout(() => {
        setFlashColor(color)
        setTimeout(() => setFlashColor(null), 300)
      }, flashDelay))
    }

    if (timings.hasExcite) {
      const exciteDelay = 1800
      if (rank === 'A') {
        timeouts.push(setTimeout(() => setExciteText('\u6FC0\u30A2\u30C4\uFF01'), exciteDelay))
      } else if (rank === 'S') {
        timeouts.push(setTimeout(() => {
          setExciteText('\u8D85\u6FC0\u30A2\u30C4\uFF01\uFF01')
          setShakeLevel(3)
          setTimeout(() => setShakeLevel(0), 500)
        }, exciteDelay))
      } else if (rank === 'last_one') {
        timeouts.push(setTimeout(() => {
          setExciteText('\u8D85\u6FC0\u30A2\u30C4\uFF01\uFF01')
          setShakeLevel(3)
          setTimeout(() => setShakeLevel(0), 500)
        }, exciteDelay))
      }
    }

    if (timings.hasExplosion) {
      timeouts.push(setTimeout(() => setShowGoldExplosion(true), 2500))
    }

    if (rank === 'last_one') {
      timeouts.push(setTimeout(() => setShowLastOne(true), 3000))
    }

    // Complete
    timeouts.push(setTimeout(onComplete, timings.totalDuration))

    return () => timeouts.forEach(clearTimeout)
  }, [rank, timings, onComplete])

  // Determine shake transform
  const shakeTransform = shakeLevel === 0 ? 'translate(0, 0)'
    : shakeLevel === 1 ? `translate(${Math.random() * 4 - 2}px, ${Math.random() * 4 - 2}px)`
      : shakeLevel === 2 ? `translate(${Math.random() * 6 - 3}px, ${Math.random() * 6 - 3}px)`
        : `translate(${Math.random() * 10 - 5}px, ${Math.random() * 10 - 5}px)`

  // Rainbow bg for S/last_one post-reel
  const allStopped = reelStates.every(s => s === 'stopped')
  const bgClass = allStopped && (rank === 'S' || rank === 'last_one')
    ? 'gacha-slot-bg-rainbow'
    : allStopped && rank === 'A'
      ? 'gacha-slot-bg-pink'
      : ''

  return (
    <div
      className={`fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/95 ${bgClass}`}
      style={{ transform: shakeTransform }}
    >
      {/* Flash overlay */}
      {flashColor && (
        <div
          className="gacha-rank-flash pointer-events-none absolute inset-0 z-[61]"
          style={{ background: flashColor }}
        />
      )}

      {/* Slot reels */}
      <div className="flex gap-4">
        {[0, 1, 2].map(i => (
          <SlotReel key={i} state={reelStates[i]} finalSymbol={getSymbolForRank(rank, i)} />
        ))}
      </div>

      {/* Excite text */}
      {exciteText && (
        <div className="gacha-excite-text mt-8 text-center">
          <span className={`text-5xl font-black drop-shadow-[0_0_30px_rgba(255,200,0,0.8)] sm:text-7xl ${
            rank === 'A' ? 'text-pink-400' : 'gacha-rainbow-text'
          }`}>
            {exciteText}
          </span>
        </div>
      )}

      {/* LAST ONE overlay */}
      {showLastOne && (
        <div className="gacha-lastone-overlay absolute inset-0 z-[62] flex items-center justify-center">
          <span className="gacha-lastone-text text-6xl font-black text-white drop-shadow-[0_0_40px_rgba(148,0,211,0.8)] sm:text-8xl"
            style={{ WebkitTextStroke: '2px #9B59B6' }}>
            LAST ONE
          </span>
        </div>
      )}

      {/* Gold particle explosion */}
      {showGoldExplosion && <ParticleCanvas rank={rank} active={true} />}

      <style>{`
        .gacha-rank-flash {
          animation: gachaRankFlash 0.3s ease-out forwards;
        }
        @keyframes gachaRankFlash {
          0% { opacity: 0; }
          40% { opacity: 1; }
          100% { opacity: 0; }
        }
        .gacha-slot-bg-rainbow {
          animation: gachaSlotBgRainbow 0.5s ease-in forwards;
        }
        @keyframes gachaSlotBgRainbow {
          0% { background-color: rgba(0,0,0,0.95); }
          100% { background: linear-gradient(135deg, rgba(255,0,0,0.15), rgba(255,200,0,0.15), rgba(0,255,0,0.15), rgba(0,100,255,0.15), rgba(150,0,255,0.15)); }
        }
        .gacha-slot-bg-pink {
          animation: gachaSlotBgPink 0.5s ease-in forwards;
        }
        @keyframes gachaSlotBgPink {
          0% { background-color: rgba(0,0,0,0.95); }
          100% { background: linear-gradient(135deg, rgba(255,105,180,0.2), rgba(219,112,147,0.15)); }
        }
        .gacha-excite-text {
          animation: gachaExciteIn 0.4s ease-out forwards;
        }
        @keyframes gachaExciteIn {
          0% { transform: scale(3) rotate(-5deg); opacity: 0; }
          50% { transform: scale(0.9) rotate(2deg); opacity: 1; }
          70% { transform: scale(1.1) rotate(-1deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        .gacha-rainbow-text {
          background: linear-gradient(90deg, #ff0000, #ff8800, #ffff00, #00ff00, #0088ff, #8800ff, #ff0000);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gachaRainbowShift 0.8s linear infinite;
        }
        @keyframes gachaRainbowShift {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        .gacha-lastone-overlay {
          animation: gachaLastOneIn 0.5s ease-out forwards;
        }
        @keyframes gachaLastOneIn {
          0% { transform: scale(4); opacity: 0; }
          40% { transform: scale(0.9); opacity: 1; }
          60% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        .gacha-lastone-text {
          animation: gachaLastOnePulse 0.6s ease-in-out infinite alternate;
        }
        @keyframes gachaLastOnePulse {
          0% { transform: scale(1); }
          100% { transform: scale(1.05); text-shadow: 0 0 60px rgba(148,0,211,0.8); }
        }
      `}</style>
    </div>
  )
}

function getSymbolForRank(rank: string, reelIndex: number): string {
  if (rank === 'S') return 'S'
  if (rank === 'last_one') return '\u2605'
  if (rank === 'A') return 'A'
  if (rank === 'B') return 'B'
  // C rank: show mixed
  const cSymbols = ['C', 'B', 'C']
  return cSymbols[reelIndex]
}

function SlotReel({ state, finalSymbol }: { state: 'spinning' | 'stopping' | 'stopped'; finalSymbol: string }) {
  const [displaySymbols, setDisplaySymbols] = useState<string[]>([
    REEL_SYMBOLS[Math.floor(Math.random() * REEL_SYMBOLS.length)],
    REEL_SYMBOLS[Math.floor(Math.random() * REEL_SYMBOLS.length)],
    REEL_SYMBOLS[Math.floor(Math.random() * REEL_SYMBOLS.length)],
  ])
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (state === 'spinning') {
      intervalRef.current = setInterval(() => {
        setDisplaySymbols([
          REEL_SYMBOLS[Math.floor(Math.random() * REEL_SYMBOLS.length)],
          REEL_SYMBOLS[Math.floor(Math.random() * REEL_SYMBOLS.length)],
          REEL_SYMBOLS[Math.floor(Math.random() * REEL_SYMBOLS.length)],
        ])
      }, 60)
    } else if (state === 'stopping') {
      if (intervalRef.current) clearInterval(intervalRef.current)
      // Slow down
      let count = 0
      const slow = setInterval(() => {
        count++
        setDisplaySymbols([
          REEL_SYMBOLS[Math.floor(Math.random() * REEL_SYMBOLS.length)],
          finalSymbol,
          REEL_SYMBOLS[Math.floor(Math.random() * REEL_SYMBOLS.length)],
        ])
        if (count > 3) {
          clearInterval(slow)
          setDisplaySymbols([finalSymbol, finalSymbol, finalSymbol])
        }
      }, 80)
      return () => clearInterval(slow)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
      setDisplaySymbols([finalSymbol, finalSymbol, finalSymbol])
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [state, finalSymbol])

  const borderColor = state === 'stopped'
    ? (symbolColors[finalSymbol] || '#888')
    : '#333'

  return (
    <div
      className="flex h-[180px] w-[80px] flex-col items-center justify-center gap-0 overflow-hidden rounded-xl border-2 bg-zinc-900/80 sm:h-[240px] sm:w-[100px]"
      style={{
        borderColor,
        boxShadow: state === 'stopped' ? `0 0 20px ${borderColor}40` : 'none',
        transition: 'border-color 0.3s, box-shadow 0.3s',
      }}
    >
      {displaySymbols.map((sym, idx) => (
        <div
          key={idx}
          className={`flex h-[60px] w-full items-center justify-center text-3xl font-black sm:h-[80px] sm:text-4xl ${
            state === 'spinning' ? 'gacha-reel-blur' : ''
          }`}
          style={{
            color: symbolColors[sym] || '#888',
            textShadow: state === 'stopped' && idx === 1 ? `0 0 15px ${symbolColors[sym] || '#888'}` : 'none',
          }}
        >
          {sym}
        </div>
      ))}
      <style>{`
        .gacha-reel-blur {
          filter: blur(1px);
        }
      `}</style>
    </div>
  )
}

// ============================================================
// CardReveal - Enhanced with rank-specific entry animations
// ============================================================
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

  // Determine entry animation class based on rank
  const entryClass =
    rank === 'S' || rank === 'last_one'
      ? 'gacha-card-fly-up'
      : rank === 'A'
        ? 'gacha-card-spin-in'
        : ''

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
          <div className="gacha-flash absolute inset-0 bg-white" />
        )}

        {/* Gold halo for S/last_one */}
        {phase === 'reveal' && (rank === 'S' || rank === 'last_one') && (
          <div className="gacha-gold-halo pointer-events-none absolute" />
        )}

        {/* Card */}
        <div className={`w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-500 ${
          phase === 'reveal' ? `scale-100 opacity-100 ${entryClass}` : 'scale-50 opacity-0'
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
              <p className={`mt-2 text-sm text-zinc-500 transition-all duration-500 ${
                phase === 'reveal' ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ transitionDelay: '400ms' }}>
                {prizeDescription}
              </p>
            )}
            <div className={`mt-6 flex gap-3 transition-all duration-500 ${
              phase === 'reveal' ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
            style={{ transitionDelay: '500ms' }}>
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
        .gacha-flash {
          animation: gachaFlash 0.5s ease-out forwards;
        }
        @keyframes gachaFlash {
          0% { opacity: 0; }
          50% { opacity: 0.8; }
          100% { opacity: 0; }
        }
        .gacha-card-fly-up {
          animation: gachaCardFlyUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @keyframes gachaCardFlyUp {
          0% { transform: translateY(100vh) scale(0.5); }
          60% { transform: translateY(-20px) scale(1.05); }
          100% { transform: translateY(0) scale(1); }
        }
        .gacha-card-spin-in {
          animation: gachaCardSpinIn 0.7s ease-out forwards;
        }
        @keyframes gachaCardSpinIn {
          0% { transform: rotateY(180deg) scale(0.3); opacity: 0; }
          60% { transform: rotateY(-10deg) scale(1.05); opacity: 1; }
          100% { transform: rotateY(0deg) scale(1); }
        }
        .gacha-gold-halo {
          width: 400px;
          height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,215,0,0.3) 0%, rgba(255,215,0,0.1) 40%, transparent 70%);
          animation: gachaHaloPulse 1.5s ease-in-out infinite alternate;
        }
        @keyframes gachaHaloPulse {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.2); opacity: 1; }
        }
      `}</style>
    </>
  )
}

// ============================================================
// MultiReveal - Cards drop from top with physics bounce
// ============================================================
export function MultiReveal({
  results,
  onClose,
}: {
  results: Array<{ rank: string; name: string; image_url: string | null; description: string | null }>
  onClose: () => void
}) {
  const [revealedCount, setRevealedCount] = useState(0)
  const [showParticles, setShowParticles] = useState(false)
  const [flashRank, setFlashRank] = useState<string | null>(null)

  const rankOrder = ['last_one', 'S', 'A', 'B', 'C']
  const highestRank = results.reduce((best, r) => {
    const bestIdx = rankOrder.indexOf(best)
    const currentIdx = rankOrder.indexOf(r.rank)
    return currentIdx < bestIdx ? r.rank : best
  }, 'C')

  useEffect(() => {
    if (revealedCount < results.length) {
      const t = setTimeout(() => {
        const nextCard = results[revealedCount]
        // Flash screen for S/A ranks
        if (nextCard && (nextCard.rank === 'S' || nextCard.rank === 'A' || nextCard.rank === 'last_one')) {
          setFlashRank(nextCard.rank)
          setTimeout(() => setFlashRank(null), 300)
        }
        setRevealedCount(c => c + 1)
      }, 350)
      return () => clearTimeout(t)
    } else {
      const t = setTimeout(() => setShowParticles(true), 200)
      return () => clearTimeout(t)
    }
  }, [revealedCount, results])

  // Flash color based on rank
  const flashBg = flashRank === 'S' || flashRank === 'last_one'
    ? 'rgba(255,215,0,0.3)'
    : flashRank === 'A'
      ? 'rgba(255,105,180,0.3)'
      : null

  return (
    <>
      <ParticleCanvas rank={highestRank} active={showParticles} />

      {/* Rank flash */}
      {flashBg && (
        <div
          className="gacha-multi-flash pointer-events-none fixed inset-0 z-[65]"
          style={{ background: flashBg }}
        />
      )}

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
                  className={`overflow-hidden rounded-xl border border-zinc-200 ${
                    isRevealed ? 'gacha-card-drop' : 'opacity-0'
                  }`}
                  style={{
                    animationDelay: isRevealed ? '0ms' : undefined,
                  }}
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

      <style>{`
        .gacha-card-drop {
          animation: gachaCardDrop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @keyframes gachaCardDrop {
          0% { transform: translateY(-200px) scale(0.8); opacity: 0; }
          50% { transform: translateY(10px) scale(1.02); opacity: 1; }
          70% { transform: translateY(-5px) scale(1); }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        .gacha-multi-flash {
          animation: gachaMultiFlash 0.3s ease-out forwards;
        }
        @keyframes gachaMultiFlash {
          0% { opacity: 0; }
          40% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </>
  )
}
