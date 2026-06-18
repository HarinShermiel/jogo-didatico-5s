// Estrelas caindo do topo — disparadas ao concluir uma fase.
import { useEffect, useRef } from 'react'

const COLORS = ['#f9a825', '#f47a20', '#ffffff', '#ffe082', '#ffcc02']
const STAR_COUNT = 38

interface Star {
  x: number
  y: number
  vy: number
  vx: number
  size: number
  color: string
  rotation: number
  rotSpeed: number
  opacity: number
}

function makeStar(w: number): Star {
  return {
    x: Math.random() * w,
    y: -20 - Math.random() * 80,
    vy: 3 + Math.random() * 5,
    vx: (Math.random() - 0.5) * 2,
    size: 10 + Math.random() * 18,
    color: COLORS[Math.floor(Math.random() * COLORS.length)] ?? '#f9a825',
    rotation: Math.random() * 360,
    rotSpeed: (Math.random() - 0.5) * 8,
    opacity: 0.85 + Math.random() * 0.15,
  }
}

function drawStar(ctx: CanvasRenderingContext2D, s: Star): void {
  const { x, y, size, color, rotation, opacity } = s
  ctx.save()
  ctx.globalAlpha = opacity
  ctx.translate(x, y)
  ctx.rotate((rotation * Math.PI) / 180)
  ctx.fillStyle = color
  ctx.shadowColor = color
  ctx.shadowBlur = 8
  ctx.restore()

  // Estrela de 5 pontas correta (10 vértices alternando raio externo/interno)
  ctx.save()
  ctx.globalAlpha = opacity
  ctx.translate(x, y)
  ctx.rotate((rotation * Math.PI) / 180)
  ctx.fillStyle = color
  ctx.shadowColor = color
  ctx.shadowBlur = 10
  ctx.beginPath()
  for (let i = 0; i < 10; i++) {
    const angle = (i * Math.PI) / 5 - Math.PI / 2
    const r = i % 2 === 0 ? size : size * 0.42
    if (i === 0) ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r)
    else ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r)
  }
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

interface Props {
  onDone: () => void
}

export function StarsFall({ onDone }: Props): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas === null) return
    const ctx = canvas.getContext('2d')
    if (ctx === null) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const stars: Star[] = Array.from({ length: STAR_COUNT }, () => makeStar(canvas.width))
    let rafId = 0
    let done = 0

    const tick = (): void => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      let finished = 0
      for (const s of stars) {
        s.y += s.vy
        s.x += s.vx
        s.vy += 0.18 // gravidade
        s.rotation += s.rotSpeed
        if (s.y > canvas.height + 30) {
          finished++
        } else {
          drawStar(ctx, s)
        }
      }

      if (finished < stars.length) {
        rafId = requestAnimationFrame(tick)
      } else {
        done++
        if (done === 1) onDone()
      }
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [onDone])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50"
    />
  )
}
