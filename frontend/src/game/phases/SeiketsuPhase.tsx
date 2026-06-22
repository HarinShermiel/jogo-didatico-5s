// SEIKETSU — Memoriza a sequência → Embaralha → Reordena → Verifica.
import { AnimatePresence, motion } from 'framer-motion'
import { useRef, useState } from 'react'
import { useGameStore } from '../../store/gameStore'
import type { SeiketsuPhase as SeiketsuData, SeiketsuSlot } from '../../types'
import { ItemFigure } from '../ItemFigure'
import { PhaseBackground } from '../PhaseBackground'

interface Props {
  fase: SeiketsuData
}

export function SeiketsuPhase({ fase }: Props): JSX.Element {
  const dispatch   = useGameStore((s) => s.dispatch)
  const [esperando, setEsperando] = useState(false)

  // ordem local — começa igual ao que o backend manda em `atual`
  const [ordem, setOrdem] = useState<SeiketsuSlot[]>(() => [...fase.atual])

  // sincroniza com backend quando `atual` muda (após verificar)
  const prevAtual = useRef(fase.atual)
  if (fase.atual !== prevAtual.current) {
    prevAtual.current = fase.atual
    setOrdem([...fase.atual])
  }

  // ── drag ref — deve ficar ANTES de qualquer return condicional ───────────
  const dragIdx = useRef<number | null>(null)

  const concluido = fase.atual.every((s) => s.acertou === true)

  // ── Fase 1: Memorizar a sequência ────────────────────────────────────────
  if (!fase.snapshot) {
    return (
      <PhaseBackground senso="SEIKETSU">
        <div className="flex min-h-screen flex-col items-center justify-center p-4 pt-20">
          <div className="w-full max-w-3xl space-y-5 text-center">
            <div>
              <h2 className="text-xl font-black text-white">📐 Memorize a Sequência</h2>
              <p className="mt-1 text-sm text-white/70">
                Grave a ordem dos itens. Ao embaralhar, você terá que recolocá-los na posição certa.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {fase.referencia.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  className="flex flex-col items-center rounded-2xl bg-white p-4 text-center shadow-lg"
                >
                  <ItemFigure emoji={item.emoji} size={56} />
                  <p className="mt-2 text-xs font-bold text-marca-azul">{item.nome}</p>
                </motion.div>
              ))}
            </div>

            <button
              onClick={() => {
                setEsperando(true)
                void dispatch('seiketsu.snapshot', {}).then(() => setEsperando(false))
              }}
              disabled={esperando}
              className="rounded-2xl px-10 py-4 text-base font-black text-white shadow-xl transition hover:brightness-110 disabled:opacity-50"
              style={{ background: '#f47a20' }}
            >
              {esperando ? '⏳ Embaralhando...' : '🔀 Embaralhar'}
            </button>
          </div>
        </div>
      </PhaseBackground>
    )
  }

  // ── Fase 2: Reordenar ────────────────────────────────────────────────────
  const onDragStart = (idx: number) => { dragIdx.current = idx }

  const onDrop = (targetIdx: number) => {
    const from = dragIdx.current
    if (from === null || from === targetIdx) return
    const next = [...ordem]
    const [moved] = next.splice(from, 1)
    if (moved === undefined) return
    next.splice(targetIdx, 0, moved)
    // limpa feedback local ao reordenar
    setOrdem(next.map((s) => ({ ...s, acertou: null, avaliado: null })))
    dragIdx.current = null
  }

  const doVerificar = () => {
    if (esperando) return
    setEsperando(true)
    void dispatch('seiketsu.reordenar', { ids_ordem: ordem.map((s) => s.id) })
      .then(() => setEsperando(false))
  }

  return (
    <PhaseBackground senso="SEIKETSU">
      <div className="flex min-h-screen flex-col items-center justify-center p-4 pt-20">
        <div className="w-full max-w-3xl space-y-5">

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-white">📐 Recoloque na ordem certa</h2>
              <p className="text-sm text-white/70">
                Arraste os cards para reconstruir a sequência que você memorizou.
              </p>
            </div>
            <div
              className="rounded-full px-4 py-1.5 text-sm font-extrabold text-white shadow-lg"
              style={{ background: concluido ? '#3FA34D' : '#f47a20' }}
            >
              {fase.atual.filter((s) => s.acertou === true).length}/{fase.atual.length} ✓
            </div>
          </div>

          {/* Grade drag-and-drop */}
          <div className="grid grid-cols-3 gap-3">
            {ordem.map((slot, idx) => {
              // pega o feedback do backend (acertou) pelo id
              const backendAcertou = fase.atual.find((s) => s.id === slot.id)?.acertou ?? null
              return (
                <DraggableCard
                  key={slot.id}
                  slot={{ ...slot, acertou: backendAcertou }}
                  onDragStart={() => onDragStart(idx)}
                  onDrop={() => onDrop(idx)}
                />
              )
            })}
          </div>

          {/* Botões */}
          <div className="flex justify-center gap-4">
            {!concluido && (
              <button
                onClick={doVerificar}
                disabled={esperando}
                className="rounded-2xl px-10 py-3 text-sm font-black text-white shadow-xl transition hover:brightness-110 disabled:opacity-50"
                style={{ background: '#f47a20' }}
              >
                {esperando ? '⏳ Verificando...' : '✅ Verificar ordem'}
              </button>
            )}
          </div>

          {/* Concluído */}
          <AnimatePresence>
            {concluido && (
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-green-500/80 py-4 text-center font-black text-white shadow-xl"
              >
                🏆 Sequência perfeita! Padrão documentado.
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </PhaseBackground>
  )
}

// ─── Card arrastável ─────────────────────────────────────────────────────────
interface CardProps {
  slot: SeiketsuSlot
  onDragStart: () => void
  onDrop: () => void
}

function DraggableCard({ slot, onDragStart, onDrop }: CardProps): JSX.Element {
  const [over, setOver] = useState(false)

  const borderColor = slot.acertou === true
    ? '#3FA34D'
    : slot.acertou === false
      ? '#ef4444'
      : over ? '#f47a20' : 'rgba(0,0,0,0.08)'

  const shadow = slot.acertou === true
    ? '0 0 18px rgba(63,163,77,0.5)'
    : slot.acertou === false
      ? '0 0 18px rgba(239,68,68,0.5)'
      : over ? '0 0 18px rgba(244,122,32,0.45)' : '0 4px 16px rgba(0,0,0,0.12)'

  return (
    <motion.div
      layout
      draggable
      onDragStart={onDragStart}
      onDragOver={(e) => { e.preventDefault(); setOver(true) }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); onDrop() }}
      className="flex flex-col items-center rounded-2xl bg-white p-4 text-center select-none"
      style={{
        cursor: 'grab',
        border: `2.5px solid ${borderColor}`,
        boxShadow: shadow,
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
      animate={{ scale: over ? 1.04 : 1 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
    >
      <ItemFigure emoji={slot.emoji} size={52} />
      <p className="mt-2 text-xs font-bold text-marca-azul leading-tight">{slot.nome}</p>

      <AnimatePresence>
        {slot.acertou === true && (
          <motion.span key="ok" initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-1 text-base">✅</motion.span>
        )}
        {slot.acertou === false && (
          <motion.span key="err" initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-1 text-base">❌</motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
