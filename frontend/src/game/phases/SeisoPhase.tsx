// SEISO — Limpar é inspecionar. Esfregue cada área para revelar o achado e,
// com critério, decida: registrar a anomalia ou ignorar (limpeza ≠ etiqueta).
import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useRef } from 'react'
import { useGameStore } from '../../store/gameStore'
import type { SeisoTile } from '../../types'
import { ItemFigure } from '../ItemFigure'
import { PhaseBackground } from '../PhaseBackground'

interface Props {
  tiles: SeisoTile[]
}

export function SeisoPhase({ tiles }: Props): JSX.Element {
  const dispatch = useGameStore((s) => s.dispatch)
  const decididos = tiles.filter((t) => t.decisao !== null).length
  const concluido = decididos === tiles.length && tiles.length > 0

  return (
    <PhaseBackground senso="SEISO">
      <div className="flex min-h-screen items-center justify-center p-4 pt-24">
        <div className="w-full max-w-3xl space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-white">🧽 Inspeção de Limpeza</h2>
              <p className="text-sm text-white/70">
                Esfregue cada superfície e julgue: registre o que é anomalia, ignore o resto.
              </p>
            </div>
            <div
              className="rounded-full px-4 py-1.5 text-sm font-extrabold text-white shadow-lg transition-colors"
              style={{ background: concluido ? '#3FA34D' : '#f47a20' }}
            >
              {decididos}/{tiles.length} ✓
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {tiles.map((tile) => (
              <Tile
                key={tile.id}
                tile={tile}
                onLimpar={() => void dispatch('seiso.limpar', { tileId: tile.id })}
                onDecidir={(decisao) => void dispatch('seiso.decidir', { tileId: tile.id, decisao })}
              />
            ))}
          </div>
        </div>
      </div>
    </PhaseBackground>
  )
}

interface TileProps {
  tile: SeisoTile
  onLimpar: () => void
  onDecidir: (decisao: 'registrar' | 'ignorar') => void
}

function Tile({ tile, onLimpar, onDecidir }: TileProps): JSX.Element {
  const decidido = tile.decisao !== null
  return (
    <motion.div
      layout
      className="relative flex min-h-[200px] flex-col items-center overflow-hidden rounded-3xl bg-white p-4 text-center shadow-xl"
    >
      <ItemFigure emoji={tile.emoji} size={56} />
      <p className="mt-1.5 text-sm font-bold text-marca-azul">{tile.nome}</p>

      {/* Camada raspadinha — arraste para revelar */}
      <AnimatePresence>
        {!tile.limpo && (
          <motion.div
            className="absolute inset-0"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Scratcher onComplete={onLimpar} nome={tile.nome} />
          </motion.div>
        )}
      </AnimatePresence>

      {tile.limpo && tile.descricao !== null && (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 rounded-lg bg-marca-azul/5 px-2 py-1.5 text-[11px] font-medium italic text-marca-azul"
        >
          &ldquo;{tile.descricao}&rdquo;
        </motion.p>
      )}

      {tile.limpo && !decidido && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-auto flex w-full gap-1.5 pt-3"
        >
          <button
            onClick={() => onDecidir('registrar')}
            className="flex-1 rounded-xl bg-marca-laranja px-1 py-2 text-[11px] font-bold text-white transition hover:brightness-110"
            aria-label={`Registrar anomalia em ${tile.nome}`}
          >
            🚩 Registrar
          </button>
          <button
            onClick={() => onDecidir('ignorar')}
            className="flex-1 rounded-xl bg-gray-200 px-1 py-2 text-[11px] font-bold text-gray-600 transition hover:bg-gray-300"
            aria-label={`Ignorar ${tile.nome}`}
          >
            🙈 Ignorar
          </button>
        </motion.div>
      )}

      {decidido && <Resultado tile={tile} />}
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Raspadinha (canvas-based scratcher)
// ---------------------------------------------------------------------------

// Cores de sujeira para as partículas
const DIRT_COLORS = ['#78563a', '#5a3e28', '#9c7a52', '#b59166', '#4a3520', '#6b5040']

interface ScratcherProps {
  onComplete: () => void
  nome: string
}

function Scratcher({ onComplete, nome }: ScratcherProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particleContainerRef = useRef<HTMLDivElement>(null)
  const isPainting = useRef(false)
  const moveCount = useRef(0)
  const done = useRef(false)

  // Inicializa a camada de sujeira + dica embutida
  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas === null) return
    const ctx = canvas.getContext('2d')
    if (ctx === null) return

    const W = canvas.width
    const H = canvas.height

    // Fundo cinza sujo
    ctx.fillStyle = '#6b7280'
    ctx.fillRect(0, 0, W, H)

    // Listras diagonais (textura de sujeira)
    ctx.strokeStyle = '#9ca3af'
    ctx.lineWidth = 7
    for (let i = -H; i < W + H; i += 14) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i + H, H)
      ctx.stroke()
    }

    // Dica desenhada no próprio canvas — some conforme esfrega
    ctx.font = `bold ${Math.round(W * 0.13)}px sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = 'rgba(255,255,255,0.92)'
    ctx.fillText('🧽', W / 2, H / 2 - H * 0.08)
    ctx.font = `bold ${Math.round(W * 0.065)}px sans-serif`
    ctx.fillStyle = 'rgba(255,255,255,0.85)'
    ctx.fillText('Esfregue!', W / 2, H / 2 + H * 0.1)
  }, [])

  const xyFromCanvas = (
    clientX: number,
    clientY: number,
    canvas: HTMLCanvasElement,
  ): [number, number] => {
    const r = canvas.getBoundingClientRect()
    return [
      ((clientX - r.left) * canvas.width) / r.width,
      ((clientY - r.top) * canvas.height) / r.height,
    ]
  }

  const spawnParticles = useCallback((canvasX: number, canvasY: number) => {
    const container = particleContainerRef.current
    const canvas = canvasRef.current
    if (container === null || canvas === null) return

    const rect = canvas.getBoundingClientRect()
    // converter coordenadas canvas → px do container
    const px = (canvasX / canvas.width) * rect.width
    const py = (canvasY / canvas.height) * rect.height

    const count = 3 + Math.floor(Math.random() * 3) // 3–5 bolinhas
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('span')
      const size = 4 + Math.random() * 6 // 4–10px
      const color = DIRT_COLORS[Math.floor(Math.random() * DIRT_COLORS.length)] ?? '#78563a'
      const angle = Math.random() * Math.PI * 2
      const dist = 20 + Math.random() * 40
      const tx = Math.cos(angle) * dist
      const ty = Math.sin(angle) * dist + 30 // gravidade: vai pra baixo
      const dur = 400 + Math.random() * 300

      dot.style.cssText = `
        position: absolute;
        left: ${px}px;
        top: ${py}px;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: ${color};
        pointer-events: none;
        transform: translate(-50%, -50%);
        opacity: 1;
        transition: transform ${dur}ms ease-out, opacity ${dur}ms ease-out;
      `
      container.appendChild(dot)

      // Forçar reflow antes de animar
      void dot.offsetWidth

      dot.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px))`
      dot.style.opacity = '0'

      setTimeout(() => dot.remove(), dur + 50)
    }
  }, [])

  const scratch = useCallback(
    (x: number, y: number) => {
      const canvas = canvasRef.current
      if (canvas === null || done.current) return
      const ctx = canvas.getContext('2d')
      if (ctx === null) return

      ctx.globalCompositeOperation = 'destination-out'
      ctx.beginPath()
      ctx.arc(x, y, 32, 0, Math.PI * 2)
      ctx.fill()

      // Spawn partículas a cada 2 movimentos para não sobrecarregar
      moveCount.current++
      if (moveCount.current % 2 === 0) spawnParticles(x, y)

      if (moveCount.current % 6 === 0) {
        const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data
        let transparent = 0
        for (let i = 3; i < pixels.length; i += 4) {
          const alpha = pixels[i]
          if (alpha !== undefined && alpha < 128) transparent++
        }
        const pct = (transparent / (canvas.width * canvas.height)) * 100
        if (pct >= 55) {
          done.current = true
          onComplete()
        }
      }
    },
    [onComplete, spawnParticles],
  )

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isPainting.current = true
    const [x, y] = xyFromCanvas(e.clientX, e.clientY, e.currentTarget)
    scratch(x, y)
  }

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPainting.current) return
    const [x, y] = xyFromCanvas(e.clientX, e.clientY, e.currentTarget)
    scratch(x, y)
  }

  const stopPainting = () => {
    isPainting.current = false
  }

  const onTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    isPainting.current = true
    const t = e.touches[0]
    if (t === undefined) return
    const [x, y] = xyFromCanvas(t.clientX, t.clientY, e.currentTarget)
    scratch(x, y)
  }

  const onTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    if (!isPainting.current) return
    const t = e.touches[0]
    if (t === undefined) return
    const [x, y] = xyFromCanvas(t.clientX, t.clientY, e.currentTarget)
    scratch(x, y)
  }

  return (
    <div className="absolute inset-0 overflow-hidden rounded-3xl">
      <canvas
        ref={canvasRef}
        width={300}
        height={300}
        className="absolute inset-0 h-full w-full cursor-crosshair"
        style={{ touchAction: 'none' }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={stopPainting}
        onMouseLeave={stopPainting}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={stopPainting}
        aria-label={`Esfregar ${nome} para revelar`}
      />
      {/* Container das partículas de sujeira — por cima do canvas, pointer-events off */}
      <div ref={particleContainerRef} className="pointer-events-none absolute inset-0" />
    </div>
  )
}

function Resultado({ tile }: { tile: SeisoTile }): JSX.Element {
  const registrou = tile.decisao === 'registrar'
  const ok = tile.acertou === true
  const texto = ok
    ? registrou
      ? '✅ Anomalia registrada'
      : '✅ Ignorado com razão'
    : registrou
      ? '⚠️ Falso positivo'
      : '❌ Anomalia ignorada'
  return (
    <motion.p
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 320, damping: 18 }}
      className={`mt-auto pt-3 text-xs font-bold ${ok ? 'text-senso-seiso' : 'text-red-500'}`}
    >
      {texto}
    </motion.p>
  )
}
