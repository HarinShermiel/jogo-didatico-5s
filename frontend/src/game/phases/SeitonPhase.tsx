// SEITON — A prateleira pede um item. O usuário acha na esteira e arrasta até o slot.
// Esteira corre em CSS animation pura (loop contínuo, sem reset visível).
import { AnimatePresence, motion } from 'framer-motion'
import { useRef, useState } from 'react'
import { useGameStore } from '../../store/gameStore'
import type { SeitonItem } from '../../types'
import { ItemFigure } from '../ItemFigure'

// Espaçamento fixo por vaga na esteira (px)
const SLOT_W = 220

interface Props {
  itens: SeitonItem[]
}

export function SeitonPhase({ itens }: Props): JSX.Element {
  const dispatch  = useGameStore((s) => s.dispatch)
  const pendentes = itens.filter((i) => i.encaixadoEm === null)
  const colocados = itens.filter((i) => i.encaixadoEm === i.slot)
  const concluido = colocados.length === itens.length && itens.length > 0
  const alvo      = itens.find((i) => i.encaixadoEm === null) ?? null

  const slotRefs  = useRef<Record<string, HTMLDivElement | null>>({})
  const [bloqueado, setBloqueado] = useState(false)
  const [errou, setErrou]         = useState<string | null>(null)

  const tentar = (itemId: string, slot: string): void => {
    if (bloqueado) return
    setBloqueado(true)
    void dispatch('seiton.encaixar', { itemId, slot }).then(() => {
      const { state } = useGameStore.getState()
      const depois = state?.phases.SEITON.find((i: SeitonItem) => i.id === itemId)
      if (depois?.encaixadoEm === slot) {
        setBloqueado(false)
      } else {
        setErrou(itemId)
        setTimeout(() => { setErrou(null); setBloqueado(false) }, 1600)
      }
    })
  }

  const onSlotDragOver = (e: React.DragEvent): void => { e.preventDefault() }
  const onSlotDrop     = (e: React.DragEvent, slot: string): void => {
    e.preventDefault()
    const id = e.dataTransfer.getData('itemId')
    if (id !== '') tentar(id, slot)
  }

  return (
    <div
      className="fixed inset-0 flex flex-col"
      style={{ backgroundImage: 'url(/bancada-seiton.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="absolute inset-0 bg-black/45" />

      {/* ── Prateleira ─────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-1 items-center justify-center pt-16">
        <div className="w-full max-w-3xl px-6">

          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-bold text-white/80">
              {alvo !== null
                ? <>Ache <span className="text-marca-laranja font-black">{alvo.nome}</span> na esteira e arraste até o slot piscando</>
                : '🏆 Tudo no lugar!'}
            </p>
            <div
              className="rounded-full px-3 py-1 text-sm font-extrabold text-white"
              style={{ background: concluido ? '#3FA34D' : '#f47a20' }}
            >
              {colocados.length}/{itens.length} ✓
            </div>
          </div>

          <div
            className="rounded-2xl p-4"
            style={{ background: 'rgba(20,30,50,0.72)', backdropFilter: 'blur(6px)', border: '1.5px solid rgba(255,255,255,0.12)' }}
          >
            <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-white/40">🗄️ Prateleira</p>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
              {itens.map((item) => {
                const colocado = item.encaixadoEm === item.slot
                const éAlvo   = alvo?.id === item.id && !colocado
                return (
                  <motion.div
                    key={item.slot}
                    ref={(el) => { slotRefs.current[item.slot] = el }}
                    onDragOver={onSlotDragOver}
                    onDrop={(e) => onSlotDrop(e, item.slot)}
                    className="relative flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-dashed"
                    animate={
                      éAlvo
                        ? { borderColor: ['#f47a20', '#ffffff', '#f47a20'], backgroundColor: ['rgba(244,122,32,0.12)', 'rgba(244,122,32,0.32)', 'rgba(244,122,32,0.12)'], scale: [1, 1.05, 1] }
                        : colocado
                          ? { borderColor: '#3FA34D', backgroundColor: 'rgba(63,163,77,0.15)', scale: 1 }
                          : { borderColor: 'rgba(255,255,255,0.18)', backgroundColor: 'rgba(255,255,255,0.04)', scale: 1 }
                    }
                    transition={éAlvo ? { duration: 0.85, repeat: Infinity } : { duration: 0.2 }}
                  >
                    <AnimatePresence mode="wait">
                      {colocado ? (
                        <motion.div key="ok" className="flex flex-col items-center gap-0.5"
                          initial={{ scale: 0, rotate: -15 }} animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', stiffness: 360, damping: 18 }}>
                          <ItemFigure emoji={item.emoji} size={44} />
                          <span className="text-[8px] font-bold text-white/80 text-center leading-tight truncate w-full px-1">{item.nome}</span>
                          <span className="text-green-400 text-xs">✅</span>
                        </motion.div>
                      ) : (
                        <motion.div key="vazio" className="flex flex-col items-center gap-0.5"
                          style={{ opacity: éAlvo ? 0.75 : 0.22 }}>
                          <ItemFigure emoji={item.emoji} size={40} grayscale />
                          <span className="text-[8px] font-bold text-white/50 text-center">{item.slot.replace('slot-', '').toUpperCase()}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </div>
          </div>

          <AnimatePresence>
            {concluido && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="mt-4 rounded-2xl bg-green-500/80 py-3 text-center font-black text-white shadow-xl">
                🏆 Tudo no lugar! Avance para o próximo senso.
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Esteira ─────────────────────────────────────────────────── */}
      <div className="relative z-10 shrink-0 overflow-hidden" style={{ height: 156 }}>
        <div className="absolute inset-0 bg-gray-900/85 border-t-4 border-gray-600" />

        {/* Listras CSS puras — nunca param */}
        <BeltStripes />

        {pendentes.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-sm font-bold text-white/50">Esteira vazia!</p>
          </div>
        ) : (
          <Belt itens={pendentes} errou={errou} alvoId={alvo?.id ?? null} />
        )}
      </div>

      {/* Injeção do keyframe CSS */}
      <style>{`
        @keyframes belt-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes belt-stripe {
          from { left: 0%; }
          to   { left: -7.15%; }
        }
      `}</style>
    </div>
  )
}

function BeltStripes(): JSX.Element {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-35 pointer-events-none">
      {Array.from({ length: 14 }, (_, i) => (
        <div
          key={i}
          className="absolute top-0 bottom-0 w-7 bg-gray-500"
          style={{
            left: `${(i / 14) * 100}%`,
            transform: 'skewX(-18deg)',
            animation: 'belt-stripe 1.4s linear infinite',
          }}
        />
      ))}
    </div>
  )
}

function Belt({
  itens, errou, alvoId,
}: {
  itens: SeitonItem[]
  errou: string | null
  alvoId: string | null
}): JSX.Element {
  // Duplica para loop: desloca 50% do total = comprimento de uma cópia
  const loop     = [...itens, ...itens]
  const totalPx  = itens.length * SLOT_W
  const duration = itens.length * 5  // s — quanto mais itens, mais devagar

  return (
    <div className="absolute inset-0 flex items-center overflow-hidden">
      <div
        style={{
          display: 'flex',
          width: totalPx * 2,          // 2 cópias
          animation: `belt-scroll ${duration}s linear infinite`,
          willChange: 'transform',
        }}
      >
        {loop.map((item, idx) => {
          const isAlvo  = item.id === alvoId
          const isErrou = item.id === errou
          return (
            <div
              key={`${item.id}-${idx}`}
              style={{ width: SLOT_W, display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}
            >
              <motion.div
                animate={
                  isErrou
                    ? { x: [0, -10, 10, -8, 8, 0], rotate: [0, -5, 5, -3, 3, 0] }
                    : isAlvo
                      ? { y: [0, -8, 0] }
                      : {}
                }
                transition={
                  isErrou
                    ? { duration: 0.5 }
                    : isAlvo
                      ? { duration: 1.1, repeat: Infinity, ease: 'easeInOut' }
                      : {}
                }
              >
                <div
                  draggable
                  onDragStart={(e: React.DragEvent) => { e.dataTransfer.setData('itemId', item.id) }}
                  onDragEnd={(e: React.DragEvent) => {
                    // drop fora de slot — ignora
                    e.preventDefault()
                  }}
                  className="flex w-24 flex-col items-center rounded-2xl bg-white px-2 py-3 shadow-xl cursor-grab active:cursor-grabbing select-none"
                  style={{
                    border:  isAlvo ? '3px solid #f47a20' : '2px solid rgba(0,0,0,0.08)',
                    opacity: isAlvo ? 1 : 0.75,
                    filter:  isAlvo ? 'drop-shadow(0 0 14px rgba(244,122,32,0.9))' : 'none',
                  }}
                >
                  <ItemFigure emoji={item.emoji} size={46} />
                  <span className="mt-1 text-[9px] font-bold text-center text-marca-azul leading-tight">{item.nome}</span>
                </div>
              </motion.div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
