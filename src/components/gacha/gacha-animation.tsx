'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const rankConfig: Record<string, {
  label: string
  colors: string[]
  gradient: string
  particleCount: number
  shockwave: boolean
}> = {
  S: {
    label: 'S賞',
    colors: ['#FFD700', '#FFA500', '#FF6347', '#FFEC8B'],
    gradient: 'from-yellow-400 via-amber-500 to-orange-500',
    particleCount: 80,
    shockwave: true,
  },
  A: {
    label: 'A賞',
    colors: ['#FF69B4', '#FF1493', '#DB7093', '#FFB6C1'],
    gradient: 'from-rose-400 via-pink-500 to-fuchsia-500',
    particleCount: 60,
    shockwave: true,
  },
  B: {
    label: 'B賞',
    colors: ['#4169E1', '#6495ED', '#87CEEB', '#00BFFF'],
    gradient: 'from-blue-400 via-indigo-500 to-cyan-500',
    particleCount: 40,
    shockwave: false,
  },
  C: {
    label: 'C賞',
    colors: ['#A9A9A9', '#C0C0C0', '#D3D3D3', '#808080'],
    gradient: 'from-zinc-400 via-zinc-500 to-zinc-600',
    particleCount: 20,
    shockwave: false,
  },
  last_one: {
    label: 'ラストワン賞',
    colors: ['#9B59B6', '#8E44AD', '#E91E63', '#FFD700'],
    gradient: 'from-purple-500 via-violet-600 to-fuchsia-600',
    particleCount: 100,
    shockwave: true,
  },
}

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  life: number
  maxLife: number
  rotation: number
  rotationSpeed: number
  shape: 'circle' | 'star' | 'diamond'
}

function ParticleCanvas({ rank, active }: { rank: string; active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animFrameRef = useRef<number>(0)
  const config = rankConfig[rank] || rankConfig.C

  useEffect(() => {
    if (!active || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // Create particles
    const particles: Particle[] = []
    const cx = canvas.width / 2
    const cy = canvas.height / 2

    for (let i = 0; i < config.particleCount; i++) {
      const angle = (Math.PI * 2 * i) / config.particleCount + Math.random() * 0.5
      const speed = 3 + Math.random() * 8
      const shapes: Array<'circle' | 'star' | 'diamond'> = ['circle', 'star', 'diamond']
      particles.push({
        id: i,
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 6,
        color: config.colors[Math.floor(Math.random() * config.colors.length)],
        life: 1,
        maxLife: 60 + Math.random() * 40,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
      })
    }
    particlesRef.current = particles

    let frame = 0
    function animate() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      frame++

      // Shockwave
      if (config.shockwave && frame < 30) {
        const radius = frame * 15
        const alpha = 1 - frame / 30
        ctx.beginPath()
        ctx.arc(cx, cy, radius, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.6})`
        ctx.lineWidth = 4
        ctx.stroke()

        // Inner glow
        const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
        grd.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.1})`)
        grd.addColorStop(1, `rgba(255, 255, 255, 0)`)
        ctx.fillStyle = grd
        ctx.fill()
      }

      // Update and draw particles
      for (const p of particlesRef.current) {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.08 // gravity
        p.vx *= 0.99
        p.life -= 1 / p.maxLife
        p.rotation += p.rotationSpeed

        if (p.life <= 0) continue

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rotation)
        ctx.globalAlpha = p.life
        ctx.fillStyle = p.color

        if (p.shape === 'circle') {
          ctx.beginPath()
          ctx.arc(0, 0, p.size, 0, Math.PI * 2)
          ctx.fill()
        } else if (p.shape === 'star') {
          drawStar(ctx, 0, 0, 5, p.size, p.size / 2)
        } else {
          ctx.rotate(Math.PI / 4)
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size)
        }

        ctx.restore()
      }

      if (frame < 120) {
        animFrameRef.current = requestAnimationFrame(animate)
      }
    }

    animate()

    return () => {
      cancelAnimationFrame(animFrameRef.current)
    }
  }, [active, rank, config])

  if (!active) return null

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[60]"
    />
  )
}

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) {
  let rot = (Math.PI / 2) * 3
  const step = Math.PI / spikes
  ctx.beginPath()
  ctx.moveTo(cx, cy - outerRadius)
  for (let i = 0; i < spikes; i++) {
    ctx.lineTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius)
    rot += step
    ctx.lineTo(cx + Math.cos(rot) * innerRadius, cy + Math.sin(rot) * innerRadius)
    rot += step
  }
  ctx.lineTo(cx, cy - outerRadius)
  ctx.closePath()
  ctx.fill()
}

// Countdown before reveal
function Countdown({ onComplete }: { onComplete: () => void }) {
  const [count, setCount] = useState(3)

  useEffect(() => {
    if (count === 0) {
      onComplete()
      return
    }
    const timer = setTimeout(() => setCount(count - 1), 600)
    return () => clearTimeout(timer)
  }, [count, onComplete])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
      <AnimatePresence mode="wait">
        <motion.div
          key={count}
          initial={{ scale: 3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="text-8xl font-extrabold text-white"
        >
          {count > 0 ? count : ''}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// Card flip reveal
function CardReveal({
  rank,
  prizeName,
  prizeImage,
  prizeDescription,
  onClose,
}: {
  rank: string
  prizeName: string
  prizeImage: string | null
  prizeDescription: string | null
  onClose: () => void
}) {
  const [revealed, setRevealed] = useState(false)
  const [showParticles, setShowParticles] = useState(false)
  const config = rankConfig[rank] || rankConfig.C

  useEffect(() => {
    const timer = setTimeout(() => {
      setRevealed(true)
      setShowParticles(true)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      <ParticleCanvas rank={rank} active={showParticles} />
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
        <div className="perspective-1000 w-full max-w-sm">
          <motion.div
            className="relative"
            animate={{ rotateY: revealed ? 180 : 0 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Card back */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 p-8"
              style={{ backfaceVisibility: 'hidden' }}
              animate={{ opacity: revealed ? 0 : 1 }}
              transition={{ duration: 0.1, delay: revealed ? 0.4 : 0 }}
            >
              <div className="text-center">
                <motion.div
                  className="mx-auto h-24 w-24 rounded-full border-4 border-zinc-600"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <div className="flex h-full items-center justify-center text-4xl">?</div>
                </motion.div>
                <p className="mt-4 text-lg font-bold text-zinc-400">開封中...</p>
              </div>
            </motion.div>

            {/* Card front */}
            <motion.div
              className="overflow-hidden rounded-2xl bg-white"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              animate={{ opacity: revealed ? 1 : 0 }}
              transition={{ duration: 0.1, delay: revealed ? 0.4 : 0 }}
            >
              <motion.div
                className={`bg-gradient-to-br ${config.gradient} p-6 text-center`}
                initial={{ scale: 0.8 }}
                animate={revealed ? { scale: [0.8, 1.2, 1] } : {}}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <motion.span
                  className="text-4xl font-extrabold text-white drop-shadow-lg"
                  initial={{ y: 20, opacity: 0 }}
                  animate={revealed ? { y: 0, opacity: 1 } : {}}
                  transition={{ duration: 0.4, delay: 1 }}
                >
                  {config.label}
                </motion.span>
              </motion.div>

              <div className="p-6 text-center">
                {prizeImage && (
                  <motion.img
                    src={prizeImage}
                    alt={prizeName}
                    className="mx-auto mb-4 h-40 w-40 rounded-xl object-cover"
                    initial={{ scale: 0, rotate: -10 }}
                    animate={revealed ? { scale: 1, rotate: 0 } : {}}
                    transition={{ duration: 0.5, delay: 1.2, type: 'spring' }}
                  />
                )}
                <motion.h3
                  className="text-xl font-bold text-zinc-900"
                  initial={{ y: 10, opacity: 0 }}
                  animate={revealed ? { y: 0, opacity: 1 } : {}}
                  transition={{ duration: 0.3, delay: 1.4 }}
                >
                  {prizeName}
                </motion.h3>
                {prizeDescription && (
                  <motion.p
                    className="mt-2 text-sm text-zinc-500"
                    initial={{ opacity: 0 }}
                    animate={revealed ? { opacity: 1 } : {}}
                    transition={{ duration: 0.3, delay: 1.6 }}
                  >
                    {prizeDescription}
                  </motion.p>
                )}
                <motion.button
                  onClick={onClose}
                  className="mt-6 w-full rounded-xl bg-zinc-900 py-3 text-sm font-bold text-white transition hover:bg-zinc-800"
                  initial={{ opacity: 0 }}
                  animate={revealed ? { opacity: 1 } : {}}
                  transition={{ duration: 0.3, delay: 1.8 }}
                >
                  閉じる
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  )
}

// Multi result (10連) reveal
function MultiReveal({
  results,
  onClose,
}: {
  results: Array<{ rank: string; name: string; image_url: string | null; description: string | null }>
  onClose: () => void
}) {
  const [revealedCount, setRevealedCount] = useState(0)
  const [showParticles, setShowParticles] = useState(false)

  // Find the highest rank
  const rankOrder = ['last_one', 'S', 'A', 'B', 'C']
  const highestRank = results.reduce((best, r) => {
    const bestIdx = rankOrder.indexOf(best)
    const currentIdx = rankOrder.indexOf(r.rank)
    return currentIdx < bestIdx ? r.rank : best
  }, 'C')

  useEffect(() => {
    if (revealedCount < results.length) {
      const timer = setTimeout(() => {
        setRevealedCount(revealedCount + 1)
        if (revealedCount + 1 === results.length) {
          setShowParticles(true)
        }
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [revealedCount, results.length])

  return (
    <>
      <ParticleCanvas rank={highestRank} active={showParticles} />
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/90 p-4">
        <div className="w-full max-w-lg">
          <motion.div
            className="rounded-2xl bg-white p-6"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="mb-4 text-center text-xl font-bold text-zinc-900">
              {results.length}連 結果
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {results.map((prize, idx) => {
                const config = rankConfig[prize.rank] || rankConfig.C
                const isRevealed = idx < revealedCount
                return (
                  <motion.div
                    key={idx}
                    className="overflow-hidden rounded-xl border border-zinc-200"
                    initial={{ scale: 0, rotateY: 180 }}
                    animate={isRevealed ? { scale: 1, rotateY: 0 } : {}}
                    transition={{
                      duration: 0.4,
                      delay: idx * 0.1,
                      type: 'spring',
                      stiffness: 200,
                    }}
                  >
                    <div className={`bg-gradient-to-br ${config.gradient} px-3 py-1.5 text-center`}>
                      <span className="text-sm font-extrabold text-white">{config.label}</span>
                    </div>
                    <div className="p-3 text-center">
                      {prize.image_url && (
                        <img src={prize.image_url} alt={prize.name} className="mx-auto mb-2 h-16 w-16 rounded-lg object-cover" />
                      )}
                      <p className="text-xs font-bold text-zinc-900 line-clamp-2">{prize.name}</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
            <motion.button
              onClick={onClose}
              className="mt-6 w-full rounded-xl bg-zinc-900 py-3 text-sm font-bold text-white transition hover:bg-zinc-800"
              initial={{ opacity: 0 }}
              animate={revealedCount >= results.length ? { opacity: 1 } : {}}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              閉じる
            </motion.button>
          </motion.div>
        </div>
      </div>
    </>
  )
}

export { Countdown, CardReveal, MultiReveal }
