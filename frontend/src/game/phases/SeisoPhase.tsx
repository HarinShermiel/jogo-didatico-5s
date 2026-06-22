// SEISO — Seleciona ferramenta → mouse vira emoji → esfrega nas manchas.
import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useGameStore } from '../../store/gameStore'
import type { SeisoTile } from '../../types'

// Aroldo ocupa canto sup-esq — sem spots nessa área
const SPOT_DEFS = [
  { left: '48%', top: '80%', tipo: 'chao'   as const },
  { left: '70%', top: '76%', tipo: 'chao'   as const },
  { left: '30%', top: '82%', tipo: 'chao'   as const },
  { left: '55%', top: '52%', tipo: 'objeto' as const },
  { left: '82%', top: '48%', tipo: 'objeto' as const },
  { left: '40%', top: '38%', tipo: 'objeto' as const },
]

type Ferramenta = 'vassoura' | 'pano' | null

interface Props {
  tiles: SeisoTile[]
}

// Intervalo em ms entre o aparecimento de cada nova sujeira
const SPAWN_INTERVAL = 4000

export function SeisoPhase({ tiles }: Props): JSX.Element {
  const dispatch    = useGameStore((s) => s.dispatch)
  const decididos   = tiles.filter((t) => t.decisao !== null).length
  const concluido   = decididos === tiles.length && tiles.length > 0

  const [ferramenta, setFerramenta]       = useState<Ferramenta>(null)
  const [cursorPos, setCursorPos]         = useState({ x: -300, y: -300 })
  const [decidindoIdx, setDecidindoIdx]   = useState<number | null>(null)
  const [visíveis, setVisíveis]           = useState(1)

  // Spawna uma sujeira nova a cada SPAWN_INTERVAL até mostrar todas
  useEffect(() => {
    if (visíveis >= tiles.length) return
    const id = setInterval(() => {
      setVisíveis((v) => Math.min(v + 1, tiles.length))
    }, SPAWN_INTERVAL)
    return () => clearInterval(id)
  }, [visíveis, tiles.length])

  // expõe mouse globalmente para DirtSpot
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
      (window as unknown as { __seisoMouseX: number }).__seisoMouseX = e.clientX;
      (window as unknown as { __seisoMouseY: number }).__seisoMouseY = e.clientY
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  const handleLimpo = (idx: number) => {
    void dispatch('seiso.limpar', { tileId: tiles[idx]?.id ?? '' }).then(() => {
      setDecidindoIdx(idx)
    })
  }

  const handleDecidir = (decisao: 'registrar' | 'ignorar') => {
    if (decidindoIdx === null) return
    void dispatch('seiso.decidir', { tileId: tiles[decidindoIdx]?.id ?? '', decisao })
    setDecidindoIdx(null)
  }

  const cursorEmoji = ferramenta === 'vassoura' ? '🧹' : ferramenta === 'pano' ? '🧻' : null

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{ cursor: cursorEmoji !== null ? 'none' : 'default' }}
    >
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{ backgroundImage: 'url(/escritorio-seiso.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}
      />
      <div className="absolute inset-0 bg-black/10" />

      {/* HUD topo */}
      <div className="absolute top-0 left-0 right-0 z-20 px-6 pt-4 space-y-2">
        <div className="flex items-center justify-between">
          <p className="rounded-xl bg-black/50 px-3 py-1.5 text-sm font-bold text-white backdrop-blur">
            {ferramenta === null
              ? 'Escolha uma ferramenta abaixo'
              : ferramenta === 'vassoura'
                ? '🧹 Esfregue no chão'
                : '🧻 Passe nos objetos'}
          </p>
          <div
            className="rounded-full px-4 py-1.5 text-sm font-extrabold text-white shadow-lg"
            style={{ background: concluido ? '#3FA34D' : '#f47a20' }}
          >
            {decididos}/{tiles.length} ✓
          </div>
        </div>

        {/* Barra de progresso geral */}
        <div className="w-full rounded-full overflow-hidden bg-black/40 backdrop-blur" style={{ height: 10 }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: concluido ? '#3FA34D' : '#f47a20' }}
            animate={{ width: `${tiles.length > 0 ? (decididos / tiles.length) * 100 : 0}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* Seletor de ferramenta — barra inferior */}
      <div className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2 flex gap-4">
        {(['vassoura', 'pano'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFerramenta((prev) => prev === f ? null : f)}
            className="flex flex-col items-center rounded-2xl px-5 py-3 text-3xl shadow-xl transition-all"
            style={{
              background: ferramenta === f ? '#f47a20' : 'rgba(255,255,255,0.85)',
              border: ferramenta === f ? '2px solid #fff' : '2px solid rgba(0,0,0,0.1)',
              transform: ferramenta === f ? 'scale(1.15)' : 'scale(1)',
            }}
          >
            {f === 'vassoura' ? '🧹' : '🧻'}
            <span className="text-[10px] font-bold mt-1" style={{ color: ferramenta === f ? '#fff' : '#374151' }}>
              {f === 'vassoura' ? 'chão' : 'objeto'}
            </span>
          </button>
        ))}
      </div>

      {/* Manchas — aparecem progressivamente */}
      {tiles.slice(0, visíveis).map((tile, idx) => {
        const def = SPOT_DEFS[idx]
        if (def === undefined || tile.limpo) return null
        return (
          <DirtSpot
            key={tile.id}
            tile={tile}
            def={def}
            ferramenta={ferramenta}
            onLimpo={() => handleLimpo(idx)}
          />
        )
      })}

      {/* Brilho pós-limpeza */}
      {tiles.slice(0, visíveis).map((tile, idx) => {
        const def = SPOT_DEFS[idx]
        if (def === undefined || !tile.limpo) return null
        return <ShineEffect key={`shine-${tile.id}`} left={def.left} top={def.top} />
      })}

      {/* Painel de decisão */}
      <AnimatePresence>
        {decidindoIdx !== null && (() => {
          const tile = tiles[decidindoIdx]
          if (tile === undefined) return null
          return (
            <motion.div
              key="decidir"
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 z-30 flex items-center justify-center"
            >
              <div className="rounded-3xl bg-white/95 p-7 shadow-2xl text-center max-w-sm w-full mx-4 backdrop-blur">
                <p className="text-4xl mb-2">{tile.emoji}</p>
                <p className="font-black text-marca-azul text-lg mb-1">{tile.nome}</p>
                {tile.descricao !== null && (
                  <p className="text-sm italic text-gray-500 mb-4">&ldquo;{tile.descricao}&rdquo;</p>
                )}
                <p className="text-sm font-bold text-gray-700 mb-4">O que você encontrou?</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleDecidir('registrar')}
                    className="flex-1 rounded-2xl bg-marca-laranja py-3 text-sm font-black text-white shadow hover:brightness-110 transition"
                  >
                    🚩 Registrar anomalia
                  </button>
                  <button
                    onClick={() => handleDecidir('ignorar')}
                    className="flex-1 rounded-2xl bg-gray-100 py-3 text-sm font-black text-gray-600 shadow hover:bg-gray-200 transition"
                  >
                    🙈 Ignorar
                  </button>
                </div>
              </div>
            </motion.div>
          )
        })()}
      </AnimatePresence>

      {/* Cursor emoji seguindo o mouse */}
      {cursorEmoji !== null && (
        <div
          className="pointer-events-none fixed z-50 select-none"
          style={{
            left: cursorPos.x,
            top: cursorPos.y,
            transform: 'translate(-30%, -70%)',
            fontSize: 34,
            filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.5))',
          }}
        >
          {cursorEmoji}
        </div>
      )}
    </div>
  )
}

// ─── Mancha de sujeira ───────────────────────────────────────────────────────
interface DirtSpotProps {
  tile: SeisoTile
  def: { left: string; top: string; tipo: 'chao' | 'objeto' }
  ferramenta: Ferramenta
  onLimpo: () => void
}

function DirtSpot({ tile, def, ferramenta, onLimpo }: DirtSpotProps): JSX.Element {
  const [progress, setProgress] = useState(0)
  const done    = useRef(false)
  const isOver  = useRef(false)
  const lastPos = useRef<{ x: number; y: number } | null>(null)
  const raf        = useRef<number | null>(null)
  const spotRef    = useRef<HTMLDivElement>(null)

  const ferramentaCerta: Ferramenta = def.tipo === 'chao' ? 'vassoura' : 'pano'

  const addProgress = useCallback((delta: number) => {
    if (done.current) return
    setProgress((p) => {
      const next = Math.min(100, p + delta)
      if (next >= 100 && !done.current) {
        done.current = true
        setTimeout(onLimpo, 150)
      }
      return next
    })
  }, [onLimpo])

  // RAF: detecta movimento do mouse sobre a mancha com ferramenta certa + botão pressionado
  useEffect(() => {
    const tick = () => {
      raf.current = requestAnimationFrame(tick)
      if (ferramenta !== ferramentaCerta || !isOver.current) {
        lastPos.current = null
        return
      }
      const mx = (window as unknown as { __seisoMouseX?: number }).__seisoMouseX ?? 0
      const my = (window as unknown as { __seisoMouseY?: number }).__seisoMouseY ?? 0
      const curr = { x: mx, y: my }
      if (lastPos.current !== null) {
        const dx = curr.x - lastPos.current.x
        const dy = curr.y - lastPos.current.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        addProgress(dist * 0.35)
      }
      lastPos.current = curr
    }
    raf.current = requestAnimationFrame(tick)
    return () => { if (raf.current !== null) cancelAnimationFrame(raf.current) }
  }, [ferramenta, ferramentaCerta, addProgress])

  if (tile.limpo) return <></>

  const SIZE = def.tipo === 'chao' ? 90 : 70
  const ativa = ferramenta === ferramentaCerta

  return (
    <div
      ref={spotRef}
      className="absolute z-10"
      style={{ left: def.left, top: def.top, transform: 'translate(-50%, -50%)', width: SIZE, height: SIZE }}
      onMouseEnter={() => { isOver.current = true }}
      onMouseLeave={() => { isOver.current = false; lastPos.current = null }}
    >
      {/* Mancha */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{ opacity: 1 - progress / 100 }}
        style={{
          background: def.tipo === 'chao'
            ? 'radial-gradient(circle, #6b4c2a 0%, #4a3218 60%, transparent 100%)'
            : 'radial-gradient(circle, #8B6914 0%, #5c4409 55%, transparent 100%)',
          cursor: ativa ? 'none' : 'default',
        }}
      />

      {/* Dica de ferramenta quando não está com a certa */}
      {progress < 5 && !ativa && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span style={{ fontSize: SIZE * 0.3, opacity: 0.5 }}>
            {def.tipo === 'chao' ? '🧹' : '🧻'}
          </span>
        </div>
      )}

      {/* Barra de progresso */}
      {progress > 0 && progress < 100 && (
        <div
          className="absolute -bottom-5 left-1/2 -translate-x-1/2 rounded-full overflow-hidden"
          style={{ width: SIZE, height: 5, background: 'rgba(0,0,0,0.25)' }}
        >
          <div className="h-full rounded-full bg-green-400" style={{ width: `${progress}%`, transition: 'width 0.08s' }} />
        </div>
      )}
    </div>
  )
}

// ─── Brilho pós-limpeza ──────────────────────────────────────────────────────
function ShineEffect({ left, top }: { left: string; top: string }): JSX.Element {
  return (
    <motion.div
      className="absolute z-10 pointer-events-none"
      style={{ left, top, transform: 'translate(-50%, -50%)' }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1.6, 1.8, 2.2] }}
      transition={{ duration: 3, times: [0, 0.15, 0.6, 1], ease: 'easeOut' }}
    >
      {[0, 45, 90, 135].map((deg) => (
        <div key={deg} className="absolute" style={{
          left: '50%', top: '50%', width: 3, height: 28,
          background: 'linear-gradient(180deg, rgba(255,255,180,0.9) 0%, transparent 100%)',
          borderRadius: 4,
          transform: `translate(-50%, -100%) rotate(${deg}deg)`,
          transformOrigin: 'bottom center',
        }} />
      ))}
      <div className="absolute rounded-full" style={{
        left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
        width: 18, height: 18,
        background: 'radial-gradient(circle, rgba(255,255,200,0.95) 0%, rgba(255,240,100,0.5) 60%, transparent 100%)',
      }} />
    </motion.div>
  )
}
